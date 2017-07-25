package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Created by j80049956 on 3/6/2017.
 */

@Slf4j
@Data
@DatabaseTable(tableName = "capacity_plan_result")
public class CapacityPlanResult extends AbstractBaseEntity {

	public static final String DEMAND_PROFILE_ID = "demand_profile_id";
	public static final String PLAN_ID = "plan_id";
	public static final String SLA_STATUS = "sla_status";
	public static final String SLA_RESULT = "sla_result";
	public static final String CREATED = "CREATED";
        public static final ObjectMapper objectMapper = new ObjectMapper();

	@JsonIgnore
	@DatabaseField
	private Long app_id;

	@DatabaseField
	private Long demand_profile_id;

	@DatabaseField
	private Long plan_id;

	@DatabaseField
	private Long k8s_endpoint_id;

	@DatabaseField
	private Long load_duration;

	@JsonIgnore
	@DatabaseField // SetConfigs JSON
	private String config;

	@JsonIgnore
	@DatabaseField
	private String sla_result;

	@DatabaseField(canBeNull = false, defaultValue = "CREATED", index = true)
	private SlaResultStatus sla_status = SlaResultStatus.CREATED;

	public enum SlaResultStatus {
		CREATED, STARTED, NO_DATA, LARGE_LATENCY, LARGE_ERROR_RATE, ALL_ERROR,
		OVER_BUDGET, NOT_LAUNCHED, SLA_SATISFIED, SLA_OPTIMIZED, API_NOT_READY, VALIDATION_CANDIDATE
	}

	@JsonProperty("sla_result")
	public AppSla getSlaResult() {
		if (sla_result == null) return null;
		try {
			return objectMapper.readValue(sla_result, AppSla.class);
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	@JsonProperty("sla_result")
	public void setSlaResult(AppSla sla) {
		try {
			sla_result = objectMapper.writeValueAsString(sla);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}

	@JsonProperty("SetConfigs")
	public List<SetConfig> getSetConfigs() {
		if (config == null) return null;
		try {
			SetConfig[] setConfigs = objectMapper.readValue(config, SetConfig[].class);
			return Arrays.asList(setConfigs);
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	@JsonProperty("SetConfigs")
	public void setSetConfigs(List<SetConfig> setConfigs) {
		try {
			config = objectMapper.writeValueAsString(setConfigs);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}
}
