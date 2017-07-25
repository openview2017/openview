package com.huawei.openview.devops.domain.admin;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Created by j80049956 on 3/8/2017.
 */
@Slf4j
@Data
public class CapacityPlanResultsWithStatus {

	private List<CapacityPlanResult> results;
	private CapacityPlan.PlanStatus status = CapacityPlan.PlanStatus.CREATED;
	private String message;

}
