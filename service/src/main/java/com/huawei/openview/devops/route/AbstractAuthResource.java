/**
 * 
 */
package com.huawei.openview.devops.route;

import java.io.IOException;
import java.sql.SQLException;

import org.apache.commons.lang3.StringUtils;

import com.huawei.openview.devops.domain.admin.Authorization;
import com.huawei.openview.devops.service.admin.LoginService;
import com.huawei.openview.devops.util.EncryptUtil;

import lombok.extern.slf4j.Slf4j;

/**
 * @author Sid Askary
 *
 */

@Slf4j
public abstract class AbstractAuthResource {

	protected boolean hasAuthorization(String key, LoginService service){
		String decKey = decryptKey(key);
		String [] values = StringUtils.split(key, '|');
		String randStr = values[0];
		String uname = values[1];
		long expiry = Long.parseLong(values[2]);
		try {
			Authorization auth = service.findAuthorizationByuserName(uname);
			if(auth.getHashed_token().equals(randStr)){
				if(auth.getExpiry_epoch() == expiry) {
					if(expiry > System.currentTimeMillis()) {
						return true;
					}
				}
			}
		} catch (SQLException | IOException e) {
			log.error(e.getMessage());
		}
		return false;
	}
	
	private String decryptKey(String key) {
		return EncryptUtil.jasypt.decrypt(key);
	}
	
}
