package com.huawei.openview.devops.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.huawei.openview.devops.domain.action.pod.Item;
import com.huawei.openview.devops.domain.action.pod.ItemStatusContainerStatusStateWaiting;
import com.huawei.openview.devops.domain.action.pod.Pods;
import com.huawei.openview.devops.domain.action.spec.Spec;
import com.huawei.openview.devops.domain.action.spec.Status;
import com.huawei.openview.devops.domain.admin.RemediationAction;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.List;

/**
 * @author Qing Zhou
 */
@Slf4j
public class ActionCheckerUtil {
    public final static ObjectMapper objectMapper = new ObjectMapper();

    public static long calculateNewActionValue(Long value, String action) {
        String info = "calculateNewActionValue : Param : value = " + value + "; action = " + action;
        log.debug(info);

        int length = action.length();
        long newValue = value;

        Character firstChar = action.charAt(0);
        Character lastChar = action.charAt(length -1);

        if (Character.isDigit(firstChar)) { // 3
            newValue = Long.valueOf(action);
        }

        else if (Character.isDigit(lastChar)) { // +1, -1
            long change = Long.valueOf(action);
            newValue =  value + change;
        }

        else if (lastChar.equals('%')) { // -50%, +50%
            int tmp = Integer.valueOf(action.replace("%",""));
            newValue = (long)(value * (1.0 + (float)tmp /100));
        }

        log.debug("calculateNewActionValue : result : newValue = " + newValue);
        return newValue;
    }

    public static long actionTypeForName(String name) {
        long type = 0;
        switch (name) {
            case "custom" :         type = 1;   break;
            case "recommended" :    type = 2;   break;
            case "approved" :       type = 3;   break;
            case "automatic" :      type = 4;   break;
            default:                type = 1;
        }
        return type;
    }

    public  static String specToJson(Spec spec) throws IOException {
        String specJson = objectMapper.writeValueAsString(spec);
        String pattern = "{\"spec\" : {content}\n}";
        return pattern.replace("{content}", specJson);
    }

    public static boolean isReplicasUpdateComplete(Status status, Spec targetSpec) {
        long replicas = status.getReplicas();
        long target = targetSpec.getReplicas();
        log.debug("isReplicasUpdateComplete : " + " : replicas: " + replicas + "; targetReplicas : " + target);
        boolean result = (replicas == target);
        log.info("isReplicasUpdateComplete : result = " + result);
        return result;
    }

    public static UpdatedStatus checkLimitUpdateStatus(Pods pods, Spec targetSpec, RemediationAction.ActionName type) {
        UpdatedStatus updatedStatus = new UpdatedStatus();

        String waitingMessage = null;
        Long targetReplicas = targetSpec.getReplicas();
        Long okReplicas = 0L;
        String targetLimit;
        switch (type) {
            case cpu_quota:
                targetLimit = targetSpec.getTemplate().getSpec().getContainers().get(0).getResources().getLimits().getCpu();
                break;
            case mem_limit:
            default:
                targetLimit = targetSpec.getTemplate().getSpec().getContainers().get(0).getResources().getLimits().getMemory();
                break;
        }

        List<Item> items = pods.getItems();
        for (Item item : items) {
            String newLimit;
            switch (type) {
                case cpu_quota:
                    newLimit = item.getSpec().getContainers().get(0).getResources().getLimits().getCpu();
                    break;
                case mem_limit:
                default:
                    newLimit = item.getSpec().getContainers().get(0).getResources().getLimits().getMemory();
                    break;
            }

            String name = item.getMetadata().getName();
            log.debug("checkLimitUpdateStatus(" + type + ") : " + name + " : currentLimit: " + newLimit + "; targetLimit : " + targetLimit);
            if (newLimit.equalsIgnoreCase(targetLimit)) {
                // log.debug("checkLimitUpdateStatus : item = " + item);
                String phase = item.getStatus().getPhase();
                switch (phase) {
                    case "Pending":
                        try {
                            ItemStatusContainerStatusStateWaiting waiting = item.getStatus().getContainerStatuses().get(0).getState().getWaiting();
                            if (waiting != null) {
                                log.debug("checkLimitUpdateStatus : waiting = " + waiting);
                                waitingMessage = waiting.getMessage();
                                switch (waiting.getReason()) {
                                    case "RunContainerError":
                                        okReplicas ++;
                                        break;
                                    case "ContainerCreating":
                                        // do nothing, check late
                                        break;
                                }
                            }
                        } catch (NullPointerException e) {
                        }
                        try {
                            boolean status = item.getStatus().getConditions().get(0).isStatus();
                            String reason = item.getStatus().getConditions().get(0).getReason();
                            log.debug("checkLimitUpdateStatus(" + type + ") : " + name + " : status: " + status + "; reason : " + reason);
                            if (!status && "Unschedulable".equals(reason)){
                                okReplicas ++;
                                waitingMessage = reason;
                                break;
                            }
                        } catch (NullPointerException e) {
                        }
                        break;
                    case "Running":
                        okReplicas ++;
                        break;
                    default:
                        break;
                }
            }
        }
        if (okReplicas == targetReplicas) {
            updatedStatus.setCompete(true);
            if (waitingMessage == null) {
                updatedStatus.setSuccess(true);
            }else{
                updatedStatus.setSuccess(false);
                updatedStatus.setMessage(waitingMessage);
            }
        }else{
            updatedStatus.setCompete(false);
        }
        return updatedStatus;
    }

    public static String cpuDataFromLong(long value) {
        long shortValue = value / 1000;
        return shortValue + "m";
    }

    public static String memDataFromLong(long value) {
        long shortValue = value / 1024 / 1024;
        return shortValue + "Mi";
    }

    public static void main(String[] args) {
        calculateNewActionValue(2L,"3");
        calculateNewActionValue(2L, "-1");
        calculateNewActionValue(2L,"+2");
        calculateNewActionValue(2L,"+50%");
        calculateNewActionValue(2L,"-50%");
    }
}
