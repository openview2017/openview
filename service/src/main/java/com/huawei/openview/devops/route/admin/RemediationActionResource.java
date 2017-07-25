package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.action.Actions;
import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppMode;
import com.huawei.openview.devops.domain.admin.RemediationAction;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.huawei.openview.devops.service.admin.KubernetesService;
import com.huawei.openview.devops.service.admin.StatusMessage;
import com.huawei.openview.devops.util.RandomCollection;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

/**
 * @author Qing Zhou
 */

@Slf4j
@Singleton
@Path("openview/api/v1")
public class RemediationActionResource {

    @Inject
    private DatabaseService db;

    @Inject
    private KubernetesService kubernetesService;

	@Inject
	private Jackson jackson;

    private RemediationAction chooseRemediationAction(List<RemediationAction> remediation_actions) {
            RandomCollection<RemediationAction> items = new RandomCollection<>();
            RandomCollection<RemediationAction> first_items = new RandomCollection<>();
            for (RemediationAction remediation_action: remediation_actions) {
                    Float confidence_score = remediation_action.getConfidence_score();
                    if (confidence_score == null) {
                        first_items.add(1, remediation_action);
                    } else {
                        items.add(confidence_score, remediation_action);
                    }
            }
            RemediationAction item = first_items.next();
            if (item == null) {
                item = items.next();
            }
            log.debug("select RemediationAction {}", item);
            return item;
    }

    private boolean filterRemediationAction(AppMode appMode, RemediationAction remediation_action) {
            Timestamp timestamp = new Timestamp(System.currentTimeMillis());
            log.debug("current timestamp: {}", timestamp);
            RemediationAction.ActionType action_type = remediation_action.getType();
            if (action_type != null && !action_type.equals(RemediationAction.ActionType.RECOMMENDED)) {
                log.debug("type {} is not expected {}", action_type, RemediationAction.ActionType.RECOMMENDED);
                return false;
            }
            if (appMode != null) {
                Integer automation_level = appMode.getAutomation_level();
                Float confidence_score = remediation_action.getConfidence_score();
                log.debug("automation level: {}", automation_level);
                if (confidence_score != null && automation_level != null) {
                    if (confidence_score * 100 < automation_level) {
                        log.debug("ignore RemediationAction {} since it is below automation level", remediation_action);
                        return false;
                    }
                } else {
                    log.debug("confidence_score {} or automation_level {} is null", confidence_score, automation_level);
                }
            } else {
                log.debug("app mode is null");
            }
            Timestamp expiration_timestamp = remediation_action.getExpiration_time();
            log.debug("expiration timestamp: {}", expiration_timestamp);
            if (expiration_timestamp != null && expiration_timestamp.before(timestamp)) {
                log.debug("ignore RemediationAction {} since it expires", remediation_action);
                return false;
            }
            return true;
    }

    private List<RemediationAction> filterRemediationActions(AppMode appMode, List<RemediationAction> remediation_actions) {
        List<RemediationAction> items = new ArrayList<RemediationAction>();
        for (RemediationAction remediation_action: remediation_actions) {
                if (this.filterRemediationAction(appMode, remediation_action)) {
                        items.add(remediation_action);
                }
        }
        return items;
    }

    public List<RemediationAction> executeActions(AppMode appMode, List<RemediationAction> remediation_actions) throws Exception {
        List<RemediationAction> items = this.filterRemediationActions(appMode, remediation_actions);
        if (!items.isEmpty()) {
                RemediationAction remediation_action = this.chooseRemediationAction(items);
                if (remediation_action != null) {
                    remediation_action.setType(RemediationAction.ActionType.AUTO_APPLIED);
                    db.getRemediationActionDao().update(remediation_action);
                    this.executeActionInternal(remediation_action, false);
                    ArrayList<RemediationAction> updated_remediation_actions = new ArrayList<>();
                    updated_remediation_actions.add(remediation_action);
                    return updated_remediation_actions;
                }
        }
        return remediation_actions;
    }

    public StatusMessage executeAction(AppMode appMode, RemediationAction remediation_action) throws Exception {
        if (this.filterRemediationAction(appMode, remediation_action)) {
            return this.executeActionInternal(remediation_action, false);
        }
        return null;
    }

    private StatusMessage executeActionInternal(RemediationAction remediation_action, Boolean rethrow) throws Exception {
        try {
            remediation_action.setStatus(RemediationAction.ActionStatus.APPLYING);
            db.getRemediationActionDao().update(remediation_action);
            StatusMessage statusMessage = kubernetesService.updateKubernetes(remediation_action);
            log.debug("updateKubernetes : result = " + statusMessage);
            return statusMessage;
        } catch (Exception e) {
            e.printStackTrace();
            try {
                remediation_action.setStatus(RemediationAction.ActionStatus.K8SCOMMUNICATIONERROR);
                remediation_action.setFinishing_time(System.currentTimeMillis()/1000);
                db.getRemediationActionDao().update(remediation_action);
            } catch (Exception e2) {
                e2.printStackTrace();
            }
            if (rethrow) {
                throw e;
            } else {
                return null;
            }
        }
    }

    public static List<Long> getActionIds(String action_ids) {
        if (action_ids == null) {
            return null;
        }
        String[] actions = action_ids.split(",");
        ArrayList<Long> ids = new ArrayList<>();
        for (String action : actions) {
            ids.add(Long.valueOf(action));
        }
        return ids;
    }

    private HashMap<RemediationAction.ActionType, Long> getActionSummary(Long app_id, String startTime, String endTime) throws SQLException {
        List<RemediationAction> remediationActions = db.queryRemediationActions(app_id, startTime, endTime, null, null, null, null);
        HashMap<RemediationAction.ActionType, Long> actions_summary = new HashMap<>();
        for (RemediationAction remedicationAction : remediationActions) {
            Long count = actions_summary.getOrDefault(remedicationAction.getType(), Long.valueOf(0));
            actions_summary.put(remedicationAction.getType(), count + 1);
        }
        return actions_summary;
    }

    public List<RemediationAction.ActionStatus> parseActionStatuses(String statuses) {
        if (statuses == null) {
            return null;
        }
        String[] status_list = statuses.split(",");
        ArrayList<RemediationAction.ActionStatus> action_statuses = new ArrayList<>();
        for (String status : status_list) {
            action_statuses.add(RemediationAction.ActionStatus.valueOf(status));
        }
        return action_statuses;
    }
    @GET
    @Path("/apps/{app_id}/actions")
    @Produces(Mimes.JSON)
    public Response findRemediationActionsByAppId(
        @PathParam("app_id") Long app_id,
        @QueryParam("starttime") String startTime, @QueryParam("endtime") String endTime,
        @QueryParam("statuses_in") String statuses_in, @QueryParam("statuses_notin") String statuses_notin,
        @QueryParam("isexpired") Boolean isExpired, @QueryParam("action_ids") String action_ids
    ) {
	try {
            App app = db.getAppDao().queryForId(app_id);
            if (app == null) {
                log.debug("app {} not found", app_id);
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            Actions actions = new Actions();
            actions.setActions_detail(
                    db.queryRemediationActions(
                            app_id, startTime, endTime, isExpired, getActionIds(action_ids),
                            parseActionStatuses(statuses_in), parseActionStatuses(statuses_notin)
                    )
            );
            log.debug("find app {} actions {}", app_id, actions);
            actions.setActions_summary(getActionSummary(app_id, startTime, endTime));
            String remediationActionsJson = jackson.objectMapper().writeValueAsString(actions);
            return DefaultResponse.ok(remediationActionsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
	} catch (Exception e) {
            e.printStackTrace();
	    return DefaultResponse.serverError(e.getMessage());
	}
    }

	@GET
	@Path("/apps/{app_id}/actions/{action_id}")
	@Produces(Mimes.JSON)
	public Response findRemediationActionById(@PathParam("app_id") Long app_id, @PathParam("action_id") Long action_id) { // Guobin ok
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (app == null) {
                            log.debug("app {} not found", app_id);
                            return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        }
            RemediationAction remediationAction = db.getRemediationActionDao().queryForId(action_id);
            if (remediationAction == null) {
                    log.debug("app {} action {} not found", app_id, action_id);
                    return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            if (!remediationAction.getApp_id().equals(app_id)) {
                    log.debug("app {} does not have action {}", app_id, action_id);
                    return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            log.debug("find app {} action {}: {}", app_id, action_id, remediationAction);
            String remediationActionJson = jackson.objectMapper().writeValueAsString(remediationAction);
            log.debug("app {} action {} string {}", app_id, action_id, remediationActionJson);
            return DefaultResponse.ok(remediationActionJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
            e.printStackTrace();
			return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PUT
	@Path("/apps/{app_id}/actions")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response addRemediationActionsByAppId(
                @PathParam("app_id") Long app_id, RemediationAction[] remediationActions
        ) { // Guobin ok
	    try {
		App app = db.getAppDao().queryForId(app_id);
		if (app == null) {
                    log.debug("app {} not found", app_id);
                    return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                }
                AppMode appMode = db.queryModeForApp(app_id);
                for (RemediationAction remediationAction : remediationActions) {
                    remediationAction.setApp_id(app_id);
                }
                List<RemediationAction> update_remediation_actions = this.executeActions(
                    appMode, Arrays.asList(remediationActions)
                );
                log.debug("add app {} actions {}", app_id, update_remediation_actions);
                for (RemediationAction remediationAction : update_remediation_actions) {
                   db.getRemediationActionDao().create(remediationAction);
                }
                String remediationActionsJson = jackson.objectMapper().writeValueAsString(update_remediation_actions);
                return DefaultResponse.ok(remediationActionsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
	    } catch (Exception e) {
                e.printStackTrace();
		return DefaultResponse.serverError(e.getMessage());
	    }
	}

	@POST
	@Path("/apps/{app_id}/actions")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateRemediationActionsByAppId(
                @PathParam("app_id") Long app_id, RemediationAction[] remediationActions
        ) { // Guobin ok
	    try {
		App app = db.getAppDao().queryForId(app_id);
		if (app == null) {
                    log.debug("app {} not found", app_id);
                    return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                }
                log.debug("update app {} actions {}", app_id, remediationActions);
	           // List<RemediationAction> old_remediationActions = db.getRemediationActionDao().queryForEq(RemediationAction.APP_ID, app_id);
            //     db.getRemediationActionDao().delete(old_remediationActions);
                for (RemediationAction remediationAction : remediationActions) {
                    remediationAction.setApp_id(app_id);
                }
                AppMode appMode = db.queryModeForApp(app_id);
                List<RemediationAction> update_remediation_actions = this.executeActions(
                    appMode, Arrays.asList(remediationActions)
                );
                log.debug("set app {} actions {}", app_id, update_remediation_actions);
                for (RemediationAction remediationAction : update_remediation_actions) {
                    db.getRemediationActionDao().create(remediationAction);
                }
                String remediationActionsJson = jackson.objectMapper().writeValueAsString(remediationActions);
                return DefaultResponse.ok(remediationActionsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
	    } catch (Exception e) {
                e.printStackTrace();
	        return DefaultResponse.serverError(e.getMessage());
	    }
	}

	@PUT
	@Path("/apps/{app_id}/actions/{action_id}")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response updateRemediationActionById(
                @PathParam("app_id") Long app_id, @PathParam("action_id") Long action_id,
                RemediationAction remediationAction
        ) { // Guobin ok
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (app == null) {
                            log.debug("app {} not found", app_id);
                            return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        }
                        RemediationAction oldRemediationAction = db.getRemediationActionDao().queryForId(action_id);
                        if (oldRemediationAction == null) {
                                log.debug("app {} action {} not found", app_id, action_id);
                                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        }
                        if (!oldRemediationAction.getApp_id().equals(app_id)) {
                                log.debug("app {} does not have action {}", app_id, action_id);
                                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        }
                        remediationAction.setId(action_id);
                        remediationAction.setApp_id(app_id);
                        remediationAction.setType(RemediationAction.ActionType.CUSTOMIZED);
                        db.getRemediationActionDao().update(remediationAction);
                        log.debug("update app {} action {}: {}", app_id, action_id, remediationAction);
                        this.executeAction(null, remediationAction);
                        String remediationActionJson = jackson.objectMapper().writeValueAsString(remediationAction);
                        return DefaultResponse.ok(remediationActionJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
		    e.printStackTrace();
            return DefaultResponse.serverError(e.getMessage());
		}
	}

	@PATCH
	@Path("/apps/{app_id}/actions/{action_id}")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
	public Response patchRemediationActionById(
                @PathParam("app_id") Long app_id, @PathParam("action_id") Long action_id,
                RemediationAction remediationAction
        ) { // Guobin ok
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (app == null) {
                log.error("app {} not found", app_id);
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            RemediationAction oldRemediationAction = db.getRemediationActionDao().queryForId(action_id);
            if (oldRemediationAction == null) {
                log.error("app {} action {} not found", app_id, action_id);
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            if (!oldRemediationAction.getApp_id().equals(app_id)) {
                log.error("app {} does not have action {}", app_id, action_id);
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            oldRemediationAction.merge(remediationAction);
            oldRemediationAction.setType(RemediationAction.ActionType.CUSTOMIZED);
            db.getRemediationActionDao().update(remediationAction);
            log.debug("patch app {} action {}: {}", app_id, action_id, remediationAction);
            this.executeAction(null, oldRemediationAction);
            String remediationActionJson = jackson.objectMapper().writeValueAsString(oldRemediationAction);
            return DefaultResponse.ok(remediationActionJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
            e.printStackTrace();
            return DefaultResponse.serverError(e.getMessage());
		}
	}

	@POST
	@Path("/apps/{app_id}/actions/{action_id}/apply")
	@Consumes(Mimes.JSON)
	@Produces(Mimes.JSON)
    Response executeRemediationActionById(
            @PathParam("app_id") Long app_id, @PathParam("action_id") Long action_id
    ) { // Guobin ok
                log.debug("execute app {} action {}", app_id, action_id);
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (app == null) {
                log.error("app {} not found", app_id);
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            RemediationAction remediationAction = db.getRemediationActionDao().queryForId(action_id);
            if (remediationAction == null) {
                    log.error("app {} action {} not found", app_id);
                    return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            if (!remediationAction.getApp_id().equals(app_id)) {
                    log.error("app {} does not have action {}", app_id, action_id);
                    return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            remediationAction.setType(RemediationAction.ActionType.USER_APPROVED);
            db.getRemediationActionDao().update(remediationAction);
            log.debug("apply app {} action {}", app_id, action_id);
            StatusMessage statusMessage = this.executeActionInternal(remediationAction, true);
            if (statusMessage != null && statusMessage.getCode() == 404) {
                remediationAction.setStatus(RemediationAction.ActionStatus.NOTACCEPTABLE);
                db.getRemediationActionDao().update(remediationAction);
            }
            return DefaultResponse.response().statusCode(statusMessage.getCode()).entity(statusMessage.getMesssage());
		} catch (Exception e) {
            e.printStackTrace();
            return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/apps/{app_id}/actions")
	@Produces(Mimes.JSON)
	public Response deleteRemediationActionsByAppId(
                @PathParam("app_id") Long app_id
        ) { // Guobin ok
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
			List<RemediationAction> remediationActions = db.getRemediationActionDao().queryForEq(
                                RemediationAction.APP_ID, app_id);
                        db.getRemediationActionDao().delete(remediationActions);
                        String remediationActionsJson = jackson.objectMapper().writeValueAsString(remediationActions);
                        return DefaultResponse.ok(remediationActionsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
                        e.printStackTrace();
		        return DefaultResponse.serverError(e.getMessage());
		}
	}

	@DELETE
	@Path("/apps/{app_id}/actions/{action_id}")
	@Produces(Mimes.JSON)
	public Response deleteRemediationActionsByAppId(
                @PathParam("app_id") Long app_id, @PathParam("action_id") Long action_id
        ) { // Guobin ok
		try {
			App app = db.getAppDao().queryForId(app_id);
			if (app == null) return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        RemediationAction remediationAction = db.getRemediationActionDao().queryForId(action_id);
                        if (remediationAction == null) {
                                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        }
                        if (remediationAction.getApp_id() != app_id) {
                                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
                        }
                        db.getRemediationActionDao().delete(remediationAction);
                        String remediationActionJson = jackson.objectMapper().writeValueAsString(remediationAction);
                        return DefaultResponse.ok(remediationActionJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
		} catch (Exception e) {
                        e.printStackTrace();
		        return DefaultResponse.serverError(e.getMessage());
		}
	}
}
