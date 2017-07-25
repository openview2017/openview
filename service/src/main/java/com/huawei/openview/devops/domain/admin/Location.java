package com.huawei.openview.devops.domain.admin;

import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

/**
 * @author Sid Askary
 *
 */
@Data
@DatabaseTable(tableName = "location")
public class Location extends AbstractBaseEntity {

	@DatabaseField
	private String name;

	@DatabaseField
	private Float latitude;

	@DatabaseField
	private Float longitude;

	@DatabaseField
	private String selector;

	@DatabaseField
	private String size_limit;

}

