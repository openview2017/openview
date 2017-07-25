package com.huawei.openview.devops.route.admin;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppBlueprint;
import com.huawei.openview.devops.domain.admin.AppStatus;
import com.huawei.openview.devops.domain.admin.CapacityPlan;
import com.huawei.openview.devops.domain.dryrun.config.PodConfig;
import com.huawei.openview.devops.domain.dryrun.config.Resources;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.huawei.openview.devops.util.YamlJsonData;
import com.huawei.openview.devops.util.YamlUtil;
import com.huawei.openview.devops.util.BlueprintParserUtil;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

/**
 * @author Qing Zhou
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps/{id}/blueprint")
public class AppBlueprintResource {

	@Inject
	private DatabaseService db;

	@Inject
	private Jackson jackson;

	@GET
	@Produces(Mimes.JSON)
	public Response getAppBlueprintByAppID(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			if (appBlueprint == null) appBlueprint = new AppBlueprint();
			String blueprintJson = jackson.objectMapper().writeValueAsString(appBlueprint);
			return DefaultResponse.ok(blueprintJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateAppBlueprintByAppID(@PathParam("id") Long id, AppBlueprint appBlueprint) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			YamlJsonData data = validateBlueprintOriginalAndUpdateEdited(appBlueprint);
			if (!data.isSuccess()) {
				String errorJson = jackson.objectMapper().writeValueAsString(data);
				return DefaultResponse.badRequest().entity(errorJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			appBlueprint.setApp_id(id);
			AppBlueprint oldAppBlueprint = db.queryBlueprintForApp(id);
			if (oldAppBlueprint != null) appBlueprint.setId(oldAppBlueprint.getId());
			db.getAppBlueprintDao().createOrUpdate(appBlueprint);
			syncAppStatusCounts(id);
                        appBlueprint = db.queryBlueprintForApp(id);
			String blueprintJson = jackson.objectMapper().writeValueAsString(appBlueprint);
			return DefaultResponse.ok(blueprintJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/original_content")
	@Produces(Mimes.JSON)
	public Response getOriginalContent(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			String blueprintJson = jackson.objectMapper().writeValueAsString(
					appBlueprint != null ? appBlueprint.getOriginal_content() : null);
			return DefaultResponse.ok(blueprintJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/original_content")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateOriginalContent(@PathParam("id") Long id, String originalContent) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			if (appBlueprint == null) appBlueprint = new AppBlueprint();
			appBlueprint.setApp_id(id);
			appBlueprint.setOriginal_type(AppBlueprint.BLUEPRINT_TYPE_YAML);
			appBlueprint.setOriginal_content(originalContent);
			YamlJsonData data = validateBlueprintOriginalAndUpdateEdited(appBlueprint);
			if (!data.isSuccess()) {
				String errorJson = jackson.objectMapper().writeValueAsString(data);
				return DefaultResponse.badRequest().entity(errorJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			}

			String entry_point = appBlueprint.getEntry_point();
			if (entry_point!=null) {
				try {
					validateBlueprintEntryPoint(appBlueprint.getEdited_content(), entry_point);
				} catch (Exception e) {
					return DefaultResponse.badRequest().entity(e.getMessage());
				}
			}

			// update set configs of capacity plans
			ArrayList<SetConfig> setConfigs = extraceBlueprintSetConfigs(appBlueprint.getEdited_content());
			List<CapacityPlan> plans = db.getCapacityPlanDao().queryForEq(CapacityPlan.APP_ID, id);
			for (CapacityPlan plan : plans) {
				plan.setSetConfigs(setConfigs);
				db.getCapacityPlanDao().update(plan);
			}

			db.getAppBlueprintDao().createOrUpdate(appBlueprint);
			syncAppStatusCounts(id);
			String originalContentJson = jackson.objectMapper().writeValueAsString(appBlueprint.getOriginal_content());
			return DefaultResponse.ok(originalContentJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@MultiPartFormData
	@Path("/original_content")
	@Produces(Mimes.JSON)
	public Response uploadOrginalContent(@PathParam("id") Long id, @FormParam("file") File file) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound();

			if (file.length() > 1024 * 1024) {
				log.debug("upoaded file too large: %d", file.length());
				return DefaultResponse.badRequest().entity("Cannot upload file larger than 1MB");
			}

			String originalContent = new String(Files.readAllBytes(file.toPath()));
			return updateOriginalContent(id, originalContent);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/edited_content")
	@Produces(Mimes.JSON)
	public Response getEditedContent(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound();

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			String blueprintJson = jackson.objectMapper().writeValueAsString(
					appBlueprint != null ? appBlueprint.getEdited_content() : null);
			return DefaultResponse.ok(blueprintJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/edited_content")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateEditedContent(@PathParam("id") Long id, String editedContent) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound();

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			if (appBlueprint == null) {
				return DefaultResponse.badRequest().entity("original_content not uploaded");
			}
			String entry_point = appBlueprint.getEntry_point();
			if (entry_point!=null) {
				try {
					validateBlueprintEntryPoint(editedContent, entry_point);
				} catch (Exception e) {
					return DefaultResponse.badRequest().entity(e.getMessage());
				}
			}
			validateBlueprintEditedContent(editedContent);
			appBlueprint.setEdited_content(editedContent);
			db.getAppBlueprintDao().update(appBlueprint);
			syncAppStatusCounts(id);
			String editedContentJson = jackson.objectMapper().writeValueAsString(appBlueprint.getEdited_content());
			return DefaultResponse.ok(editedContentJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/entry_point")
	@Produces(Mimes.JSON)
	public Response getEntryPoint(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound();

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			String entryPointJson = jackson.objectMapper().writeValueAsString(
					appBlueprint != null ? appBlueprint.getEntry_point() : null);
			return DefaultResponse.ok(entryPointJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/entry_point")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateEntryPoint(@PathParam("id") Long id, String entryPoint) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound();

			AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
			if (appBlueprint == null) {
				return DefaultResponse.badRequest().entity("original_content not uploaded");
			}

			validateBlueprintEntryPoint(appBlueprint.getEdited_content(), entryPoint);
			appBlueprint.setEntry_point(entryPoint);
			db.getAppBlueprintDao().update(appBlueprint);
			String entryPointJson = jackson.objectMapper().writeValueAsString(appBlueprint.getEntry_point());
			return DefaultResponse.ok(entryPointJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	public String updateAppBlueprintEditedContent(long id, String editedContent) throws SQLException, JsonProcessingException {
		App app = db.getAppDao().queryForId(id);
		if (app == null) throw new SQLException("app " + id +" not found");
		AppBlueprint appBlueprint = db.queryBlueprintForApp(id);
		if (appBlueprint == null) throw new SQLException("appblueprint for app "+id+" not found");

		log.debug("trying to parse blueprint content");
		validateBlueprintEditedContent(editedContent);
		appBlueprint.setEdited_content(editedContent);
		db.getAppBlueprintDao().update(appBlueprint);
		log.debug("syncing app status count");
		syncAppStatusCounts(id);
		return appBlueprint.getEdited_content();
	}

	public void validateBlueprintEditedContent(String content) throws JsonParseException {
		try {
			jackson.objectMapper().readTree(content);
			// TODO: validate schema
		} catch (JsonParseException e) {
			throw e;
		} catch (IOException e) { // will not happen
			e.printStackTrace();
		}
	}

	public void validateBlueprintEntryPoint(String editedContent, String entryPoint) throws Exception {
		JsonNode root = jackson.objectMapper().readTree(editedContent);
		if (!root.isArray()) throw new IllegalArgumentException("Blueprint invalid");
		for (final JsonNode node : root) {
			switch (node.at("/kind").asText("")) {
				case "Service":
					switch (node.at("/spec/type").asText("")) {
						case "NodePort":
						case "LoadBalancer":
							if (node.at("/metadata/name").asText("").equals(entryPoint)
									|| entryPoint == null /* verify that there is entry services in the blueprint */) {
								return;
							}
							break;
					}
					break;
			}
		}
		throw new IllegalArgumentException(String.format("Entry point service %s not found", entryPoint));
	}

	public ArrayList<SetConfig> extraceBlueprintSetConfigs(String editedContent) throws Exception {
		JsonNode root = jackson.objectMapper().readTree(editedContent);
		if (!root.isArray()) throw new IllegalArgumentException("Blueprint invalid");

		ArrayList<SetConfig> setConfigs = new ArrayList<SetConfig>();
		long i = 0;
		for (final JsonNode node : root) {
			switch (node.at("/kind").asText("")) {
				case "Job":
					break;
				default:
					JsonNode containersNode = node.at("/spec/template/spec/containers");
					if (containersNode.isArray()) {
						SetConfig setConfig = new SetConfig();
						setConfig.setId(++i);
						setConfig.setKind(node.at("/kind").asText());
						setConfig.setName(node.at("/metadata/name").asText());
						setConfig.setReplicas(node.at("/spec/replicas").asLong(1));
						setConfig.setPodConfig(new PodConfig());
						LinkedHashMap<String, Resources> containersConfig = new LinkedHashMap<String, Resources>();
						setConfig.getPodConfig().setContainersConfig(containersConfig);
						for (final JsonNode container : containersNode) {
							String name = container.at("/name").asText();
							Resources resources = new Resources();

							String cpuRequest = container.at("/resources/requests/cpu").asText(null);
							resources.setCpu_request(BlueprintParserUtil.parseCpuResource(cpuRequest));
							String cpuQuota = container.at("/resources/limits/cpu")
									.asText(resources.getCpu_request() != null ? cpuRequest : "1000m");
							resources.setCpu_quota(BlueprintParserUtil.parseCpuResource(cpuQuota));

							String memRequest = container.at("/resources/requests/memory").asText(null);
							resources.setMem_request(BlueprintParserUtil.parseMemoryResource(memRequest));
							String memLimit = container.at("/resources/limits/memory")
									.asText(resources.getMem_request() != null ? memRequest : "1Gi");
							resources.setMem_limit(BlueprintParserUtil.parseMemoryResource(memLimit));
							containersConfig.put(name, resources);
						}
						setConfigs.add(setConfig);
					}
			}
		}
		return setConfigs;
	}

	private YamlJsonData validateBlueprintOriginalAndUpdateEdited(AppBlueprint blueprint) {
		if (!blueprint.getOriginal_type().equalsIgnoreCase(AppBlueprint.BLUEPRINT_TYPE_YAML)) {
			YamlJsonData data = new YamlJsonData();
			data.setSuccess(false);
			data.setErrorMsg("Only yaml blueprint supported");
		}
		YamlJsonData data = YamlUtil.convertYamlToJson(blueprint.getOriginal_content());
		if (data.isSuccess()) {
			try {
				validateBlueprintEntryPoint(data.getJson(), null);
			} catch (Exception e) {
				data.setSuccess(false);
				data.setErrorMsg(e.getMessage());
				data.setErrorLine(-1);
			}
		}
		if (data.isSuccess()) {
			blueprint.setEdited_content(data.getJson());
		}
		return data;
	}

	public AppStatus syncAppStatusCounts(Long appId) throws SQLException, JsonProcessingException {
		AppBlueprint blueprint = db.queryBlueprintForApp(appId);
		if (blueprint == null || blueprint.getEdited_content() == null) return null;

		try {
			long serviceCount = 0, podCount = 0, containerCount = 0;

			JsonNode root = jackson.objectMapper().readTree(blueprint.getEdited_content());
			if (!root.isArray()) return null;

			for (final JsonNode node : root) {
				switch (node.at("/kind").asText("")) {
					case "Service":
						++serviceCount;
						break;
					case "Job":
						break;
					default:
						if (node.at("/spec/template/spec/containers").isArray()) {
							long replicas = node.at("/spec/replicas").asLong(1);
							log.debug("current replicas {} --> {}", node.at("/spec/replicas").asText(), node.at("/spec/replicas").asLong());
							containerCount += replicas * node.at("/spec/template/spec/containers").size();
							podCount += replicas;
							log.debug("pod count: {}", podCount);
						}
				}
			}

			App app = db.getAppDao().queryForId(appId);
			AppStatus status = app.getStatus();
			status.setService_count(serviceCount);
			status.setPod_count(podCount);
			status.setContainer_count(containerCount);
			db.getAppStatusDao().update(status);

			return status;
		} catch (JsonProcessingException e) {
			throw e;
		} catch (IOException e) { // will not happen
			e.printStackTrace();
		}

		return null;
	}
}
