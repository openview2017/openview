package com.huawei.openview.devops.domain.admin;

import com.huawei.openview.devops.domain.AbstractBaseEntity;
import lombok.Data;

/**
 * @author Sid Askary
 *
 */

@Data
public class Authorization extends AbstractBaseEntity {
	
	private String user_name;
	private String hashed_token;
	private Long expiry_epoch;

}
