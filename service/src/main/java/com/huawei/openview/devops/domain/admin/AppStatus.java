package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

/**
 * @author Sid Askary
 *
 */

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@DatabaseTable(tableName = "app_status")
public class AppStatus {
	public static final String ID = "id";
	public static final String PHASE = "phase";
	@JsonIgnore
	@DatabaseField(generatedId = true)
	private Long id;
	@DatabaseField(canBeNull = false, defaultValue = "creating")
	private Phase phase = Phase.creating;
	@DatabaseField
	private Long service_count;
	@DatabaseField
	private Long pod_count;
	@DatabaseField
	private Long container_count;

	private Long ready_pod_count;

	public enum Phase {
		creating, planning, launching, launched, error, deleting, deleted
	}

}
