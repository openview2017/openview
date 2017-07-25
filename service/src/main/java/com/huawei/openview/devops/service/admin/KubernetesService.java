package com.huawei.openview.devops.service.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.huawei.openview.devops.domain.action.rollback.DeploymentRollback;
import com.huawei.openview.devops.domain.action.rollback.RollbackConfig;
import com.huawei.openview.devops.domain.action.spec.*;
import com.huawei.openview.devops.domain.admin.RemediationAction;
import com.huawei.openview.devops.domain.dryrun.config.PodConfig;
import com.huawei.openview.devops.domain.dryrun.config.Resources;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.route.admin.AppBlueprintResource;
import com.huawei.openview.devops.util.ActionCheckerUtil;
import com.huawei.openview.devops.util.BlueprintParserUtil;
import com.huawei.openview.devops.util.NamingConventionUtil;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;

/**
 * @author Qing Zhou
 *    modified by Bowen Zhang @ Apr 5th, 2017
 */
@Slf4j
public class KubernetesService {

    @Inject
    private Jackson jackson;

    @Inject
    private KubeResource kubeResource;

    @Inject
    private DatabaseService db;

    @Inject
    private KubernetesMonitorMaster kubernetesMonitorMaster;

    public StatusMessage updateKubernetes(RemediationAction action) throws Exception {
        log.debug("updateKubernetes : enter ...");
        log.debug(" Param : app_id = " + action.getApp_id() + "\n\taction name=" + action.getAction_name() + "\n\t" + action.getAction_change_amount());
        log.debug(" Param : config = \n" + action.getSet_config_before_action());

        StatusMessage statusMessage = new StatusMessage();

        // Step 1: calculate parameters
        ActionKubeSettings parsedContext;
        try {
            parsedContext = praseConfig(action);
        } catch (Exception e) {
            statusMessage.setCode(404);
            statusMessage.setMesssage(e.getMessage());
            return statusMessage;
        }

        // setp 2: call KuberResource.callKubeMaster GET
        statusMessage = getCurrentStatus(parsedContext);
        if (statusMessage.getCode() != 200) {
            return statusMessage;
        }

        // Step 3: call KubeResource.callKubeMaster()
        statusMessage = callKuberneteAction(parsedContext);
        if (statusMessage.getCode() != 200) {
            return statusMessage;
        }
        String mainResponseStr = statusMessage.getMesssage();

//        updateRemediatorRecord(parsedContext);

        // Step 4: update context and invoke KubernetesMonitor
        log.debug("\n\n\t\t ***** Step 4: update context and invoke KubernetesMonitor *****");
        kubernetesMonitorMaster.setContext(parsedContext);
        if (!kubernetesMonitorMaster.isStarted()) {
            kubernetesMonitorMaster.start();
            kubernetesMonitorMaster.setStarted(true);
        }else{
            kubernetesMonitorMaster.interrupt();
        }

        log.debug("updateKubernetes : mainResponse = " + mainResponseStr);
        log.debug("updateKubernetes : exit ...");
        return statusMessage;
    }

    private ActionKubeSettings praseConfig(RemediationAction remediationAction) throws SQLException, UnsupportedOperationException {
        log.debug("praseConfig : enter ...");
        Long app_id = remediationAction.getApp_id();
        Long k8s_endpoint_id = kubeResource.getK8sEndpointIdByAppId(app_id);
        // Step 1: calculate parameters
        log.debug("\n\n\t\t ***** Step 1: calculate parameters *****");
        String name;
        String path;
        String method;
        String format;
        String namespace = NamingConventionUtil.getAppNamespaceNameByAppId(app_id);
        SetConfig setconfig = remediationAction.getConfig_before_action();
        if (setconfig != null) {
            String type = setconfig.getKind();
            switch(type.toLowerCase()) {
                case "statefulset":
                case "statefulsets":
                    // Sample : http://localhost:8080/apis/apps/v1beta1/namespaces/acmeair/statefulsets/mysq
                    String statefulsetsPathUrlTemplate = "apis/apps/v1beta1/namespaces/{namespace}/statefulsets/{name}";
                    name = setconfig.getName();
                    path = statefulsetsPathUrlTemplate.replace("{namespace}", namespace).replace("{name}", name);
                    method = "PATCH";
                    format = "strategic-merge-patch+json";
                    break;
                case "replicationcontroller":
                case "replicationcontrollers":
                    String replicationcontrollerPathUrlTemplate = "api/v1/namespaces/{namespace}/replicationcontrollers/{name}";
                    name = setconfig.getName();
                    path = replicationcontrollerPathUrlTemplate.replace("{namespace}", namespace).replace("{name}", name);
                    method = "PATCH";
                    format = "strategic-merge-patch+json";
                    break;
                case "deployment":
                    // Sample : http://localhost:8080/apis/extensions/v1beta1/namespaces/acmeair/deployments/dlpexample
                    String deploymentPathUrlTemplate = "apis/extensions/v1beta1/namespaces/{namespace}/deployments/{name}";
                    name = setconfig.getName();
                    path = deploymentPathUrlTemplate.replace("{namespace}", namespace).replace("{name}", name);
                    method = "PATCH";
                    format = "strategic-merge-patch+json";
                    break;
                default:
                    throw new UnsupportedOperationException("We do NOT support kind : " + type);
            }
        } else {
            throw new UnsupportedOperationException("Unsupported setconfig: " + remediationAction.getConfig_before_action());
        }

        ActionKubeSettings context = new ActionKubeSettings();
        context.setApp_id(app_id);
        context.setK8s_endpoint_id(k8s_endpoint_id);
        context.setPath(path);
        context.setMethod(method);
        context.setFormat(format);
        context.setAction(remediationAction);
        context.setName(setconfig.getName());
        context.setKind(setconfig.getKind());

        log.debug("praseConfig : Result : context = " + context);
        log.debug("praseConfig : exit ...");
        return context;
    }

    private StatusMessage getCurrentStatus(ActionKubeSettings context) throws IOException {
        log.debug("getCurrentStatus : enter ... ");
        log.debug("  Param : context = \n" + context);

        log.debug("\n\n\t\t ***** setp 2: call KuberResource.callBubeMaster GET current status *****");
        okhttp3.Response getResponse = kubeResource.callKubeMaster(context.getK8s_endpoint_id(), context.getPath(), "GET", context.getFormat(), null);
        StatusMessage statusMessage = new StatusMessage();
        if (getResponse == null) {
            statusMessage.setCode(404);
            statusMessage.setMesssage("fail to get response from kubernet server, callKubeMaster() return null !!!");
            return statusMessage;
        }

        log.debug("updateKubernetes : getResponse - codes = " + getResponse.code());
        String getResponseStr = getResponse.body().string();
        log.debug("updateKubernetes : getResponse - body = \n" + getResponseStr);

        statusMessage.setCode(getResponse.code());
        statusMessage.setMesssage(getResponse.message());
        if (statusMessage.getCode() != 200) {
            return statusMessage;
        }

        // construct currentSpec
        Description preDescription = jackson.objectMapper().readValue(getResponseStr, Description.class);
        context.setPreStatusDescription(preDescription);
        log.debug("getCurrentStatus : preDescription = " + preDescription);


        RemediationAction action = context.getAction();

        StatusMessage validateResult = validateContainerName(preDescription.getSpec(), action);
        if (validateResult.getCode() != 200) {
            return validateResult;
        }

        context.setExistingSpec(preDescription.getSpec());
        context.setRollback(false);

        Spec targetSpec = calculateNewSpec(preDescription.getSpec(), context.getAction());
        // HACK: set java -Xmx to memory limit, currently set to all containers
        for (SpecTemplateSpecContainer container : targetSpec.getTemplate().getSpec().getContainers()) {
            if (container.getEnv() == null) container.setEnv(new ArrayList<>());
            if (container.getResources() == null || container.getResources().getLimits() == null) continue;
            String memoryStr = container.getResources().getLimits().getMemory();
            if (memoryStr == null || memoryStr.equals("")) continue;
            String xmxParam = String.format("-Xmx%d", BlueprintParserUtil.parseMemoryResource(memoryStr));
            boolean updatedExist = false;
            for (SpecTemplateSpecContainerEnv env : container.getEnv()) {
                if ("_JAVA_OPTIONS".equals(env.getName())) {
                    env.setValue(xmxParam); // TODO: replace -Xmx, keep the rest
                    updatedExist = true;
                    break;
                }
            }
            if (!updatedExist) {
                container.getEnv().add(new SpecTemplateSpecContainerEnv("_JAVA_OPTIONS", xmxParam, null));
            }
        }
        log.debug("getCurrentStatus : targetSpec = "+ targetSpec);
        context.setTargetSpec(targetSpec);

        // create rollback information
        DeploymentRollback deploymentRollback = new DeploymentRollback();
        deploymentRollback.setKind(action.getConfig_before_action().getKind()+"Rollback"); // DeploymentRollback
        deploymentRollback.setName(action.getConfig_before_action().getName());
        JsonNode root = jackson.objectMapper().readTree(getResponseStr);
        String apiVersion = root.get("apiVersion").asText();
        deploymentRollback.setApiVersion(apiVersion);
        RollbackConfig rollbackTo = new RollbackConfig();
        rollbackTo.setRevision(0);
        deploymentRollback.setRollbackTo(rollbackTo);
        log.debug("getCurrentStatus : deploymentRollback = " + deploymentRollback);
        context.setDeploymentRollback(deploymentRollback);

        log.debug("getCurrentStatus : context = \n"+ context);
        log.debug("getCurrentStatus : exit ... ");
        return statusMessage;
    }

    private StatusMessage validateContainerName(Spec oldSpec, RemediationAction remediationAction) {
        StatusMessage validateResult = new StatusMessage();
        validateResult.setCode(404);

        // get container name from action
        Map<String, Resources> containersConfig = remediationAction.getConfig_before_action().getPodConfig().getContainersConfig();
        String containterName = containersConfig.keySet().iterator().next();
        log.debug("validateContainerName : containterName = " + containterName);

        ArrayList<SpecTemplateSpecContainer> containers = oldSpec.getTemplate().getSpec().getContainers();
        for (SpecTemplateSpecContainer container : containers) {
            if (containterName.equalsIgnoreCase(container.getName())){
                validateResult.setCode(200); // success
                break;
            }
        }
        if (validateResult.getCode() != 200) {
            validateResult.setMesssage("container not exits : " + containterName);
        }
        log.debug("validateContainerName : validateResult = " + validateResult);
        return validateResult;
    }

    private Spec calculateNewSpec(Spec oldSpec, RemediationAction remediationAction) throws IOException {
        String specJson = jackson.objectMapper().writeValueAsString(oldSpec);
        Spec newSpec = jackson.objectMapper().readValue(specJson, Spec.class);
        log.debug("calculateNewSpec : enter ...");
        RemediationAction.ActionName actionName = remediationAction.getAction_name();
        String actionChangeAmount = remediationAction.getAction_change_amount();
        log.debug("calculateNewSpec : actionName : " + actionName + "; actionChangeAmount :" + actionChangeAmount);
        SpecTemplateSpecContainerResources resource = newSpec.getTemplate().getSpec().getContainers().get(0).getResources();
        SpecTemplateSpecContainerResourcesLimits limits;
        switch (actionName) {
            case scale: // change replicas
                Long replicas = newSpec.getReplicas();
                Long newReplicas = ActionCheckerUtil.calculateNewActionValue(replicas, actionChangeAmount);
                newSpec.setReplicas(newReplicas);
                break;
            case cpu_quota:
                limits = resource.getLimits();
                if (limits != null) {
                    String oldCpuStr = limits.getCpu();
                    Long oldCpuValue = BlueprintParserUtil.parseCpuResource(oldCpuStr);
                    Long newCpuValue = ActionCheckerUtil.calculateNewActionValue(oldCpuValue, actionChangeAmount);
                    String newCpuStr = ActionCheckerUtil.cpuDataFromLong(newCpuValue);
                    limits.setCpu(newCpuStr);
                } else { // no limits
                    PodConfig podConfig = remediationAction.getConfig_before_action().getPodConfig();
                    Map<String, Resources> containersConfig = podConfig.getContainersConfig();
                    String containerName = newSpec.getTemplate().getSpec().getContainers().get(0).getName();

                    Resources newActionLimit = containersConfig.get(containerName);
                    String newCpuStr = ActionCheckerUtil.cpuDataFromLong(newActionLimit.getCpu_quota());
                    String newMemStr = ActionCheckerUtil.memDataFromLong(newActionLimit.getMem_limit());

                    SpecTemplateSpecContainerResourcesLimits newSpecLimits = new SpecTemplateSpecContainerResourcesLimits();
                    newSpecLimits.setMemory(newMemStr);
                    newSpecLimits.setCpu(newCpuStr);
                    resource.setLimits(newSpecLimits);
                }
                break;
            case mem_limit:
                limits = resource.getLimits();
                if (limits != null) {
                    String oldMemoryStr = limits.getMemory();
                    Long oldMemoryValue = BlueprintParserUtil.parseMemoryResource(oldMemoryStr);
                    Long newMemoryValue =  ActionCheckerUtil.calculateNewActionValue(oldMemoryValue, actionChangeAmount);
                    String newMemoryStr = ActionCheckerUtil.memDataFromLong(newMemoryValue);
                    limits.setMemory(newMemoryStr);
                } else { // no limits
                    PodConfig podConfig = remediationAction.getConfig_before_action().getPodConfig();
                    Map<String, Resources> containersConfig = podConfig.getContainersConfig();
                    String containerName = newSpec.getTemplate().getSpec().getContainers().get(0).getName();

                    Resources newActionLimit = containersConfig.get(containerName);
                    String newCpuStr = ActionCheckerUtil.cpuDataFromLong(newActionLimit.getCpu_quota());
                    String newMemStr = ActionCheckerUtil.memDataFromLong(newActionLimit.getMem_limit());

                    SpecTemplateSpecContainerResourcesLimits newSpecLimits = new SpecTemplateSpecContainerResourcesLimits();
                    newSpecLimits.setMemory(newMemStr);
                    newSpecLimits.setCpu(newCpuStr);
                    resource.setLimits(newSpecLimits);
                } 
                break;
            default:
                log.error("DO NOT support action : " + actionName);
                break;
        }
        return newSpec;
    }

    private StatusMessage callKuberneteAction(ActionKubeSettings context) throws IOException {
        log.debug("\n\n\t\t ***** Step 3: call KubeResource.callKubeMaster() *****");

        String targetJson = ActionCheckerUtil.specToJson(context.getTargetSpec());
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

@Data
class ActionKubeSettings {
    private Long app_id;
    private RemediationAction action; // match actionJson

    private String name;
    private String kind;

    private Long k8s_endpoint_id;
    private String path;
    private String method;
    private String format;

    private boolean success;
    private Description preStatusDescription;
    private Description afterStatusDescription;

    private Spec existingSpec;
    private Spec targetSpec;

    private boolean rollback;
    private DeploymentRollback deploymentRollback;
    private String rollbackMessage;

    public String status() {
        StringBuffer sb = new StringBuffer();
        sb.append("success : ").append(success).append("; ");
        sb.append("isRollback : ").append(rollback).append("; ");
        sb.append("status : ").append(action.getStatus()).append("; ");
        sb.append("message : ").append(action.getMessage()).append("; ");
        return sb.toString();
    }
}
