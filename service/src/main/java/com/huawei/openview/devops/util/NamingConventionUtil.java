package com.huawei.openview.devops.util;

/**
 * Created by zhang on 4/3/17.
 */
public class NamingConventionUtil {
    static public String getAppNamespaceNameByAppId (Long AppId) { return "app" + AppId;}
    static public String getAppHelperNamespaceNameByAppId (Long AppId) { return "helper-app" + AppId;}
    static public String getDryrunNamespaceName(Long app_id, Long planId, Long dryrun_id) {return "app" + app_id + "planner" + planId + "dryrun" + dryrun_id;}
    static public String getInfluxDBdbNameByUserId(Long user_id) {return "user_"+user_id;}
    static public String getMeasurementTopicNameByNamespaceName(String ns) {return "SLA_metrics_" + ns;}
    static public String getCapacityPlannerPodName(Long capacity_plan_id) {return "capacityplanner"+capacity_plan_id;}
//    static public String getNodeSelectorNameByUserId(Long user_id) { return "user"+user_id;}
}
