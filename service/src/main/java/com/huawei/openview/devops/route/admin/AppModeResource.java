package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppMode;
import com.huawei.openview.devops.service.admin.DatabaseService;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;

/**
 * @author Xicheng Chang
 */

@Slf4j
@Singleton
@Path("/openview/api/v1/apps/{id}/applicationmode")
public class AppModeResource {

	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@GET
	@Produces(Mimes.JSON)
	public Response findAppModeByAppId(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        AppMode appMode = db.queryModeForApp(id);
                        log.debug("find app {} mode {}", id, appMode);
			String modeJson = jackson.objectMapper().writeValueAsString(appMode);
			return DefaultResponse.ok(modeJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateAppModeByAppId(@PathParam("id") Long id, AppMode appMode) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			appMode.setApp_id(id);
			AppMode oldMode = db.queryModeForApp(id);
			if (oldMode != null) appMode.setId(oldMode.getId());
			db.getAppModeDao().createOrUpdate(appMode);
			String modeJson = jackson.objectMapper().writeValueAsString(appMode);
			return DefaultResponse.ok(modeJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
}
