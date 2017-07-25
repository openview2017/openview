package com.huawei.openview.devops.domain.admin;

import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

/**
 * Created by zhang on 10/24/16.
 */
@Data
@DatabaseTable(tableName = "k8s_endpoint")
public class K8sEndpoint extends AbstractBaseEntity {
	public static final String LOCATION_ID = "location_id";
	public static final String NAME = "NAME";

	@DatabaseField
	private String endpoint;

	@DatabaseField
	private String server_certificate;

	@DatabaseField
	private String client_certificate;

	@DatabaseField
	private String key;

	@DatabaseField
	private Long location_id;

	@DatabaseField
	private String name;
}
