package com.huawei.openview.devops.service.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.huawei.openview.devops.domain.action.pod.Item;
import com.huawei.openview.devops.domain.action.pod.Pods;
import com.huawei.openview.devops.domain.action.rollback.DeploymentRollback;
import com.huawei.openview.devops.domain.action.spec.Description;
import com.huawei.openview.devops.domain.action.spec.SpecTemplateSpecContainer;
import com.huawei.openview.devops.domain.action.spec.Status;
import com.huawei.openview.devops.domain.admin.AppBlueprint;
import com.huawei.openview.devops.domain.admin.RemediationAction;
import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.route.admin.AppBlueprintResource;
import com.huawei.openview.devops.util.ActionCheckerUtil;
import com.huawei.openview.devops.util.MyTimer;
import com.huawei.openview.devops.util.NamingConventionUtil;
import com.huawei.openview.devops.util.UpdatedStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.HashMap;

/**
 * @author Qing Zhou
 */
@Slf4j
@Getter
@Setter
public class KubernetesMonitor extends Thread{

    private ActionKubeSettings context;
    private KubeResource kubeResource;
    private AppBlueprintResource appBlueprintResource;

    private final static ObjectMapper objectMapper = new ObjectMapper();
    final static long WORKING_CHECK_PERIOD = 1000l * 5;  // 5 seconds

    private DatabaseService db;

    public KubernetesMonitor(DatabaseService db){
        this.db = db;
    }

    @Override
    public void run() {// Step 5:  check kubernettes status
        MyTimer myTimer = new MyTimer(1000l * 300); // timeout 5 minute
        RemediationAction action = context.getAction();
        while (true) {

            // log.debug("************************** existingSpec = \n"+ context.getExistingSpec());
            // log.debug("************************** targetSpec = \n"+ context.getTargetSpec());

            Date date = new Date(System.currentTimeMillis());
            System.out.println("\nMoniter thread is running : currentTime = " + date + "\n");

            if (!myTimer.isStarted()) {
                myTimer.reStart();
            }
            boolean complete = checkStatusChange(context);
            log.info("after checkStatusChange : complete : " + complete + "; context = [" + context.status() + "];");
            if (complete) {
                System.out.println("context = " + context);

                if (context.isSuccess()) {
                    // Step 7: update remediation_action status
                    if (context.isRollback()) action.setStatus(RemediationAction.ActionStatus.ROLLEDBACK);
                    else action.setStatus(RemediationAction.ActionStatus.APPLIED);
                    action.setFinishing_time(System.currentTimeMillis()/1000);
                    try {
                        log.debug("updated action:"+action.toString());
                        db.getRemediationActionDao().update(action);
                    } catch (SQLException | NullPointerException e ) {
                        e.printStackTrace();
                    }
                    // Step 6: write the actionResponse to app_blueprint edited_content
                    updateAppblueprint(context);
                    // Step 8:  notify autoremediator
                    notifyRemediator(context);

                    myTimer.stop();
                    return;
                } else { // complete rollback failed
                    if (context.isRollback()) {
                        // Step 6: update remediation_action status
                        action.setStatus(RemediationAction.ActionStatus.ROLLBACKFAILED);
                        action.setFinishing_time(System.currentTimeMillis()/1000);
                        try {
                            log.debug("updated action:"+action.toString());
                            db.getRemediationActionDao().update(action);
                        } catch (SQLException | NullPointerException e) {
                            e.printStackTrace();
                        }
                        // Step 7:  notify autoremediator
                        notifyRemediator(context);
                        // Step 8: write the actionResponse to app_blueprint edited_content
                        try {
                            updateAppblueprint(context);
                        } catch (Exception e) {
                            log.error(e.getMessage());
                        }

                        myTimer.stop();
                        return;
                    } else { // complete not-rollback failed
                        log.debug("\n\n\n");
                        log.info("\t\t!!!!!\t\tcheck kubernettes status : faile to update the config, roll back !!!!!");
                        log.debug("\n\n\n");

                        String kind = action.getConfig_before_action().getKind();
                        switch (kind) {
                            case "Deployment":
                            {
                                context.setRollback(true);
                                context.setTargetSpec(context.getExistingSpec());
                                context.setRollbackMessage(action.getMessage());

                                String rollbackPathUrlTemplate = "apis/extensions/v1beta1/namespaces/{namespace}/deployments/{name}/rollback";
                                String name = action.getConfig_before_action().getName();
                                String namespace = NamingConventionUtil.getAppNamespaceNameByAppId(context.getApp_id());
                                String rollbackPathUrl = rollbackPathUrlTemplate.replace("{namespace}", namespace).replace("{name}", name);
                                log.info("rollback : rollbackPathUrl = " + rollbackPathUrl);
                                DeploymentRollback deploymentRollback = context.getDeploymentRollback();
                                try {
                                    String deploymentRollBackJson = objectMapper.writeValueAsString(deploymentRollback);
                                    action.setStatus(RemediationAction.ActionStatus.ROLLINGBACK);
                                    action.setFinishing_time(System.currentTimeMillis()/1000);
                                    log.debug("updated action:"+action.toString());
                                    db.getRemediationActionDao().update(action);
                                    okhttp3.Response actionResponse = kubeResource.callKubeMaster(
                                        context.getK8s_endpoint_id(), rollbackPathUrl, "POST", "json", deploymentRollBackJson
                                    );
                                    String rollbackResponseBody = actionResponse.body().string();
                                    log.debug("rollback : rollbackResponseBody = " +rollbackResponseBody);
                                } catch (IOException | SQLException | NullPointerException e) {
                                    e.printStackTrace();
                                }
                            }
                                break;
                            default:
                            {
                                log.debug("roolback : manually rollback !!!");
                                context.setRollback(true);
                                context.setTargetSpec(context.getExistingSpec());
                                context.setRollbackMessage(action.getMessage());

                                try {
                                    rollback(context);
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                            }
                                break;
                        }
                    }
                }
            } else {
                if (myTimer.isTimeOut()) {
                    context.setSuccess(false);
                    action.setStatus(RemediationAction.ActionStatus.TIMEOUT);
                    action.setFinishing_time(System.currentTimeMillis()/1000);
                    action.setMessage("can't finish within 2 minutes.");
                    // Step 7: update remediation_action status
                    try {
                        log.debug("updated action:"+action.toString());
                        db.getRemediationActionDao().update(action);
                    } catch (SQLException | NullPointerException e) {
                        e.printStackTrace();
                    }
                    // Step 8:  notify autoremediator
                    notifyRemediator(context);
                    myTimer.stop();
                    return;
                }
            }

            try {
                Thread.sleep(WORKING_CHECK_PERIOD);
            } catch (InterruptedException e) {
            }
        } // end of while
    }

    public synchronized  void setContext (ActionKubeSettings context) {
        this.context = context;
    }

    // Step 8: write the response to app_blueprint edited_content
    //TODO:This function is incorrect, only one element in edited_content resource should be updated, the status message should not go into edited_content, please correct
    public boolean updateAppblueprint(ActionKubeSettings context) {

        boolean success = false;
        log.debug("\n\n\t\t ***** starting: update app_blueprint edited_content *****");
//        String edited_content = responseStr.replace("\\\"", "\"").replace("\"", "\\\"");
        long app_id = context.getApp_id();
        Description description = context.getAfterStatusDescription();
        // FIXME: workaround to use target spec as result
        if (description == null && context.isSuccess() && !context.isRollback()) {
            description = new Description();
            description.setKind(context.getKind());
            description.setSpec(context.getTargetSpec());
            Status status = new Status();
            status.setReplicas(context.getTargetSpec().getReplicas());
            description.setStatus(status);
        }
        if (description == null) return false;
        try {
            AppBlueprint appBlueprint = db.queryBlueprintForApp(app_id);
            JsonNode root = objectMapper.readTree(appBlueprint.getEdited_content());
            for (JsonNode node : root) {
                String kind = node.at("/kind").asText("");
                String name = node.at("/metadata/name").asText("");
                if (kind.equals(context.getKind()) && name.equals(context.getName())) {
                    Long replicas = description.getSpec().getReplicas();
                    log.debug("updating "+name+"("+kind+"): replicas -->"+replicas);
                    if (replicas != null) {
                        ObjectNode specNode = (ObjectNode) node.at("/spec");
                        specNode.put("replicas", replicas);
                    }
                    JsonNode containersNode = node.at("/spec/template/spec/containers");
                    if (containersNode==null) continue;
                    try {
                        for (SpecTemplateSpecContainer containerSpec : description.getSpec().getTemplate().getSpec().getContainers()) {
                            String containerName = containerSpec.getName();
                            String cpuLimit = containerSpec.getResources().getLimits().getCpu();
                            String memoryLimit = containerSpec.getResources().getLimits().getMemory();
                            for (final JsonNode containerNode : containersNode) {
                                if (containerNode.at("/name").asText("").equals(containerName)) {
                                    log.debug("\t\t /resources/limits --> cpu:"+cpuLimit+", mem:"+memoryLimit);
                                    ObjectMapper mapper = new ObjectMapper();
                                    HashMap<String, Object> limits = new HashMap<>();
                                    if (cpuLimit != null) limits.put("cpu", cpuLimit);
                                    else limits.put("cpu", "1000m");
                                    if (memoryLimit != null) limits.put("memory", memoryLimit);
                                    else limits.put("memory", "1024MBi");
                                    HashMap<String, HashMap<String, Object> > resources = new HashMap<>();
    					            resources.put("limits", limits);
    					            ((ObjectNode)containerNode).put("resources", mapper.convertValue(resources, JsonNode.class));
                                }
                            }
                        }
                    } catch (NullPointerException e) {
                        log.error(e.getMessage());
                    }
                }
            }
            String edited_content = objectMapper.writeValueAsString(root);
            appBlueprintResource.updateAppBlueprintEditedContent(app_id, edited_content);
            success = true;
        } catch (IOException | SQLException e) {
            log.error(e.getMessage());
        }
        log.debug("\n\n\t\t ***** ended: update app_blueprint edited_content *****");
        return success;
    }

    // Step 8:  notify autoremediator
    public boolean notifyRemediator(ActionKubeSettings context) {
        log.debug("notifyRemediator : enter ...");

        log.debug("\n\n\t\t ***** Step 8:  notify autoremediator *****");

        String remediatorUrlTemplate = "http://autoremediator.helper-app{app_id}:8086/api/v1/action/";
        String remediatorUrl = remediatorUrlTemplate.replace("{app_id}", context.getApp_id().toString());
        log.debug("notifyRemediator : remediatorUrl = " + remediatorUrl);

        // Generate json response to remediator
        RemediationAction action = context.getAction();
         // Use UTC timestamp
        if (context.isSuccess()) {
            if (!context.isRollback()) {
                action.setMessage("OK");
            } else {
                action.setMessage(context.getRollbackMessage());
            }
        }

        // get current status
        okhttp3.Response response = kubeResource.callKubeMaster(context.getK8s_endpoint_id(), context.getPath(), "GET", context.getFormat(), null);
        try {
            action.setResponse_body(response.body().string());
        } catch (IOException e) {
            log.error(e.getMessage());
            action.setResponse_body(e.getMessage());
        }
        boolean success;
        try {
            action.setResponse_body("");  // the response body is useless for ML models
            String jsonStr2Remediator = objectMapper.writeValueAsString(action);
            log.debug("notifyRemediator : jsonStr2Remediator = \n" + jsonStr2Remediator);
            OkHttpClient client = new OkHttpClient();
            RequestBody remediatorRequestBody = RequestBody.create(MediaType.parse("application/json"), jsonStr2Remediator);
            Request remediatorrequest = new Request.Builder()
                .url(remediatorUrl)
                .method("PUT", remediatorRequestBody)
                .build();
            log.debug("notifyRemediator : remediatorrequest = " + remediatorrequest.toString());
            okhttp3.Response remediatorResponse = client.newCall(remediatorrequest).execute();
            log.debug("notifyRemediator : remediatorResponse - *** Status Code  = " + remediatorResponse.code());
            log.debug("notifyRemediator : remediatorResponse - BODY = " + remediatorResponse.body().string());
            success = true;
        } catch (IOException e) {
            e.printStackTrace();
            success = false;
        }

        log.debug("notifyRemediator : result = " + success);
        log.debug("notifyRemediator : exit ...");
        return success;
    }

    // periodically check kubernettes status - GET
    public boolean checkStatusChange(ActionKubeSettings context) {
        log.debug("\n\n\t\t ***** Step 5:  check kubernettes status *****");
        RemediationAction action = context.getAction();
        boolean complete = false;
        UpdatedStatus updatedStatus;
        Pods pods;
        switch (action.getAction_name()) {
            case scale: // replicas
                if (checkStatus(context)) {
                    complete = ActionCheckerUtil.isReplicasUpdateComplete(context.getAfterStatusDescription().getStatus(), context.getTargetSpec());
                }
                context.setSuccess(complete);
                break;
            case cpu_quota: // cpu_limits
                pods = getPodStatus(context);
                updatedStatus = ActionCheckerUtil.checkLimitUpdateStatus(pods, context.getTargetSpec(), RemediationAction.ActionName.cpu_quota);
                complete = updatedStatus.isCompete();
                context.setSuccess(updatedStatus.isSuccess());
                action.setMessage(updatedStatus.getMessage());
                break;
            case mem_limit:
                pods = getPodStatus(context);
                updatedStatus = ActionCheckerUtil.checkLimitUpdateStatus(pods, context.getTargetSpec(), RemediationAction.ActionName.mem_limit);
                complete = updatedStatus.isCompete();
                context.setSuccess(updatedStatus.isSuccess());
                action.setMessage(updatedStatus.getMessage());
                break;
            default:
                log.error("checkStatusChange : actionName not valid : " + action.getAction_name());
                break;
        }

        log.info("checkStatusChange : is status update confirmed ? : " + complete);
        return complete;
    }

    private boolean checkStatus(ActionKubeSettings context) {
        Date date = new Date(System.currentTimeMillis());
        boolean success = false;
        log.debug("\t\t ***** checkStatusChange : step (" + date + ") *****");
        okhttp3.Response response = kubeResource.callKubeMaster(context.getK8s_endpoint_id(), context.getPath(), "GET", context.getFormat(), null);
        if (response == null) return false;
        log.debug("checkStatus : response code = " + response.code());

        try {
            String responseStr = response.body().string();
            success = true;
            Description description = objectMapper.readValue(responseStr, Description.class);
            context.setAfterStatusDescription(description);
            log.debug("checkStatus : description = " + description);
        } catch (IOException e) {
            e.printStackTrace();
            log.error(e.getMessage());
            context.setAfterStatusDescription(null);
        }
        return success;
    }

    private Pods getPodStatus(ActionKubeSettings context) {
        // Sample : http://localhost:8080/api/v1/namespaces/app1/pods
        String podsPathUrlTemplate = "api/v1/namespaces/{namespace}/pods";

        String namespace = NamingConventionUtil.getAppNamespaceNameByAppId(context.getApp_id());
        String name = context.getAction().getConfig_before_action().getName();
        String path = podsPathUrlTemplate.replace("{namespace}", namespace).replace("{name}", name);

        okhttp3.Response response = kubeResource.callKubeMaster(context.getK8s_endpoint_id(), path, "GET", null, null);
        if (response == null) return null;
        String responseBody = null;
        try {
            responseBody = response.body().string();
        } catch (IOException e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return null;
        }

        try {
            Pods relatedPods = new Pods();
            Pods allPods  = objectMapper.readValue(responseBody, Pods.class);
            String allPodsJson = objectMapper.writeValueAsString(allPods);
            relatedPods.setKind(allPods.getKind());
            List<Item> items =  allPods.getItems();
            List<Item> relatedItems = new ArrayList<>();
            for (Item item : items) {
                if (item.getMetadata().getName().startsWith(name)) {
                    relatedItems.add(item);
                }
            }
            relatedPods.setItems(relatedItems);
            String relatedPodsJson = objectMapper.writeValueAsString(relatedPods);
            log.info("getPodStatus : relatedPodsJson = \n" + relatedPodsJson);
            context.setAfterStatusDescription(null); // TODO
            return relatedPods;
        } catch (IOException e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return null;
        }
    }

    // TODO this method is duplicated with the same name function in KuberneteService.callKuberneteAction(), need to be merged
    public StatusMessage rollback(ActionKubeSettings context) throws IOException {
        log.debug("\n\n\t\t ***** Step 3: call KubeResource.callKubeMaster() *****");

        String targetJson = ActionCheckerUtil.specToJson(context.getExistingSpec());
        okhttp3.Response actionResponse = kubeResource.callKubeMaster(context.getK8s_endpoint_id(), context.getPath(), context.getMethod(), context.getFormat(), targetJson);

        StatusMessage statusMessage = new StatusMessage();
        if (actionResponse == null) {
            statusMessage.setCode(404);
            statusMessage.setMesssage("fail to get response from kubernet server, callKubeMaster() return null !!!");
            return statusMessage;
        }

        log.debug("callKuberneteAction : actionResponse code = " + actionResponse.code());
        String responseStr = actionResponse.body().string();
        log.debug("callKuberneteAction : actionResponse body = \n" + responseStr);
        statusMessage.setCode(200);
        statusMessage.setMesssage(actionResponse.message());
        log.debug("callKuberneteAction : statusMessage = " + statusMessage);

        return statusMessage;
    }
}
