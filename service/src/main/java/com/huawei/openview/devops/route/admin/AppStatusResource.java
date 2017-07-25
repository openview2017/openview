/**
 * 
 */
package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppStatus;
import com.huawei.openview.devops.service.admin.DatabaseService;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * @author Sid Askary
 *
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{id}/status")
public class AppStatusResource {

	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@GET
	@Consumes("application/json")
	@Produces("application/json")	
	public Response findAppStatusById(@PathParam("id") Long id) {
		log.debug("findAppStatusById-enter ..");
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}
			String statusJson = jackson.objectMapper().writeValueAsString(app.getStatus());
			return DefaultResponse.ok(statusJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
	
	@PUT
	@Consumes("application/json")
	@Produces("application/json")
	public Response updateAppStatusById(@PathParam("id") Long id, AppStatus appStatus) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}
			app.getStatus().setPhase(appStatus.getPhase());
			db.getAppStatusDao().update(app.getStatus());
			String statusJson = jackson.objectMapper().writeValueAsString(app.getStatus());
			return DefaultResponse.ok(statusJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

}
