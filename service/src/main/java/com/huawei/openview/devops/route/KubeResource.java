package com.huawei.openview.devops.route;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.snakeyaml.Yaml;
import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.CapacityPlanResult;
import com.huawei.openview.devops.domain.admin.K8sEndpoint;
import com.huawei.openview.devops.service.admin.DatabaseService;

import com.sun.org.apache.xpath.internal.operations.Bool;
import kikaha.urouting.api.DefaultResponse;
import kikaha.urouting.api.Produces;
import kikaha.urouting.api.Response;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;
import net.jodah.expiringmap.ExpirationPolicy;
import net.jodah.expiringmap.ExpiringMap;
import io.fabric8.kubernetes.client.utils.HttpClientUtils;
import io.fabric8.kubernetes.client.internal.CertUtils;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.InputStream;
import io.fabric8.kubernetes.client.Config;
import okhttp3.*;
import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 * @author Bowen Zhang
 */
@Slf4j
@Singleton
public class KubeResource {

    @Inject
    private DatabaseService db;

    @Inject
    private Jackson jackson;

    private ExpiringMap<Long, ImmutablePair<OkHttpClient, String> > cache_k8s_endpoint_id_to_okhttpclient = ExpiringMap.builder().variableExpiration().build();

    private ExpiringMap<Long, Long> cache_app_id_to_k8s_endpoint_id = ExpiringMap.builder().variableExpiration().build();

    private ReentrantReadWriteLock httpLock = new ReentrantReadWriteLock();
    /**
     * Returns an input stream containing one or more server_certificate PEM files. This implementation just
     * embeds the PEM files in Java strings; most applications will instead read this from a resource
     * file that gets bundled with the application.
     */

    public okhttp3.Response callKubeMaster(Long k8s_endpoint_id, String path, String method, String format, String body) {
        log.debug("callKubeMaster - enter ...");
//        log.debug("  Parameter : k8s = " + k8s);
        log.debug("  Parameter : path = " + path);
        log.debug("  Parameter : method = " + method);
        log.debug("  Parameter : format = " + format);
        log.debug("  Parameter : body = " + body);
        RequestBody requestBody = null;

        if ( null != body ) {
            requestBody = RequestBody.create(MediaType.parse("application/"+format), body);
            log.debug("  requestBody = " + requestBody);
        }

        // get okhttp client and the endpoint address
        ImmutablePair<OkHttpClient, String> client_and_endpoint = getK8sOkHttpClientByk8sEndpointId(k8s_endpoint_id);
        if (null==client_and_endpoint) {
            Request request = new Request.Builder().url("http://unknown/unknown").method(method, requestBody).build();
            return new okhttp3.Response.Builder().request(request).protocol(Protocol.HTTP_1_1)
                    .code(404).message("k8s client is not found").build();
        }
        String endpoint = client_and_endpoint.getRight();
        String url = endpoint.endsWith("/")? endpoint + path: endpoint + "/" + path;
        OkHttpClient client = client_and_endpoint.getLeft();

        // build the request
        Request request = new Request.Builder().url(url)
                .method(method, requestBody).build();
        log.debug("  request = " + request);
        if (null==client) {
            return new okhttp3.Response.Builder().request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(404).message("k8s client is not found").build();
        }

        // send the request
        try {
            httpLock.writeLock().lock();
            okhttp3.Response response = client.newCall(request).execute();
            log.debug(" response : " + response);
            return response;
        } catch ( IOException e) {
            log.error("callKubeMaster : " + e);
            return new okhttp3.Response.Builder().request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(401).message(e.getMessage()).build();
        } finally {
            httpLock.writeLock().unlock();
            log.debug("callKubeMaster - exit ...");
        }
    }

    private ImmutablePair<OkHttpClient, String> getK8sOkHttpClientByk8sEndpointId(Long k8s_endpoint_id) {
        log.debug("getK8s_endpoint_id = " + k8s_endpoint_id);
        if (!cache_k8s_endpoint_id_to_okhttpclient.containsKey(k8s_endpoint_id)) {
            try {
                K8sEndpoint k8s = db.getK8sEndpointDao().queryForId(k8s_endpoint_id);
                if (null == k8s) return null;
                Config config = new Config();
                config.setTrustCerts(true);
                config.setCaCertData(k8s.getServer_certificate());
                config.setClientCertData(k8s.getClient_certificate());
                config.setClientKeyData(k8s.getKey());
                config.setMasterUrl(k8s.getEndpoint());
       
                OkHttpClient client = HttpClientUtils.createHttpClient(config);
                
                ImmutablePair<OkHttpClient, String> client_and_endpoint =  new ImmutablePair<>(client, k8s.getEndpoint());
                cache_k8s_endpoint_id_to_okhttpclient.put(k8s_endpoint_id, client_and_endpoint, ExpirationPolicy.CREATED, 15, TimeUnit.MINUTES);
                log.debug("create/renew cache_k8s_endpoint_id_to_okhttpclient, key=" + k8s_endpoint_id);
                return client_and_endpoint;
            }catch (SQLException e) {
                e.printStackTrace();
                return null;
            }
        } else {
            return cache_k8s_endpoint_id_to_okhttpclient.get(k8s_endpoint_id);
        }
    }

    public Long getK8sEndpointIdByAppId(Long app_id) {
        log.debug("getK8s_endpoint_id - enter ...");
        if (!cache_app_id_to_k8s_endpoint_id.containsKey(app_id)) {
            try {
                App app = db.getAppDao().queryForId(app_id);
                if (null == app) return null;
                CapacityPlanResult capacityPlanResult = db.getCapacityPlanResultDao().queryForId(app.getCapacity_plan_result_id());
                if (null == capacityPlanResult) return null;
                Long k8s_endpoint_id = capacityPlanResult.getK8s_endpoint_id();
                if (null == k8s_endpoint_id) return null;
                cache_app_id_to_k8s_endpoint_id.put(app_id, k8s_endpoint_id, ExpirationPolicy.CREATED, 15, TimeUnit.MINUTES);
                log.debug("create/renew cache_app_id_to_k8s_endpoint_id, app_id=" + app_id);
                return k8s_endpoint_id;
            }catch (SQLException e) {
                e.printStackTrace();
                return null;
            }
        } else {
            return cache_app_id_to_k8s_endpoint_id.get(app_id);
        }
    }

    public ImmutablePair<Long, Boolean> getNumberOfRunningPods(Long k8s_endpoint_id, String name) {
        /*
        if there is an error code, this function returns the negative number of error code
         */
        okhttp3.Response response = callKubeMaster(k8s_endpoint_id, "api/v1/namespaces/" + name + "/pods", "GET", null, null);
        if (response.code()!=200) {
            log.debug("code: "+response.code()+", message: "+response.message());
            return new ImmutablePair<>((long) -response.code(), false);
        }
        ObjectMapper jsonMapper = jackson.objectMapper();
        Long num_ready_pods = 0L;
        Boolean are_all_pods_ready = true;
        try {
            Iterator<JsonNode> k8s_res = jsonMapper.readTree(response.body().string()).get("items").elements();
            while (k8s_res.hasNext()) {
                JsonNode pod_configs = k8s_res.next();
                JsonNode pod_status = pod_configs.get("status");
                String pod_phase = pod_status.get("phase").asText();
                // if the pod belongs to a job and the job is finished, the pod_phase will be "succeeded"
                if (pod_phase.equals("Succeeded")) {
                    log.debug(pod_configs.get("metadata").get("name").asText() + " phase: Succeeded");
                    continue;
                }
                // if the pod belongs to a job and the job is failed, the pod_phase will be "failed"
                if (pod_phase.equals("Failed")) {
                    log.debug(pod_configs.get("metadata").get("name").asText() + " phase: Failed");
                    are_all_pods_ready = false;
                    continue;
                }
                // for a pod in rc or stateful-set, only "Ready"=true means it is ready. "Running" just means a start
                if (!pod_phase.equals("Running")) {
                    log.error("Unknown pod phase, check if https://kubernetes.io/docs/user-guide/pod-states/ is updated.", pod_phase);
                }
                Iterator<JsonNode> pod_condition = pod_status.get("conditions").elements();
                while (pod_condition.hasNext()) {
                    JsonNode condition = pod_condition.next();
                    if (condition.get("type").asText().equals("Ready")) {
                        log.debug(pod_configs.get("metadata").get("name").asText() + " " + condition.get("type").asText()
                                + ": " + condition.get("status").asText());
                        if (condition.get("status").asText().equals("True")) {
                            num_ready_pods += 1;
                        } else {
                            are_all_pods_ready = false;
                        }
                    }
                }
            }
            if (num_ready_pods == 0) {
                are_all_pods_ready = false;
            }
            log.debug("getNumberOfRunningPods - # of ready pods: " + num_ready_pods.toString() + ", app ready?"+ are_all_pods_ready);
            return new ImmutablePair<>( num_ready_pods, are_all_pods_ready);
        } catch (IOException | IllegalStateException | NullPointerException e) {
            log.error(e.getMessage());
            log.debug("getNumberOfRunningPods - exit with exception...");
            return new ImmutablePair<>( -500L, false);
        }
    }

	public Response removeNamespace(Long k8s_endpoint_id, String name) {
		log.debug("removeNamespace - enter ...");
        log.debug("  Param : name = " + name);
        okhttp3.Response response = callKubeMaster(k8s_endpoint_id, "api/v1/namespaces/" + name, "DELETE", null, null);
        log.debug("removeNamespace : response = " + response);
        if (null == response) {
            log.debug("removeNamespace - exit ...");
            return DefaultResponse.serverError("Failed to send delete request to Kube master.");
        } else {
            log.debug("removeNamespace - exit ...");
            return DefaultResponse.response().statusCode(response.code()).entity(response.message());
        }
    }

    @Produces("application/json")
    public Response deployK8sJsonConfig(Long k8s_endpoint_id, String nsName, JsonNode k8s_json_config, boolean autoClean) {
        log.debug("deployK8sJsonConfig - enter ...");
        log.debug("  Parameter : nsName = " + nsName);
        log.debug("  Parameter : k8s_yaml_config = " + k8s_json_config);

        // ----------- a. create a namespace
        okhttp3.Response response = callKubeMaster(k8s_endpoint_id, "api/v1/namespaces", "POST", "yaml",
                "metadata: {name: \"" + nsName + "\"}");
        if (null == response) {
            return DefaultResponse
                    .serverError("Failed to send \"create namespace" + nsName + "\" request to Kube master.");
        }
        Integer n_created = 0;
        ObjectNode responseJson = jackson.objectMapper().createObjectNode();
        ObjectNode statusSummary = jackson.objectMapper().createObjectNode();

        for (final JsonNode configElem: k8s_json_config) {
        	try{
        		ObjectNode responseObj = jackson.objectMapper().createObjectNode();
        		String kindStr = configElem.get("kind").textValue();
        		JsonNode metadataElem = configElem.get("metadata");
        		if (null == metadataElem){
        			ObjectNode metadataObj = jackson.objectMapper().createObjectNode();
        			metadataObj.put("namespace", nsName);
        			((ObjectNode)configElem).put("metadata", metadataObj);
        		} else{
        			((ObjectNode)metadataElem).put("namespace", nsName);
        		}

        		String segmentName = metadataElem.get("name").textValue();
        		String path = getEndpointPath(nsName, kindStr);

                response = callKubeMaster(k8s_endpoint_id, path, "POST", "json", jackson.objectMapper().writeValueAsString(configElem));
                String responseBody = response.body().string();
                log.debug("deployK8sYamlConfig : responseBody = \n" + responseBody);
                responseObj.put("type", kindStr);

                Boolean is_failure = false;
                String message = "";
			    if (201 != response.code()) {  // if the Kubernetes master do not say "created", it means the config file is not acceptable. This server returns the previous successful deployment along with this failure deployment
                    if (409 == response.code()) {
                        String conflict_reason = jackson.objectMapper().readTree(responseBody).get("reason").textValue();
                        if (conflict_reason.equals("AlreadyExists")) message = "SkipExisting";
                        else is_failure = true;
                    } else is_failure = true;
                } else {
			        message = response.message();
                }

			    if (is_failure) {
                    responseObj.put("status",response.message());
                    responseJson.put(segmentName, responseObj);
                    statusSummary.put("n_created", n_created.toString());
                    Integer n_not_deployed = k8s_json_config.size()-n_created;
                    statusSummary.put("n_not_deployed", n_not_deployed.toString());
                    if (autoClean) {
						removeNamespace(k8s_endpoint_id, nsName);
						try {
                            statusSummary.put("note", "Failed to launch application. Reason: " + jackson.objectMapper().readTree(responseBody).get("message").textValue());
                        } catch (Exception e) {
                            statusSummary.put("note", "Failed to launch application. Reason: " + responseBody);
                        }
                        statusSummary.put("status", "invalid config -> deleted");
                    }else{
                        statusSummary.put("note", "You may need to clean the environment.");
                        statusSummary.put("status", "invalid config");
                    }

                    responseJson.put("status_summary", statusSummary);
                    return DefaultResponse.response().statusCode(response.code())
                            .entity(responseJson);
                } else {
                    responseObj.put("status",message);
                    responseJson.put(segmentName, responseObj);
                }

        	}catch (IOException | ClassCastException e) {
                return DefaultResponse.preconditionFailed()
                        .entity("The Kubernetes yaml config file does not include \"kind\". Invalid config.");
            }
        	n_created += 1;
        }

        statusSummary.put("n_created", n_created.toString());
        statusSummary.put("status", "created");
        responseJson.put("status_summary", statusSummary);
        log.debug("deployK8sJsonConfig - exit ...");
        return DefaultResponse.ok(responseJson).header("Access-Control-Allow-Origin", "*");
    }

	private String getEndpointPath(String nsName, String kindStr) {
		String path;
		if("replicationcontroller".equalsIgnoreCase(kindStr)) {
		    path = "api/v1/namespaces/" + nsName + "/" + kindStr.toLowerCase() + "s";
		} else if ("statefulset".equalsIgnoreCase(kindStr)) {
		    path = "apis/apps/v1beta1/namespaces/" + nsName + "/" + kindStr.toLowerCase() + "s";
		} else if ("deployment".equalsIgnoreCase(kindStr)) {
		    path = "apis/extensions/v1beta1/namespaces/" + nsName + "/" + kindStr.toLowerCase() + "s";
		} else if ("job".equalsIgnoreCase(kindStr)) {
		    path = "apis/batch/v1/namespaces/" + nsName + "/" + kindStr.toLowerCase() + "s";
		} else{ // default value
		    path = "api/v1/namespaces/" + nsName + "/" + kindStr.toLowerCase() + "s";
		}
		return path;
	}
}
