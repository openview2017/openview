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
 * Created by j80049956 on 3/1/2017.
 */

@Slf4j
@Data
@DatabaseTable(tableName = "capacity_plan")
public class CapacityPlan extends AbstractBaseEntity {

	public static final String DEMAND_PROFILE_ID = "demand_profile_id";
	public static final String IS_AUTO = "is_auto";
        public static final ObjectMapper objectMapper = new ObjectMapper();

	@JsonIgnore
	@DatabaseField
	private Long app_id;

	@DatabaseField(canBeNull = false, defaultValue = "Manual Plan")
	private String name;

	@DatabaseField(defaultValue = "false", index = true)
	private Boolean is_auto;

	@DatabaseField
	private Long demand_profile_id;

	@DatabaseField
	private Long k8s_endpoint_id;

	@JsonIgnore
	@DatabaseField // SetConfigs JSON
	private String config;

	@DatabaseField(canBeNull = false, defaultValue = "CREATED")
	private PlanStatus status = PlanStatus.CREATED;

	@DatabaseField
	private String message;

	@DatabaseField
	private String start_time;

	public enum PlanStatus {
		CREATED, STARTING, STARTED, IN_PROGRESS, VALIDATING, COMPLETED, ERROR, STOPPED
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
		log.debug("setSetConfigs");
		try {
			config = objectMapper.writeValueAsString(setConfigs);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}
}

