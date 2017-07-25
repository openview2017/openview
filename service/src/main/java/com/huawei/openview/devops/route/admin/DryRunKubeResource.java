package com.huawei.openview.devops.route.admin;

import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppBlueprint;
import com.huawei.openview.devops.domain.admin.CapacityPlan;
import com.huawei.openview.devops.domain.admin.DemandProfile;
import com.huawei.openview.devops.domain.dryrun.DryRunConfiguration;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.service.admin.DatabaseService;

import com.huawei.openview.devops.service.admin.K8sConfigService;
import com.huawei.openview.devops.util.NamingConventionUtil;
import com.huawei.openview.devops.util.HttpException;
import kikaha.config.Config;
import kikaha.urouting.api.Consumes;
import kikaha.urouting.api.DELETE;
import kikaha.urouting.api.DefaultResponse;
import kikaha.urouting.api.GET;
import kikaha.urouting.api.POST;
import kikaha.urouting.api.Path;
import kikaha.urouting.api.PathParam;
import kikaha.urouting.api.QueryParam;
import kikaha.urouting.api.Response;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 *
 * @author Bowen Zhang
 *
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{app_id}/demand-profiles/{demand_id}/capacity-plans/{plan_id}/dryrun/{dryrun_id}")
public class DryRunKubeResource {

	// cahe.put("connection", connection, ExpirationPolicy.CREATED, 15,
	// TimeUnit.MINUTES);

	@Inject
	DatabaseService db;

	@Inject
	private KubeResource kubeResource;

	@Inject
	private K8sConfigService k8sConfigService;

	@Inject
	private Jackson jackson;

	@Inject
	Config config;

	@GET
	@Path("/count")
	public Response getAppStatus(@PathParam("app_id") Long app_id, @PathParam("plan_id") Long planId,
								 @PathParam("dryrun_id") Long dryrun_id, @QueryParam("k8s_endpoint_id") Long k8s_endpoint_id) {
		String dryrun_ns_name = NamingConventionUtil.getDryrunNamespaceName(app_id, planId, dryrun_id);
		ImmutablePair<Long, Boolean> pods_status = kubeResource.getNumberOfRunningPods(k8s_endpoint_id, dryrun_ns_name);
		if (pods_status.getLeft() < 0) {
			return DefaultResponse.response().statusCode((int) -pods_status.getLeft()).entity("{\"count\":-1, \"isready\": false}");
		} else {
			return DefaultResponse.ok("{\"count\":" + pods_status.getLeft() + ", \"isready\":" + (pods_status.getRight()) + "}").header("Access-Control-Allow-Origin", "*");
		}
	}

	public Long getK8sEndpointId(Long k8s_endpoint_id, DryRunConfiguration dryRunConfig) {
		if (k8s_endpoint_id == null) {
			return dryRunConfig.getK8s_endpoint_id();
		}
		return k8s_endpoint_id;
	}

	public List<SetConfig> getSetConfigs(Long app_id, DryRunConfiguration dryRunConfig) throws HttpException {
		List<SetConfig> setConfigs = dryRunConfig.getSetConfigs();
		if (null == setConfigs) {
			log.warn("Unable to find original setConfigs by app_id=" + app_id.toString());
			throw new HttpException(404, "Unable to find SetConfigs by app_id=" + app_id.toString());
		}
		return setConfigs;
	}

	public AppBlueprint getAppBlueprint(Long app_id) throws HttpException {
		try {
			List<AppBlueprint> appBlueprints = db.getAppBlueprintDao().queryForEq("app_id", app_id);
			return appBlueprints.isEmpty() ? null : appBlueprints.get(0);
		} catch (SQLException | IllegalArgumentException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	public Long getUserId(Long app_id) throws HttpException {
		try {
			List<App> apps = db.getAppDao().queryForEq("id", app_id);
			return apps.isEmpty() ? null : apps.get(0).getUser_id();
		} catch (SQLException | IllegalArgumentException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	public CapacityPlan getCapacityPlan(Long planId) throws HttpException {
		try {
			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(planId);
			if (capacityPlan == null) {
				throw new HttpException(404, "Unable to find capacity plan " + planId.toString());
			}
			CapacityPlan.PlanStatus capacity_plan_status = capacityPlan.getStatus();
			if (capacity_plan_status == CapacityPlan.PlanStatus.STARTING) {
				capacityPlan.setStatus(CapacityPlan.PlanStatus.STARTED);
				db.getCapacityPlanDao().update(capacityPlan);
			}
			return capacityPlan;
		} catch (SQLException | IllegalArgumentException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	public String getDemandProfileConfig(CapacityPlan capacityPlan) throws HttpException {
		try {
			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(capacityPlan.getDemand_profile_id());
			/* change from getConfig() to getConfig_json() */
//			demandProfile_config = demandProfile == null ? null : demandProfile.getConfig();
			return demandProfile == null ? null : demandProfile.getConfig_json();
		} catch (SQLException | IllegalArgumentException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	@POST
	@Consumes("application/json")
	public Response createDryrun(
			@PathParam("app_id") Long app_id, @PathParam("plan_id") Long planId,
			@PathParam("dryrun_id") Long dryrun_id, @QueryParam("k8s_endpoint_id") Long k8s_endpoint_id,
			DryRunConfiguration dryRunConfig
	) {
		log.debug(
				"createDryrun with app {} plan {} dryrun {} k8s endpoint {} and dryrun config {}",
				app_id, planId, dryrun_id, k8s_endpoint_id, dryRunConfig
		);
		try {
			String dryrun_ns_name = NamingConventionUtil.getDryrunNamespaceName(app_id, planId, dryrun_id);
			k8s_endpoint_id = getK8sEndpointId(k8s_endpoint_id, dryRunConfig);
			List<SetConfig> setConfigs = getSetConfigs(app_id, dryRunConfig);
			AppBlueprint appBlueprint = getAppBlueprint(app_id);
			String entry_point = appBlueprint.getEntry_point();
			Long user_id = getUserId(app_id);
			CapacityPlan capacityPlan = getCapacityPlan(planId);
			String jsonString = appBlueprint.getEdited_content();
			JsonNode root = jackson.objectMapper().readTree(jsonString);
			ArrayNode k8s_json_config = k8sConfigService.getKPISensor(root, user_id, dryrun_ns_name, entry_point, true);
			if (null==k8s_json_config) {
				return DefaultResponse.preconditionFailed().entity("Invalid configuration, unable to setup KPI sensor.");
			}
			for (JsonNode section: root) {
				String kindStr = K8sConfigService.getKindStr(section);
				JsonNode specElem = section.get("spec");
				String setName = k8sConfigService.getSetName(section);
				if (kindStr.equalsIgnoreCase("service")) {
					K8sConfigService.removeTypeAndNodePortIfKindIsService(section);
				}
				JsonNode containerSpecElem = K8sConfigService.getContainerElem(specElem, kindStr);
				// end of deal with property kind
				SetConfig set_dryrun_config = K8sConfigService.getSetConfig(setConfigs, setName);
				// change the scale
				if (null != set_dryrun_config && specElem != null) {
					K8sConfigService.changeSpecScale(kindStr, specElem, set_dryrun_config.getReplicas());
				}
				// change node selector and remove non-read-only volumes
				if (null != containerSpecElem) {
					k8sConfigService.changeNodeSelector(containerSpecElem, config.getConfig("deps.dry_run_node_selector"), user_id);
					K8sConfigService.removeNonReadOnlyVolume(section);
				}
				// change the resources limits
				if (null != containerSpecElem && set_dryrun_config != null) {
					k8sConfigService.changeResourceLimit(set_dryrun_config, k8s_endpoint_id, containerSpecElem);
				}
				log.debug(section.toString());
				k8s_json_config.add(section);
			}
			return kubeResource.deployK8sJsonConfig(k8s_endpoint_id, dryrun_ns_name, k8s_json_config, true);
		} catch (HttpException e) {
			e.printStackTrace();
			return DefaultResponse.response().statusCode(e.getStatus()).entity(e.getMessage());
		} catch (ClassCastException | NullPointerException e) {
			e.printStackTrace();
			return DefaultResponse.preconditionFailed().entity("Invalid container configuration.");
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	@Path("/start_load")
	@Consumes("application/json")
	public Response startLoad(
			@PathParam("app_id") Long app_id, @PathParam("plan_id") Long planId,
			@PathParam("dryrun_id") Long dryrun_id, @QueryParam("k8s_endpoint_id") Long k8s_endpoint_id
	) {
		log.debug(
				"startLoad with app {} plan {} dryrun {} k8s endpoint {}",
				app_id, planId, dryrun_id, k8s_endpoint_id
		);
		try {
			String dryrun_ns_name = NamingConventionUtil.getDryrunNamespaceName(app_id, planId, dryrun_id);
			CapacityPlan capacityPlan = getCapacityPlan(planId);
			String demandProfile_config = getDemandProfileConfig(capacityPlan);
			JsonNode demandProfileArray = jackson.objectMapper().readTree(demandProfile_config);
			for (JsonNode dp : demandProfileArray){
				JsonNode dp_spec = dp.get("spec");
				if (dp_spec != null) {
					JsonNode dp_template = dp_spec.get("template");
					if (dp_template != null) {
						JsonNode inner_spec = dp_template.get("spec");
						if (inner_spec != null) {
							k8sConfigService.changeNodeSelector(inner_spec, config.getConfig("deps.load_generator_node_selector"), null);
						}
					}
				}
			}
			return kubeResource.deployK8sJsonConfig(k8s_endpoint_id, dryrun_ns_name, demandProfileArray, true);
		} catch (HttpException e) {
			e.printStackTrace();
			return DefaultResponse.response().statusCode(e.getStatus()).entity(e.getMessage());
		} catch (ClassCastException | NullPointerException e) {
			e.printStackTrace();
			return DefaultResponse.preconditionFailed().entity("Invalid container configuration.");
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	public Response removeStack(@PathParam("app_id") Long appId, @PathParam("plan_id") Long planId,
								@PathParam("dryrun_id") Long dryrunId, @QueryParam("k8s_endpoint_id") Long k8s_endpoint_id) {
		String dryrun_ns_name = NamingConventionUtil.getDryrunNamespaceName(appId, planId, dryrunId);
		return kubeResource.removeNamespace(k8s_endpoint_id, dryrun_ns_name);
	}
}