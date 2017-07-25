package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppSla;
import com.huawei.openview.devops.service.admin.DatabaseService;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;

/**
 * @author Qing Zhou
 */

@Slf4j
@Singleton
@Path("/openview/api/v1/apps/{id}/sla")
public class AppSlaResource {

	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@GET
	@Produces(Mimes.JSON)
	public Response findAppSlaByAppId(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			List<AppSla> appSlas = db.getAppSlaDao().queryForEq(AppSla.APP_ID, id);
			AppSla appSla = appSlas.isEmpty() ? new AppSla() : appSlas.get(0);
			String slaJson = jackson.objectMapper().writeValueAsString(appSla);
			return DefaultResponse.ok(slaJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateAppSlaByAppId(@PathParam("id") Long id, AppSla appSla) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			appSla.setApp_id(id);
			AppSla oldSla = db.querySlaForApp(id);
			if (oldSla != null) appSla.setId(oldSla.getId());
			db.getAppSlaDao().createOrUpdate(appSla);
			String slaJson = jackson.objectMapper().writeValueAsString(appSla);
			return DefaultResponse.ok(slaJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
}
