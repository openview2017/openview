package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.CapacityPlan;
import com.huawei.openview.devops.domain.admin.CapacityPlanResult;
import com.huawei.openview.devops.domain.admin.CapacityPlanResultsWithStatus;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.j256.ormlite.stmt.QueryBuilder;
import com.j256.ormlite.stmt.DeleteBuilder;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;

/**
 * Created by j80049956 on 3/8/2017.
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{app_id}/demand-profiles/{demand_id}/capacity-plans/{plan_id}/results")
@Consumes(Mimes.JSON)
@Produces(Mimes.JSON)
public class CapacityPlanResultResource {
	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	List<CapacityPlanResult> getCapacityPlanResults(Long appId, Long demandProfileId, Long planId, boolean isAutoPlan) throws java.sql.SQLException {
		List<CapacityPlanResult> planResults;
		QueryBuilder<CapacityPlanResult, Long> queryBuilder = db.getCapacityPlanResultDao().queryBuilder();
		if (isAutoPlan) { // query for optimized results if any, otherwise the latest satisfied if any
			planResults = queryBuilder.where()
					.eq(CapacityPlanResult.APP_ID, appId)
					.and().eq(CapacityPlanResult.PLAN_ID, planId)
					.and().eq(CapacityPlanResult.DEMAND_PROFILE_ID, demandProfileId)
					.and().in(CapacityPlanResult.SLA_STATUS, CapacityPlanResult.SlaResultStatus.SLA_OPTIMIZED, CapacityPlanResult.SlaResultStatus.VALIDATION_CANDIDATE)
					.query();
			if (planResults.isEmpty()) {
				queryBuilder.where().eq(CapacityPlanResult.APP_ID, appId)
						.and().eq(CapacityPlanResult.PLAN_ID, planId)
						.and().eq(CapacityPlanResult.DEMAND_PROFILE_ID, demandProfileId)
                        .and().isNotNull(CapacityPlanResult.SLA_RESULT);
//						.and().eq(CapacityPlanResult.SLA_STATUS, CapacityPlanResult.SlaResultStatus.SLA_SATISFIED);
				queryBuilder.orderBy(CapacityPlanResult.CREATED, false).limit(1L);
				planResults = queryBuilder.query();
			}
		} else { // query for result (choose the latest) with any status
			queryBuilder.where().eq(CapacityPlanResult.APP_ID, appId)
					.and().eq(CapacityPlanResult.PLAN_ID, planId)
					.and().eq(CapacityPlanResult.DEMAND_PROFILE_ID, demandProfileId);
			queryBuilder.orderBy(CapacityPlanResult.CREATED, false).limit(1L);
			planResults = queryBuilder.query();
		}
		return planResults;
	}

	@GET
	public Response getPlanResults(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
								   @PathParam("plan_id") Long planId) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(planId);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON);
			}

			List<CapacityPlanResult> planResults = getCapacityPlanResults(appId, demandProfileId, planId, capacityPlan.getIs_auto());
			CapacityPlanResultsWithStatus resultsWithStatus = new CapacityPlanResultsWithStatus();
			resultsWithStatus.setStatus(capacityPlan.getStatus());
			resultsWithStatus.setMessage(capacityPlan.getMessage());
			resultsWithStatus.setResults(planResults);

			return DefaultResponse.ok(resultsWithStatus).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}


	@POST
	public Response createPlanResults(@PathParam("app_id") Long appId, @PathParam("demand_id") Long demandProfileId,
									  @PathParam("plan_id") Long planId, CapacityPlanResultsWithStatus planResults) {
		try {
			if (!db.getAppDao().idExists(appId)) return DefaultResponse.notFound().contentType(Mimes.JSON);
			if (!db.getDemandProfileDao().idExists(demandProfileId))
				return DefaultResponse.notFound().contentType(Mimes.JSON);

			CapacityPlan capacityPlan = db.getCapacityPlanDao().queryForId(planId);
			if (capacityPlan == null || !capacityPlan.getApp_id().equals(appId) || !capacityPlan.getDemand_profile_id().equals(demandProfileId)) {
				return DefaultResponse.notFound().contentType(Mimes.JSON);
			}
			
			if (planResults.getStatus()==CapacityPlan.PlanStatus.COMPLETED) {
				DeleteBuilder<CapacityPlanResult, Long> deleteBuilder = db.getCapacityPlanResultDao().deleteBuilder();
				deleteBuilder.where().eq(CapacityPlanResult.PLAN_ID, planId);
				deleteBuilder.delete();
			};
			
			for (CapacityPlanResult planResult : planResults.getResults()) {
				planResult.setApp_id(appId);
				planResult.setPlan_id(planId);
				planResult.setDemand_profile_id(demandProfileId);
				db.getCapacityPlanResultDao().createOrUpdate(planResult);
			}
			capacityPlan.setStatus(planResults.getStatus());
			capacityPlan.setMessage(planResults.getMessage());
			db.getCapacityPlanDao().update(capacityPlan);

			return DefaultResponse.created().contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
}
