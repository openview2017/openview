package com.huawei.openview.devops.route.admin;

import com.fasterxml.jackson.core.JsonParseException;
import com.huawei.openview.devops.domain.admin.*;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.huawei.openview.devops.util.YamlJsonData;
import com.huawei.openview.devops.util.YamlUtil;
import com.j256.ormlite.stmt.DeleteBuilder;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Qing Zhou
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{app_id}/demand-profiles")
public class DemandProfileResource {

	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@Inject
	private AppBlueprintResource blueprintResource;

	@GET
	@Produces(Mimes.JSON)
	public Response getDemandProfiles(@PathParam("app_id") Long appId) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			List<DemandProfile> demandProfiles = db.getDemandProfileDao().queryForEq(DemandProfile.APP_ID, appId);
			String demandProfilesJson = jackson.objectMapper().writeValueAsString(demandProfiles);
			return DefaultResponse.ok(demandProfilesJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response createDemandProfile(@PathParam("app_id") Long appId, DemandProfile demandProfile) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			YamlJsonData data = validateDemandProfileConfigAndUpdatejson(demandProfile);
			if (data != null && !data.isSuccess()) {
				String errorJson = jackson.objectMapper().writeValueAsString(data);
				return DefaultResponse.badRequest().entity(errorJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}
			validateDemandProfileConfigJson(demandProfile.getConfig_json());

			demandProfile.setApp_id(appId);
			db.getDemandProfileDao().create(demandProfile);

			createDefaultCapacityPlans(appId, demandProfile.getId());

			String demandProfilesJson = jackson.objectMapper().writeValueAsString(demandProfile);
			return DefaultResponse.created(String.format("openview/api/v1/apps/%d/demand-profiles/%d", appId, demandProfile.getId()))
					.entity(demandProfilesJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/{id}/config")
	@Produces(Mimes.JSON)
	public Response getDemandProfileConfig(@PathParam("app_id") Long appId, @PathParam("id") Long id) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(id);
			if (demandProfile == null || !demandProfile.getApp_id().equals(appId)) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			String demandProfilesConfigJson = jackson.objectMapper().writeValueAsString(demandProfile.getConfig());
			return DefaultResponse.ok(demandProfilesConfigJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	public Response updateDemandProfileConfig(@PathParam("app_id") Long appId, @PathParam("id") Long id, String config, String configFilename) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(id);
			if (demandProfile == null || !demandProfile.getApp_id().equals(appId)) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			demandProfile.setConfig(config);
			YamlJsonData data = validateDemandProfileConfigAndUpdatejson(demandProfile);
			if (data != null && !data.isSuccess()) {
				String errorJson = jackson.objectMapper().writeValueAsString(data);
				return DefaultResponse.badRequest().entity(errorJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}
			if (configFilename != null) {
				demandProfile.setConfig_filename(configFilename);
			}

			db.getDemandProfileDao().update(demandProfile);
			String demandProfilesConfigJson = jackson.objectMapper().writeValueAsString(demandProfile.getConfig());
			return DefaultResponse.ok(demandProfilesConfigJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/{id}/config")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateDemandProfileConfig(@PathParam("app_id") Long appId, @PathParam("id") Long id, String config) {
		return updateDemandProfileConfig(appId, id, config, null);
	}

	@MultiPartFormData
	@Path("/{id}/config")
	@Produces(Mimes.JSON)
	public Response uploadDemandProfileConfig(@PathParam("app_id") Long appId, @PathParam("id") Long id,
											  @FormParam("file") File file, @FormParam("filename") String filename) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(id);
			if (demandProfile == null || !demandProfile.getApp_id().equals(appId)) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			if (file.length() > 1024 * 1024) {
				log.debug("upoaded file too large: %d", file.length());
				return DefaultResponse.badRequest().entity("Cannot upload file larger than 1MB");
			}

			String config = new String(Files.readAllBytes(file.toPath()));
			return updateDemandProfileConfig(appId, id, config, filename);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/{id}")
	@Produces(Mimes.JSON)
	public Response getDemandProfileById(@PathParam("app_id") Long appId, @PathParam("id") Long id) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(id);
			if (demandProfile == null || !demandProfile.getApp_id().equals(appId)) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			String demandProfilesJson = jackson.objectMapper().writeValueAsString(demandProfile);
			return DefaultResponse.ok(demandProfilesJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/{id}")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateDemandProfileById(@PathParam("app_id") Long appId, @PathParam("id") Long id, DemandProfile demandProfile) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			DemandProfile oldDemandProfile = db.getDemandProfileDao().queryForId(id);
			if (oldDemandProfile == null || !oldDemandProfile.getApp_id().equals(appId)) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			// use existing config if not provided
			if (demandProfile.getConfig() != null) {
				YamlJsonData data = validateDemandProfileConfigAndUpdatejson(demandProfile);
				if (data != null && !data.isSuccess()) {
					String errorJson = jackson.objectMapper().writeValueAsString(data);
					return DefaultResponse.badRequest().entity(errorJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
				}
			} else {
				demandProfile.setConfig(oldDemandProfile.getConfig());
			}
			if (demandProfile.getConfig_json() == null) {
				demandProfile.setConfig_json(oldDemandProfile.getConfig_json());
			}
			if (demandProfile.getConfig_filename() == null) {
				demandProfile.setConfig_filename(oldDemandProfile.getConfig_filename());
			}
			validateDemandProfileConfigJson(demandProfile.getConfig_json());

			demandProfile.setId(oldDemandProfile.getId());
			demandProfile.setApp_id(appId);
			db.getDemandProfileDao().update(demandProfile);
			String demandProfilesJson = jackson.objectMapper().writeValueAsString(demandProfile);
			return DefaultResponse.ok(demandProfilesJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/{id}")
	@Produces(Mimes.JSON)
	public Response deleteDemandProfileById(@PathParam("app_id") Long appId, @PathParam("id") Long id) {
		try {
			if (!db.getAppDao().idExists(appId))
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			DemandProfile demandProfile = db.getDemandProfileDao().queryForId(id);
			if (demandProfile == null || !demandProfile.getApp_id().equals(appId)) {
				return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			DeleteBuilder<CapacityPlan, Long> builder = db.getCapacityPlanDao().deleteBuilder();
			builder.where().eq(CapacityPlan.DEMAND_PROFILE_ID, id);
			builder.delete();

			db.getDemandProfileDao().deleteById(id);
			return DefaultResponse.ok().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	public void createDefaultCapacityPlans(Long appId, Long demandProfileId) throws Exception {
		// create two capacity plans, set config according to app blueprint now or later when blueprint uploaded
		K8sEndpoint k8sEndpoint = db.getK8sEndpointDao().queryBuilder().limit(1L).query().get(0);
		AppBlueprint blueprint = db.queryBlueprintForApp(appId);
		ArrayList<SetConfig> setConfigs = blueprint != null ?
				blueprintResource.extraceBlueprintSetConfigs(blueprint.getEdited_content()) : null;
		CapacityPlan autoPlan = new CapacityPlan();
		autoPlan.setApp_id(appId);
		autoPlan.setName("Autoshift");
		autoPlan.setIs_auto(true);
		autoPlan.setDemand_profile_id(demandProfileId);
		autoPlan.setK8s_endpoint_id(k8sEndpoint.getId());
		autoPlan.setSetConfigs(setConfigs);
		db.getCapacityPlanDao().create(autoPlan);
		CapacityPlan manualPlan = new CapacityPlan();
		manualPlan.setApp_id(appId);
		manualPlan.setName("Manual Plan");
		manualPlan.setIs_auto(false);
		manualPlan.setDemand_profile_id(demandProfileId);
		manualPlan.setK8s_endpoint_id(k8sEndpoint.getId());
		manualPlan.setSetConfigs(setConfigs);
		db.getCapacityPlanDao().create(manualPlan);
	}

	private void validateDemandProfileConfigJson(String config) throws JsonParseException {
		if (config == null) return;
		try {
			jackson.objectMapper().readTree(config);
			// TODO: validate schema
		} catch (JsonParseException e) {
			throw e;
		} catch (IOException e) { // will not happen
			e.printStackTrace();
		}
	}

	private YamlJsonData validateDemandProfileConfigAndUpdatejson(DemandProfile demandProfile) {
		if (demandProfile.getConfig() == null) return null;

		YamlJsonData data = YamlUtil.convertYamlToJson(demandProfile.getConfig());
		if (data.isSuccess()) {
			demandProfile.setConfig_json(data.getJson());
		}
		return data;
	}
}