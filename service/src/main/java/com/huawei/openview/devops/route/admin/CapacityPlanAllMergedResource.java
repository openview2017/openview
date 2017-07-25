package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.*;
import com.huawei.openview.devops.domain.dryrun.config.Resources;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.service.admin.DatabaseService;
import kikaha.urouting.api.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by j80049956 on 3/16/2017.
 */

@Data
@AllArgsConstructor
class ContainerAttribute {
	String selector;
	String display_name;
}

@Data
@RequiredArgsConstructor
class ContainerSelector {
	final String selector;
	ContainerAttribute[] attributes = {
			new ContainerAttribute("cpu_quota", "cpu_quota"),
			new ContainerAttribute("mem_limit", "Memory"),
	};
}

@Data
class SetConfigSelector {
	String name;
	String kind;
	List<ContainerSelector> containers;
}

@Data
class MergedResult {
	Long id;
	String app_name;
	List<K8sEndpoint> k8sEndpoints;
	AppSla sla;
	List<SetConfigSelector> setconfig_selectors = new ArrayList<>();
	List<CapacityPlan> capacity_plans;
	List<CapacityPlanResult> manual_plans = new ArrayList<>();
	List<CapacityPlanResult> auto_plans;
	CapacityPlan.PlanStatus auto_plan_status;
	String auto_plan_message;
}

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{app_id}/demand-profiles/{demand_id}/all-merged")
@Produces(Mimes.JSON)
public class CapacityPlanAllMergedResource {

	@Inject
	private DatabaseService db;

	@Inject
	private CapacityPlanResultResource capacityPlanResultResource;

	@GET
	public Response getAll(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			App app = db.getAppDao().queryForId(appId);
			AppStatus appStatus = app.getStatus();
			if (null == appStatus) {
				log.warn("Unable to find appStatus");
				return DefaultResponse.notFound().entity("Unable to find appStatus");
			}

			appStatus.setPhase(AppStatus.Phase.planning);
			db.getAppStatusDao().update(appStatus);

			MergedResult mergedResult = new MergedResult();
			mergedResult.id = appId;
			mergedResult.app_name = app.getName();
			mergedResult.k8sEndpoints = db.getK8sEndpointDao().queryBuilder().selectColumns(K8sEndpoint.ID, K8sEndpoint.LOCATION_ID, K8sEndpoint.NAME).query();
			mergedResult.setSla(db.querySlaForApp(appId));
			List<CapacityPlan> capacityPlans = db.getCapacityPlanDao().queryBuilder().where()
					.eq(CapacityPlan.APP_ID, appId).and().eq(CapacityPlan.DEMAND_PROFILE_ID, demandProfileId).query();
			capacityPlans.sort((o1, o2) -> (int) (o1.getId() - o2.getId()));
			mergedResult.setCapacity_plans(capacityPlans);
			for (CapacityPlan plan : capacityPlans) {
				if (plan.getIs_auto()) {
					mergedResult.auto_plans = capacityPlanResultResource.getCapacityPlanResults(appId, demandProfileId, plan.getId(), true);
					mergedResult.auto_plan_status = plan.getStatus();
					mergedResult.auto_plan_message = plan.getMessage();

					for (SetConfig setConfig : plan.getSetConfigs()) {
						SetConfigSelector setConfigSelector = new SetConfigSelector();
						setConfigSelector.name = setConfig.getName();
						setConfigSelector.kind = setConfig.getKind();
						setConfigSelector.containers = new ArrayList<ContainerSelector>();
						Map<String, Resources> containersConfg = setConfig.getPodConfig().getContainersConfig();
						for (String key : containersConfg.keySet()) {
							setConfigSelector.containers.add(new ContainerSelector(key));
						}
						mergedResult.setconfig_selectors.add(setConfigSelector);
					}

				} else {
					List<CapacityPlanResult> planResults = capacityPlanResultResource.getCapacityPlanResults(appId, demandProfileId, plan.getId(), false);
					if (!planResults.isEmpty()) {
						mergedResult.manual_plans.add(planResults.get(0));
					}
				}
			}

			return DefaultResponse.ok().entity(mergedResult).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
}
