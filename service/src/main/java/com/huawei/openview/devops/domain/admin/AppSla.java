package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

/**
 * @author Qing Zhou
 *
 */

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@DatabaseTable(tableName = "app_sla")
public class AppSla {
	public static final String APP_ID = "app_id";

	@JsonIgnore
	@DatabaseField(generatedId = true)
	private Long id;

	@JsonIgnore
	@DatabaseField
	private Long app_id;

	@DatabaseField(canBeNull = false, defaultValue = "2")
	private Float error_rate;

	@DatabaseField(canBeNull = false, defaultValue = "100")
	private Integer latency;

	@DatabaseField(canBeNull = false, defaultValue = "100")
	private Float cost;

	@DatabaseField(canBeNull = false, defaultValue = "dollar")
	private String currency_type;

}
