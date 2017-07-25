package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.Location;
import com.huawei.openview.devops.service.admin.DatabaseService;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;

/**
 * @author Sid Askary
 *
 */

@Slf4j
@Singleton
@Path("/openview/api/v1/locations")
public class LocationResource {

	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@GET
	@Produces(Mimes.JSON)
	public Response getLocations() {
		try {
			List<Location> locations = db.getLocationDao().queryForAll();
			String locationsJson = jackson.objectMapper().writeValueAsString(locations);
			return DefaultResponse.ok(locationsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createLocation(Location location) {
		try {
			db.getLocationDao().create(location);
			String locationJson = jackson.objectMapper().writeValueAsString(location);
			return DefaultResponse.created("/openview/api/v1/locations/" + location.getId())
					.entity(locationJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/{id}")
	@Produces(Mimes.JSON)
	public Response getLocationById(@PathParam("id") Long id) {
		try {
			Location location = db.getLocationDao().queryForId(id);
			if (location == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			String locationJson = jackson.objectMapper().writeValueAsString(location);
			return DefaultResponse.ok(locationJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/{id}")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateLocationById(@PathParam("id") Long id, Location location) {
		try {
			Location oldLocation = db.getLocationDao().queryForId(id);
			if (oldLocation == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			location.setId(id);
			db.getLocationDao().update(location);
			String locationJson = jackson.objectMapper().writeValueAsString(location);
			return DefaultResponse.ok(locationJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/{id}")
	@Produces(Mimes.JSON)
	public Response deleteLocationById(@PathParam("id") Long id) {
		try {
			boolean exists = db.getLocationDao().idExists(id);
			if (!exists) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			db.getLocationDao().deleteById(id);
			return DefaultResponse.ok().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}
}
