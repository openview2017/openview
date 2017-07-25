package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

/**
 * Created by zhang on 10/24/16.
 */
@Data
@DatabaseTable(tableName = "app_blueprint")
public class AppBlueprint {
	public static final String APP_ID = "app_id";
	public static final String BLUEPRINT_TYPE_YAML = "YAML";

	@JsonIgnore
	@DatabaseField(generatedId = true)
	private Long id;

	@DatabaseField
	@JsonIgnore
	private Long app_id;

	@DatabaseField(canBeNull = false, defaultValue = BLUEPRINT_TYPE_YAML)
	private String original_type;

	@DatabaseField(canBeNull = false)
	private String original_content;

	@DatabaseField
	private String edited_content;

	@DatabaseField
	private String entry_point;

}
