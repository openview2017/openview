/**
 *
 */
package com.huawei.openview.devops.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.j256.ormlite.field.DatabaseField;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class AbstractBaseEntity {
	public static final String ID = "id";
	public static final String APP_ID = "app_id";

	@DatabaseField(generatedId = true)
	private Long id;

	//private String updated_by;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
	@DatabaseField(readOnly = true)
	private Date created;

	//private Date  updated;

}
