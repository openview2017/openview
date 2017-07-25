package com.huawei.openview.devops.route.admin;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.dataformat.yaml.snakeyaml.Yaml;
import com.huawei.openview.devops.domain.admin.*;
import com.huawei.openview.devops.domain.dryrun.ApplicationTopology;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.huawei.openview.devops.service.admin.K8sConfigService;
import com.huawei.openview.devops.util.NamingConventionUtil;
import kikaha.config.Config;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.*;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import static groovyjarjarantlr.build.ANTLR.root;

/**
 * Created by j80049956 on 3/1/2017.
 * Integrated from CapacityPlannerResource on 3/24/2017 by Jinzhong
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{app_id}/demand-profiles/{demand_id}/capacity-plans")
@Consumes(Mimes.JSON)
@Produces(Mimes.JSON)
public class CapacityPlanResource {
	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@Inject
	Config config;

	@Inject
	private KubeResource kubeResource;

	@Inject
	private K8sConfigService k8sConfigService;

	@GET
	public Response getCapacityPlans(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			List<CapacityPlan> capacityPlans = db.getCapacityPlanDao().queryBuilder().where()
					.eq(CapacityPlan.APP_ID, appId).and().eq(CapacityPlan.DEMAND_PROFILE_ID, demandProfileId).query();
			return DefaultResponse.ok(capacityPlans).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	public Response createCapacityPlan(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
									   CapacityPlan capacityPlan) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);
			capacityPlan.setApp_id(appId);
			capacityPlan.setDemand_profile_id(demandProfileId);
			db.getCapacityPlanDao().create(capacityPlan);
			capacityPlan.setName("plan-"+capacityPlan.getId());
			db.getCapacityPlanDao().update(capacityPlan);
			return DefaultResponse.created(String.format("openview/api/v1/apps/%d/capacity-plans/%d", appId, capacityPlan.getId()))
					.entity(capacityPlan).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/{id}")
	public Response getCapacityPlanById(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
										@PathParam("id") Long id) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(id);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON);
			}

			return DefaultResponse.ok(capacityPlan).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/{id}")
	public Response updateCapacityPlanById(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
										   @PathParam("id") Long id, CapacityPlan newCapacityPlan) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(id);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON);
			}

			newCapacityPlan.setId(capacityPlan.getId());
			newCapacityPlan.setApp_id(capacityPlan.getApp_id());
			db.getCapacityPlanDao().update(newCapacityPlan);
			return DefaultResponse.ok(newCapacityPlan).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/{id}")
	public Response deleteCapacityPlanById(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
										   @PathParam("id") Long id) {
		try {
			deleteCapacityPlannerById(appId, demandProfileId, id);
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(id);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON);
			}

			db.getCapacityPlanDao().deleteById(id);
			return DefaultResponse.ok().contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	@Path("/{id}/start")
	public Response startCapacityPlanner(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
										 @PathParam("id") Long id) throws SQLException, IOException {
		try {
            deleteCapacityPlannerById(appId, demandProfileId, id);
			App app = db.getAppDao().queryForId(appId);
			if (null==app)
				return DefaultResponse.notFound().contentType(Mimes.JSON).entity("Application id="+appId.toString()+" is not found");
			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(demandProfileId);
			if (null==demandProfile || !demandProfile.getApp_id().equals(appId))
				return DefaultResponse.notFound().contentType(Mimes.JSON).entity("Demand profile id="+demandProfileId.toString()+" is not found under app id="+appId.toString());
			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(id);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON).entity("CapacityPlan id="+id.toString()+" is not found under demand profile id="+demandProfileId.toString());
			}

            // APPLICATION_TOPOLOGY_CONFIG is the one you need to pull from multiple tables in db
			ApplicationTopology topology = new ApplicationTopology();
			topology.setApp_id(appId);
			topology.setCapacity_plan_id(id);
			topology.setDemand_profile_id(demandProfileId);

			topology.setIs_auto(capacityPlan.getIs_auto());
			topology.setLoad_duration(demandProfile.getLoad_duration());

            ArrayList<Long> k8s_endpoint_id_candidates= new ArrayList<>();;
            if (capacityPlan.getIs_auto()) {
                List<K8sEndpoint> k8sEndpoints = db.getK8sEndpointDao().queryForAll();
                for (K8sEndpoint l : k8sEndpoints) {
                    k8s_endpoint_id_candidates.add(l.getId());
                }
            } else {
                if (!db.getK8sEndpointDao().idExists(capacityPlan.getK8s_endpoint_id())) {
                    return DefaultResponse.notFound().contentType(Mimes.JSON).entity("k8s_endpoint_id="+demandProfileId.toString()+" does not exist");
                }
                k8s_endpoint_id_candidates.add(capacityPlan.getK8s_endpoint_id());
            }

			topology.setK8s_endpoint_id_candidates(k8s_endpoint_id_candidates);
			topology.setApp_sla(db.querySlaForApp(appId));
			topology.setSetconfigs(capacityPlan.getSetConfigs());

			Long k8s_endpoint_id = Long.parseLong(config.getString("deps.self_k8s_endpoint_id"));
			ArrayNode planner_json = k8sConfigService.getCapacityPlanner(NamingConventionUtil.getCapacityPlannerPodName(id), jackson.objectMapper().writeValueAsString(topology), NamingConventionUtil.getInfluxDBdbNameByUserId(app.getUser_id()) );
			if (null==planner_json) {
				return DefaultResponse.preconditionFailed().entity("Invalid configuration, unable to setup capacity planner.");
			}
			log.debug("planner json: "+planner_json.toString());

			Response response = kubeResource.deployK8sJsonConfig(k8s_endpoint_id, NamingConventionUtil.getAppHelperNamespaceNameByAppId(appId), planner_json, true);
			if (response.statusCode() == 200||response.statusCode() == 201) { // example : 409
				capacityPlan.setStatus(CapacityPlan.PlanStatus.STARTING);
				db.getCapacityPlanDao().update(capacityPlan);
            }
			return response;
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/{id}/stop")
	public Response deleteCapacityPlannerById(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
											  @PathParam("id") Long id) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().contentType(Mimes.JSON).entity("Application id="+appId.toString()+" is not found");
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON).entity("Demand profile id="+demandProfileId.toString()+" is not found under app id="+appId.toString());
			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(id);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON).entity("CapacityPlan id="+id.toString()+" is not found under demand profile id="+demandProfileId.toString());
			}
			capacityPlan.setStatus(CapacityPlan.PlanStatus.STOPPED);
			db.getCapacityPlanDao().update(capacityPlan);
			Long k8s_endpoint_id = Long.parseLong(config.getString("deps.self_k8s_endpoint_id"));
			String namespace = NamingConventionUtil.getAppHelperNamespaceNameByAppId(appId);
//			okhttp3.Response response = kubeResource.callKubeMaster(k8s_endpoint_id, "apis/batch/v1/namespaces/" + namespace + "/jobs/" + NamingConventionUtil.getCapacityPlannerPodName(id), "DELETE", null, null);
			okhttp3.Response response = kubeResource.callKubeMaster(k8s_endpoint_id, "api/v1/namespaces/" + namespace + "/pods/" + NamingConventionUtil.getCapacityPlannerPodName(id), "DELETE", "json", null);
			return DefaultResponse.response().statusCode(response.code()).entity(response.message());
		} catch (SQLException e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
}
