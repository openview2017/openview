package com.huawei.openview.devops.domain.admin;

import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

@Data
@DatabaseTable(tableName = "services_config")
public class ServiceConfig extends AbstractBaseEntity {

	@DatabaseField
	private String name;

	@DatabaseField
	private String category;

	@DatabaseField
	private Long def_mem_limit;

	@DatabaseField
	private Integer def_cpu_limit;

	@DatabaseField
	private Integer def_scale;

}