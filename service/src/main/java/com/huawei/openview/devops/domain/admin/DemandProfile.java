package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

@Data
@DatabaseTable(tableName = "demand_profile")
public class DemandProfile extends AbstractBaseEntity {

	@DatabaseField
	private String name;

	@DatabaseField
	private String description;

	@DatabaseField
	private String config;

	@DatabaseField
	private String config_json;

	@DatabaseField
	private String config_filename;

	@DatabaseField(canBeNull = false, defaultValue = "300")
	private Long load_duration;

	@JsonIgnore
	@DatabaseField
	private Long location_id; // NOT USED

	@JsonIgnore
	@DatabaseField
	private Long app_id;

}
