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
@DatabaseTable(tableName = "user")
public class User extends AbstractBaseEntity {

	@DatabaseField
	private String email;

	@DatabaseField
	private String password;

	@DatabaseField
	private String first_name;

	@DatabaseField
	private String last_name;

	@DatabaseField
	private String profile_url;

}
