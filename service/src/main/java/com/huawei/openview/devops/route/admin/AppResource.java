package com.huawei.openview.devops.route.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.huawei.openview.devops.domain.admin.*;
import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.huawei.openview.devops.service.admin.K8sConfigService;
import com.huawei.openview.devops.util.HttpException;
import com.huawei.openview.devops.util.NamingConventionUtil;
import com.j256.ormlite.dao.Dao;
import com.j256.ormlite.misc.TransactionManager;
import com.j256.ormlite.stmt.DeleteBuilder;
import com.j256.ormlite.stmt.QueryBuilder;
import io.undertow.util.Headers;
import kikaha.config.Config;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.ImmutablePair;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.IOException;
import java.lang.Long;
import java.lang.reflect.Field;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.Callable;

/**
 * @author Sid Askary
 *
 */

@Slf4j
@Singleton
@Path("openview/api/v1/apps")
@Consumes(Mimes.JSON)
@Produces(Mimes.JSON)
public class AppResource {

	@Inject
	private DatabaseService db;

	@Inject
	Config config;

	@Inject
	private Jackson jackson;

	@Inject
	private DemandProfileResource demandProfileResource;

	@Inject
	private AppBlueprintResource blueprintResource;

	@Inject
	private KubeResource kubeResource;

	@Inject
	private K8sConfigService k8sConfigService;

	private List<String> getDeclaredAtributeNames() throws SecurityException, ClassNotFoundException {
		List<String> nameList = new ArrayList<>();
		Field [] fields = Class.forName("com.huawei.openview.devops.domain.admin.ServiceConfig").getDeclaredFields();
		for (int i = 0; i < fields.length; i++) {
			Field field = fields[i];
			if ( field.getName().startsWith("def") ) {
				nameList.add(field.getName().substring(3));
			}
		}
		return nameList;
	}

	public App getApp(Long app_id) throws HttpException {
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (null == app) {
				throw new HttpException(404, "Unable to find app by app_id=" + app_id.toString());
			}
			return app;
		} catch (SQLException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	public AppBlueprint getAppBlueprint(Long app_id) throws HttpException {
		try {
			List<AppBlueprint> appBlueprints = db.getAppBlueprintDao().queryForEq("app_id", app_id);
			AppBlueprint appBlueprint = appBlueprints.isEmpty() ? null : appBlueprints.get(0);
			if (null == appBlueprint) {
				throw new HttpException(404, "Unable to find blueprint by app_id=" + app_id.toString());
			}
			return appBlueprint;
		} catch (SQLException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	private CapacityPlanResult getCapacityPlanResult(App app, Long plan_result_id) throws HttpException {
		try {
			CapacityPlanResult result = db.getCapacityPlanResultDao().queryForId(plan_result_id);
			if (null == result) {
				throw new HttpException(404, "Unable to find capacity plan result by id=" + plan_result_id.toString());
			}
			if (!app.getId().equals(result.getApp_id())) {
				throw new HttpException(404, "capacity plan result app id " + result.getApp_id().toString() + " does not match app " + app.getId().toString());
			}
			return result;
		} catch (SQLException e) {
			e.printStackTrace();
			throw new HttpException(404, e.getMessage());
		}
	}

	private List<SetConfig> getSetConfigs(CapacityPlanResult result) throws HttpException {
		List<SetConfig> setConfigs = result.getSetConfigs();
		if (setConfigs == null) {
			throw new HttpException(404, "Unable to find SetConfigs by result " + result.getPlan_id().toString());
		}
		return setConfigs;
	}

	@POST
	@Path("/{id}/launch")
	public Response launchAppById(@PathParam("id")Long id,
								  @QueryParam("capacity-plan-result-id") Long capacity_plan_result_id) throws SQLException, IOException {
		try {
			App app = getApp(id);
			AppBlueprint appBlueprint = getAppBlueprint(id);
			String entry_point = appBlueprint.getEntry_point();
			CapacityPlanResult result = getCapacityPlanResult(app, capacity_plan_result_id);
			// update the capacity_plan_result_id in app
			app.setCapacity_plan_result_id(capacity_plan_result_id);
			db.getAppDao().update(app);
			// get set config from the capacity plan result
			List<SetConfig> setConfigs = getSetConfigs(result);
			String ns_name = NamingConventionUtil.getAppNamespaceNameByAppId(id);
			Long k8s_endpoint_id = result.getK8s_endpoint_id();
			Long user_id = app.getUser_id();
			String jsonString = appBlueprint.getEdited_content();
			JsonNode root = jackson.objectMapper().readTree(jsonString);
			// config the application k8s config
			ArrayNode edited_json_config = jackson.objectMapper().createArrayNode();
			for (JsonNode section: root) {
				String kindStr = K8sConfigService.getKindStr(section);
				JsonNode specElem = section.get("spec");
				JsonNode containerSpecElem = K8sConfigService.getContainerElem(specElem, kindStr);
				String setName = k8sConfigService.getSetName(section);
				log.debug("------------------{} ({})--------------------------", setName, kindStr);
				// end of deal with property kind
				SetConfig set_config = K8sConfigService.getSetConfig(setConfigs, setName);
				// change the scale
				if (null != set_config && specElem != null) {
					K8sConfigService.changeSpecScale(kindStr, specElem, set_config.getReplicas());
				}
				// change nginx APP_NAME
				if (null != containerSpecElem) {
					k8sConfigService.changeNodeSelector(containerSpecElem, config.getConfig("deps.app_node_selector"), user_id);
				}
				// change the resources limits
				if (null != containerSpecElem && set_config != null) {
					k8sConfigService.changeResourceLimit(set_config, k8s_endpoint_id, containerSpecElem);
				}
				edited_json_config.add(section);
			}
			// update the edited content in database
            blueprintResource.updateAppBlueprintEditedContent(id, jackson.objectMapper().writeValueAsString(edited_json_config));
			// NOTICE: do not plugin KPI sensor before update appBlueprint, it will re-config entry point service in edited content. We do not want to save the configured entry point service in the edited content.
			// plugin the KPI sensor
			ArrayNode kpi_json = k8sConfigService.getKPISensor(root, user_id, ns_name, entry_point, false);
			if (null==kpi_json) {
				return DefaultResponse.preconditionFailed().entity("Invalid configuration, unable to setup KPI sensor.");
			}
            AppStatus appStatus = app.getStatus();
            if (null == appStatus) {
                log.warn("Unable to find appStatus");
                return DefaultResponse.notFound().entity("Unable to find appStatus");
            }
			// deploy the KPI sensor
			Response response = kubeResource.deployK8sJsonConfig(k8s_endpoint_id, NamingConventionUtil.getAppHelperNamespaceNameByAppId(id), kpi_json, true);
			if (response.statusCode()!=200&&response.statusCode()!=201) {
                appStatus.setPhase(AppStatus.Phase.error);
				return response;
			}
			response = kubeResource.deployK8sJsonConfig(k8s_endpoint_id, ns_name, edited_json_config, true);
			// update the app status
            if (response.statusCode()==200||response.statusCode()==201) {
                appStatus.setPhase(AppStatus.Phase.launching);
            } else {
                appStatus.setPhase(AppStatus.Phase.error);
            }
            db.getAppStatusDao().update(appStatus);
			return response;
		} catch (HttpException e) {
			e.printStackTrace();
			return DefaultResponse.response().statusCode(e.getStatus()).entity(e.getMessage());
		} catch (ClassCastException | NullPointerException e) {
			e.printStackTrace();
			return DefaultResponse.preconditionFailed().entity("Invalid container configuration.");
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/{id}/count")
	public Response getAppStatus(@PathParam("id")Long id) {
		return DefaultResponse.notFound().entity("Not implemented.");
	}

	private AppStatus getAppStatus(App app) {
		log.debug("getAppStatus - enter ...");
		Long app_id = app.getId();
		Long k8s_endpoint_id = kubeResource.getK8sEndpointIdByAppId(app_id);
		if (null==k8s_endpoint_id) {
			log.debug("getAppStatus - unable to find k8s endpoint id");
			return null;
		}
		ImmutablePair<Long, Boolean> readiness = kubeResource.getNumberOfRunningPods(k8s_endpoint_id, NamingConventionUtil.getAppNamespaceNameByAppId(app_id));
		try {
			AppStatus appStatus = app.getStatus();
			if (null == appStatus) {
				log.warn("Unable to find appStatus");
				return null;
			}
			if (readiness.getLeft()>=0L) {
				appStatus.setReady_pod_count(readiness.getLeft());
				if (readiness.getLeft().equals(appStatus.getPod_count()) && readiness.getRight() && appStatus.getPhase()!=AppStatus.Phase.deleting) {
					appStatus.setPhase(AppStatus.Phase.launched);
					db.getAppStatusDao().update(appStatus);
				}
				if (readiness.getLeft().equals(0L) && !readiness.getRight() && appStatus.getPhase()==AppStatus.Phase.deleting) {
					appStatus.setPhase(AppStatus.Phase.deleted);
					db.getAppStatusDao().update(appStatus);
				}
				log.debug("getAppStatus - exit ->" + readiness.toString());
				return appStatus;
			} else {
				if (appStatus.getPhase()==AppStatus.Phase.deleting) {
					appStatus.setPhase(AppStatus.Phase.deleted);
					db.getAppStatusDao().update(appStatus);
					log.debug("getAppStatus - deleting -> deleted, but " + readiness.toString());
				} else {
					log.debug("getAppStatus - exit with error ->" + readiness.toString());
				}
				return appStatus;
			}
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@GET
	@Path("/{id}/current-setconfigs")
	public Response getCurrentSetConfigs(@PathParam("id") Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			AppBlueprint blueprint = db.queryBlueprintForApp(id);
			if (blueprint == null) return DefaultResponse.badRequest().entity("original_content not uploaded");

			ArrayList<SetConfig> setConfigs = blueprintResource.extraceBlueprintSetConfigs(blueprint.getEdited_content());
			return DefaultResponse.ok(setConfigs).contentType(Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	public Response getApps() {
		try {
			QueryBuilder<AppStatus, Long> statusQueryBuilder = db.getAppStatusDao().queryBuilder();
			statusQueryBuilder.where().ne(AppStatus.PHASE, AppStatus.Phase.deleted);
			List<App> apps = db.getAppDao().queryBuilder().join(statusQueryBuilder).query();
			ListIterator<App> app_iter = apps.listIterator();
			while (app_iter.hasNext()) {
				App app = app_iter.next();
				AppStatus.Phase appPhase = app.getStatus().getPhase();
				if (appPhase==AppStatus.Phase.launching||appPhase==AppStatus.Phase.deleting) {
					AppStatus appStatus = getAppStatus(app);
					if (null!=appStatus) {
						app.setStatus(appStatus);
						if (appStatus.getPhase()==AppStatus.Phase.deleted) app_iter.remove();
					}
				}
			}
			String appsJson = jackson.objectMapper().writeValueAsString(apps);
			return DefaultResponse.ok(appsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@GET
	@Path("/{id}")
	public Response getAppById(
            @PathParam("id") Long id,
            @QueryParam("detail") Boolean detail
        ) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			if (detail != null && detail) {
				app.setSla(db.querySlaForApp(id));
				app.setBlueprint(db.queryBlueprintForApp(id));
                app.setMode(db.queryModeForApp(id));
			}
            log.debug("app {} detail {}", id, detail);
			String appJson = jackson.objectMapper().writeValueAsString(app);
			return DefaultResponse.ok(appJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/{id}")
	public Response updateAppById(@PathParam("id") Long id, App app) {
		try {
			App oldApp = db.getAppDao().queryForId(id);
			if (oldApp == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);

			app.setId(id);
			// only phase can be updated in status
			if (app.getStatus() != null) oldApp.getStatus().setPhase(app.getStatus().getPhase());
			app.setStatus(oldApp.getStatus());
			db.getAppDao().update(app);
			if (app.getBlueprint() != null) {
				AppBlueprint blueprint = app.getBlueprint();
				blueprint.setApp_id(id);
				AppBlueprint old_blueprint = db.queryBlueprintForApp(id);
				if (old_blueprint != null) {
					blueprint.setId(old_blueprint.getId());
				}
				db.getAppBlueprintDao().createOrUpdate(blueprint);
			}
			if (app.getSla() != null) {
				AppSla sla = app.getSla();
				sla.setApp_id(app.getId());
				AppSla old_sla = db.querySlaForApp(id);
				if (old_sla != null) {
					sla.setId(old_sla.getId());
				}
				db.getAppSlaDao().createOrUpdate(sla);
			}
			if (app.getMode() != null) {
				AppMode mode = app.getMode();
				mode.setApp_id(app.getId());
				AppMode old_mode = db.queryModeForApp(id);
				if (old_mode != null) {
					mode.setId(old_mode.getId());
				}
				db.getAppModeDao().createOrUpdate(mode);
			}
			app = db.getAppDao().queryForId(id);
			String appJson = jackson.objectMapper().writeValueAsString(app);
			return DefaultResponse.ok(appJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	public Response createApp(App app) {
		try {
			if (app.getStatus() == null) {
				AppStatus status = new AppStatus();
				app.setStatus(status);
			}
			db.getAppDao().create(app);
			log.debug("create app {}", app);
			if (app.getBlueprint() != null) {
				AppBlueprint blueprint = app.getBlueprint();
				blueprint.setApp_id(app.getId());
				db.getAppBlueprintDao().create(blueprint);
			}

            AppSla sla = app.getSla() != null? app.getSla():new AppSla();
            sla.setApp_id(app.getId());
			db.getAppSlaDao().create(sla);

			AppMode mode = app.getMode() != null? app.getMode():new AppMode();
			mode.setApp_id(app.getId());
			db.getAppModeDao().create(mode);
			// create empty demand profile
			DemandProfile demandProfile = new DemandProfile();
			demandProfile.setName("New Demand Profile");
			demandProfile.setApp_id(app.getId());
			db.getDemandProfileDao().create(demandProfile);

			demandProfileResource.createDefaultCapacityPlans(app.getId(), demandProfile.getId());

			String appJson = jackson.objectMapper().writeValueAsString(app);
			return DefaultResponse.created("/openview/api/v1/apps/" + app.getId())
					.entity(appJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/{id}")
	public Response deleteAppById(@PathParam("id")Long id) {
		try {
			App app = db.getAppDao().queryForId(id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			AppStatus appStatus = app.getStatus();
			if (null == appStatus) {
				log.warn("Unable to find appStatus");
				return DefaultResponse.notFound().entity("Unable to find appStatus");
			}
			// delete the helper namespace in openview location (capacity planner pods and auto-remediator )
			Long helper_k8s_endpoint_id = Long.parseLong(config.getString("deps.self_k8s_endpoint_id"));
			Response response_helper = kubeResource.removeNamespace(helper_k8s_endpoint_id, NamingConventionUtil.getAppHelperNamespaceNameByAppId(id));
			log.debug("  appResource.removeAppHelper : response = " + response_helper.toString());
			// delete the app namespace
			AppStatus.Phase appPhase = appStatus.getPhase();
			if (appPhase==AppStatus.Phase.launched || appPhase==AppStatus.Phase.launching
					|| appPhase==AppStatus.Phase.deleting || appPhase==AppStatus.Phase.deleted) {// it is OK to delete it again
				appStatus.setPhase(AppStatus.Phase.deleting);
				log.debug("app"+id+" is being deleted.");
				db.getAppStatusDao().update(appStatus);
				Long app_k8s_endpoint_id = kubeResource.getK8sEndpointIdByAppId(id);
				if (null==app_k8s_endpoint_id) {
					return DefaultResponse.notFound().entity("k8s endpoint is not found under app_id="+id.toString());
				}
				// delete the application namespace (the application itself)
				Response response = kubeResource.removeNamespace(app_k8s_endpoint_id, NamingConventionUtil.getAppNamespaceNameByAppId(id));
				if (response.statusCode()!=200&&response.statusCode()!=201) log.warn("  kubeResource.removeNamespace : response = " + response.toString());
				return response;
			} else {
				appStatus.setPhase(AppStatus.Phase.deleted);
				log.debug("app"+id+" was deleted.");
				db.getAppStatusDao().update(appStatus);
			}
//			TransactionManager.callInTransaction(db.getConnectionSource(), new DeleteAppTransaction(db, id));
			return DefaultResponse.ok().entity("deleting");
		} catch (Exception e) {
			e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	private static class DeleteAppTransaction implements Callable<Void> {
		private DatabaseService db;
		private Long id;

		public DeleteAppTransaction(DatabaseService db, long id) {
			this.db = db;
			this.id = id;
		}

		@Override
		public Void call() throws Exception {
			deleteByAppId(db.getAppBlueprintDao(), id);
			deleteByAppId(db.getAppSlaDao(), id);
			deleteByAppId(db.getCapacityPlanDao(), id);
			deleteByAppId(db.getDemandProfileDao(), id);
			db.getAppDao().deleteById(id);
			return null;
		}

		private <T, ID> void deleteByAppId(Dao<T, ID> dao, Long appId) throws SQLException {
			DeleteBuilder<T, ID> deleteBuilder = dao.deleteBuilder();
			deleteBuilder.where().eq(AbstractBaseEntity.APP_ID, appId);
			deleteBuilder.delete();
		}
	}
}
