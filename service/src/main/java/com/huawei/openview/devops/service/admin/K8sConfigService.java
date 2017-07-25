package com.huawei.openview.devops.service.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.huawei.openview.devops.domain.dryrun.config.PodConfig;
import com.huawei.openview.devops.domain.dryrun.config.Resources;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.route.admin.CapacityPlanResource;
import com.huawei.openview.devops.util.HttpException;
import com.huawei.openview.devops.util.NamingConventionUtil;
import kikaha.urouting.api.Response;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.*;
import java.time.Duration;

import kikaha.config.Config;
import org.apache.commons.io.IOUtils;

import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * @author Qing Zhou
 */

@Slf4j
@Singleton
public class K8sConfigService {

	private final static String NODE_PORT = "NodePort";
	private final static String LOAD_BALANCER = "LoadBalancer";

	@Inject
	private Jackson jackson;

	@Inject
	private Config config;

	static public String getKindStr(JsonNode section) throws HttpException {
		JsonNode kindElem = section.get("kind");
		if (kindElem == null) {
			throw new HttpException(412, "kubeconfig does not include \"kind\". unable to determine the type.");
		}
		String kindStr = kindElem.textValue();
		return kindStr;
	}

	public String getSetName(JsonNode section) {
		JsonNode metadataElem = section.get("metadata");
		if (null!=metadataElem) {
			JsonNode nameObj = metadataElem.get("name");
			if (null!=nameObj) return nameObj.textValue();
			else {
				String name = "generated-name-" + UUID.randomUUID().toString();
				((ObjectNode)metadataElem).put("name", name);
				return name;
			}
		} else {
			String name = "generated-name-" + UUID.randomUUID().toString();
			HashMap<String, String> nameObj = new HashMap<>();
			nameObj.put("name", name);
			((ObjectNode)section).put("metadata", jackson.objectMapper().valueToTree(nameObj));
			return name;
		}
	}

	static public SetConfig getSetConfig(List<SetConfig> setConfigs, String setName) {
		for (SetConfig a_config : setConfigs) {
			if (a_config.getName().equals(setName)) {
				return a_config;
			}
		}
		return null;
	}

	private JsonNode createKeyValuePair(String name, String value) {
		HashMap<String, String> env = new HashMap<>();
		env.put("name", name);
		env.put("value", value);
		return jackson.objectMapper().valueToTree(env);
	}

	static public JsonNode getContainerElem(JsonNode specElem, String kindStr) throws HttpException {
		if (
				kindStr.equalsIgnoreCase("ReplicationController") || kindStr.equalsIgnoreCase("StatefulSet") ||
						kindStr.equalsIgnoreCase("ReplicaSet") ||	kindStr.equalsIgnoreCase("Deployment")
				) {
			return specElem.get("template").get("spec");
		} else if (kindStr.equals("Pod")) {
			return specElem;
		} else {
			return null;
		}
	}

	static public void changeSpecScale(String kindStr, JsonNode specElem, Long replicas) {
		if (kindStr.equalsIgnoreCase("ReplicationController") ||
				kindStr.equalsIgnoreCase("StatefulSet") ||
				kindStr.equalsIgnoreCase("ReplicaSet") ||
				kindStr.equalsIgnoreCase("Deployment") )
		{
			((ObjectNode)specElem).put("replicas", replicas);
			log.debug("scale is changed to " + replicas.toString());
		}
	}

	public ArrayNode getCapacityPlanner(String planName, String toplologyConfig, String influxdbDatabaseName) throws SQLException, IOException {
		log.debug("createCapacityPlanner - enter...");
		InputStream inputStream = CapacityPlanResource.class.getResourceAsStream(config.getString("deps.capacity_planner_k8s_configfile"));
		byte[] jsonData = IOUtils.toByteArray(inputStream);
		JsonNode rootNode = new ObjectMapper().readTree(jsonData);
		ArrayNode k8s_json_config = jackson.objectMapper().createArrayNode();
		for (JsonNode section : rootNode) {
			String kindStr = section.get("kind").asText();
			JsonNode metadataElem = section.get("metadata");
			if (kindStr.equalsIgnoreCase("pod")) {
				JsonNode containerSpecElem = section.get("spec");
				((ObjectNode) metadataElem).put("name", planName);
				changeNodeSelector(containerSpecElem, config.getConfig("deps.helper_node_selector"), null);
				JsonNode containerElem = containerSpecElem.get("containers").get(0);
				ArrayNode envArray = (ArrayNode) containerElem.get("env");
				envArray.add(createKeyValuePair("APPLICATION_TOPOLOGY", toplologyConfig));
				envArray.add(createKeyValuePair("INFLUXDB_ENDPOINT", config.getString("influxdb.endpoint")));
				envArray.add(createKeyValuePair("INFLUXDB_DATABASE", influxdbDatabaseName));
				envArray.add(createKeyValuePair("API_ENDPOINT", "http://"+config.getString("deps.api_self_endpoint")));
				String influxdb_username = config.getString("influxdb.username"), influxdb_passwd = config.getString("influxdb.password");
				if (influxdb_username != null && influxdb_passwd != null) {
					envArray.add(createKeyValuePair("INFLUXDB_USERNAME", influxdb_username));
					envArray.add(createKeyValuePair("INFLUXDB_PASSWORD", influxdb_passwd));
					envArray.add(createKeyValuePair("INFLUXDB_USE_SSL", "true"));
				} else {
					envArray.add(createKeyValuePair("INFLUXDB_USE_SSL", "false"));
				}
			}
			k8s_json_config.add(section);
		}
		return k8s_json_config;
	}

	private ArrayNode createKPISensor(String entrypoint, Long port, String nodeport, String backend_svc_ip,  Long user_id, String nsname, String type_) {
		/* type is null means dryrun */
		try {
			InputStream inputStream = CapacityPlanResource.class.getResourceAsStream(config.getString("deps.kpi_sensor_k8s_configfile"));
			byte[] jsonData = IOUtils.toByteArray(inputStream);
			JsonNode rootNode = new ObjectMapper().readTree(jsonData);
			ArrayNode k8s_json_config = jackson.objectMapper().createArrayNode();
			for (JsonNode section: rootNode) {
				String kindStr = section.get("kind").asText();
				JsonNode metadataElem = section.get("metadata");
				if (kindStr.equalsIgnoreCase("Service")) {
					((ObjectNode) metadataElem).put("name", entrypoint);
					log.debug(section.toString());
					JsonNode nginxSpec = section.get("spec");
					JsonNode port_ = nginxSpec.get("ports").get(0);
					((ObjectNode) port_).put("port", port);
					if (null!=type_) {//TODO: Autoshift version 1 only support one port
						((ObjectNode) port_).put("nodePort", nodeport);
						((ObjectNode) nginxSpec).put("type", type_);
					}
				} else if (kindStr.equalsIgnoreCase("ReplicationController")) {
					JsonNode containerSpecElem = section.get("spec").get("template").get("spec");
					((ObjectNode) metadataElem).put("name", "nginx-"+ UUID.randomUUID().toString());
					if (null==type_) {
						changeNodeSelector(containerSpecElem, config.getConfig("deps.dry_run_node_selector"), user_id);
					} else {
						changeNodeSelector(containerSpecElem, config.getConfig("deps.app_node_selector"), user_id);
					}
					JsonNode containerElem = containerSpecElem.get("containers").get(0);
					ArrayNode envArray = (ArrayNode) containerElem.get("env");
					envArray.add(createKeyValuePair("BACKEND_SVC_IP", backend_svc_ip+"."+nsname));
					envArray.add(createKeyValuePair("BACKEND_SVC_PORT", port.toString()));
					long data_interval = Duration.parse(config.getString("deps.data_interval")).toMillis()/1000;
					envArray.add(createKeyValuePair("PROCESS_INTERVAL", String.valueOf(data_interval) ));
					String influxdb_username = config.getString("influxdb.username"), influxdb_passwd = config.getString("influxdb.password");
					if (influxdb_username!=null&&influxdb_passwd!=null) {
						envArray.add(createKeyValuePair("INFLUXDB_AUTH", influxdb_username+":"+influxdb_passwd));
						envArray.add(createKeyValuePair("INFLUXDB_URL", "https://"+config.getString("influxdb.endpoint")));
					} else {
						envArray.add(createKeyValuePair("INFLUXDB_URL", "http://"+config.getString("influxdb.endpoint")));
					}
					envArray.add(createKeyValuePair("INFLUXDB_DATABASE", NamingConventionUtil.getInfluxDBdbNameByUserId(user_id)));
					String kafka_topic_and_influxdb_measurement_name = NamingConventionUtil.getMeasurementTopicNameByNamespaceName(nsname);
					envArray.add(createKeyValuePair("INFLUXDB_MEASURE", kafka_topic_and_influxdb_measurement_name));
					if (null!=type_) {
						envArray.add(createKeyValuePair("KAFKA_BOOTSTRAP_SERVERS", config.getString("deps.kafka_servers")));
						envArray.add(createKeyValuePair("KAFKA_TOPIC", kafka_topic_and_influxdb_measurement_name));
					}
				}
				k8s_json_config.add(section);
			}
			return k8s_json_config;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	public ArrayNode getKPISensor(JsonNode root, Long user_id, String ns_name, String entry_point, Boolean is_dryrun) throws HttpException {
		ArrayNode k8s_json_config = null;
		// add the KPI sensor in the front
		for (JsonNode section: root) {
			String kindStr = getKindStr(section);
			JsonNode metadataElem = section.get("metadata");
			if (null==metadataElem) continue;
			String setName = metadataElem.get("name").textValue();
			if (kindStr.equalsIgnoreCase("service") && setName.equals(entry_point)) {
				//TODO: Autoshift version 1 only support one port, we need to use Nginx Luna plugin
				JsonNode svcSpec = section.get("spec");
				if (null!=svcSpec) {
					String type_ = null;
					if (!is_dryrun) { // dryrun does not expose any port, "launch app" needs to expose ports to public
						JsonNode typeNode = svcSpec.get("type");
						if (null!=typeNode) type_=typeNode.asText();
						else {
							log.error("The type of the entrypoint is not specified. It cannot be a service not exposed to public.");
							return null;
						}
					}
					JsonNode port = svcSpec.get("ports").get(0);
					String backend_svc_ip = "entrypoint-" + UUID.randomUUID().toString();
					k8s_json_config = createKPISensor(entry_point, port.get("port").asLong(), port.get("nodePort").asText(), backend_svc_ip, user_id, ns_name, type_);
					((ObjectNode) svcSpec).remove("type");
					((ObjectNode) port).remove("nodePort");
					((ObjectNode) metadataElem).put("name", backend_svc_ip);
				}
				break;
			}
		}
		if (null!=k8s_json_config) log.debug("KPI sensor-->\n"+k8s_json_config.toString());
		else log.warn("Failed to create KPI sensor");
		return k8s_json_config;
	}

	public void changeNodeSelector(JsonNode containerSpecElem, Config labels, Long user_id) {
		log.debug("Changing the node selectors {}", labels);
		Map<String, Object> nodeselector = labels.toMap();
//		if (null!=user_id) nodeselector.put("user", user_id.toString()); //do not bother with user_id for now
		((ObjectNode) containerSpecElem).put("nodeSelector", jackson.objectMapper().valueToTree(nodeselector));
	}

	/**
	 * if kind is service and type is NodePort/LoadBalancer,
	 * remove Spec->type and Spec->ports->nodePort entries
	 */
	public static void removeTypeAndNodePortIfKindIsService(JsonNode node) {
		log.debug("removeTypeIfKindIsService : enter ...");
		log.debug("  Param : node = " + node.toString());

		ObjectNode spec = (ObjectNode)node.get("spec");
		if (spec != null) {
			JsonNode type = spec.get("type");
			if (type != null) {
				if (NODE_PORT.equalsIgnoreCase(type.asText()) || LOAD_BALANCER.equalsIgnoreCase(type.asText())) {
					spec.remove("type");
					log.debug("removeTypeIfKindIsService : !!! remove - type");
				}
			}
			// remove "spec" -> "port" -> nodePort
			ArrayNode ports =(ArrayNode) spec.get("ports");
			if (ports != null) {
				log.debug("    ports = " + ports);
				for (JsonNode p: ports) {
					((ObjectNode)p).remove("nodePort");
				}
			}
		}
		log.debug("removeTypeIfKindIsService : after : " + node.toString() + "\n exiting...");
	}

	/**
	 * Delete NodePort and Host Path in Dryruns if the volume mounts is not readOnly
	 */
    public static void removeNonReadOnlyVolume(JsonNode root) {
        log.debug("removeNonReadOnlyVolume : enter ...");
        log.debug("  Param : root = " + root.toString());

		ArrayNode containers = (ArrayNode)root.get("spec").get("template").get("spec").get("containers");
		ArrayNode volumeMounts = (ArrayNode)containers.findValue("volumeMounts");
		if (null==volumeMounts) return;
		log.debug("removeNonReadOnlyVolume : volumeMounts (Before) = " + volumeMounts);

		ArrayList<String> removeList = new ArrayList<>();

		Iterator<JsonNode> volumeMountsIt = volumeMounts.elements();
		while (volumeMountsIt.hasNext())
		{
			JsonNode node = volumeMountsIt.next();
			JsonNode readOnlyValueNode = node.get("readOnly");
			if (null!=readOnlyValueNode) {
				String readOnly = readOnlyValueNode.toString().replace("\"", "");
				if (!"true".equalsIgnoreCase(readOnly)) {
					String name = node.get("name").asText();
					removeList.add(name);
					volumeMountsIt.remove();
				}
			}
		}
		log.debug("removeNonReadOnlyVolume : volumeMounts (After) = " + volumeMounts);

		ArrayNode volumes = (ArrayNode)root.get("spec").get("template").get("spec").get("volumes");
		if (null==volumes) return;
		log.debug("removeNonReadOnlyVolume : volumes (Before) = " + volumes);
		Iterator<JsonNode> volumeIt = volumes.elements();
		while (volumeIt.hasNext()) {
			JsonNode node = volumeIt.next();
			String name = node.get("name").asText();
			if (removeList.contains(name)) {
				volumeIt.remove();
			}
		}
		log.debug("removeNonReadOnlyVolume : volumes (After) = " + volumes);

        log.debug("removeNonReadOnlyVolume : root = \n" + root.toString());
        log.debug("removeNonReadOnlyVolume : exit ...");
    }

	public void changeResourceLimit(SetConfig set_dryrun_config, Long k8s_endpoint_id,
									JsonNode containerSpecElem
	) throws HttpException {
		PodConfig pod_config = set_dryrun_config.getPodConfig();
		Long location_id = pod_config.getNode_location_id();
		if (null == location_id) {
			if (null == k8s_endpoint_id) {
				throw new HttpException(412, "missing location_idx");
			} else {
				location_id = k8s_endpoint_id;
			}
		}
		Map<String, Resources> dryrun_containers_config = pod_config.getContainersConfig();
		JsonNode containerArray = containerSpecElem.get("containers");// ReplicationController
		if (null == containerArray) {
			log.error("contain sepc {} does not contain containers", containerSpecElem);
		} else {
			for (JsonNode containerElem: containerArray){
				String containerName = containerElem.get("name").textValue();
				if (dryrun_containers_config.containsKey(containerName)) {
					HashMap<String, Object> limits = new HashMap<>();
					Resources containerConfig = dryrun_containers_config.get(containerName);
					if (null == containerConfig) {
						log.debug("dryrun containers config {} does not contain {}",
								dryrun_containers_config, containerName);
					} else {
						limits.put("memory", containerConfig.getMem_limit());
						limits.put("cpu", containerConfig.getCpu_quota() / 1000 + "m");
						log.debug("allocated mem limit {} and cpu quota {} to container {}", containerConfig.getMem_limit(), containerConfig.getCpu_quota(), containerName);
					}
					HashMap<String, HashMap<String, Object> > resources = new HashMap<>();
					resources.put("limits", limits);
					((ObjectNode)containerElem).put("resources", jackson.objectMapper().valueToTree(resources));
				}
			}
		}
	}
	/**
	 *  if kind == "ReplicationController"
	 *  replace the nodeSelect with new value
	 */
	public static void processInjectNodeSelector(ObjectNode node, List<Config> nodeSelectors) {
//		log.debug("processReplicationControllerNodeSelector : enter ...");
//		log.debug("  Param : node = " + node.toString());
//		log.debug("  Param : nodeSelector = " + nodeSelectors.toString());
//
//		ObjectNode templateSpec = (ObjectNode)node.get("spec").get("template").get("spec");
//
//		for (Config nodeSelector: nodeSelectors) {
//		    Map<String> nodeSelector.toMap();
//        }
//		log.debug("processReplicationControllerNodeSelector : templateSpec = " + templateSpec.toString());
//		templateSpec.replace("nodeSelector", nodeSelector);
//		log.debug("processReplicationControllerNodeSelector : root = \n" + node.toString());
//		log.debug("processReplicationControllerNodeSelector : exit ...");
	}
}
