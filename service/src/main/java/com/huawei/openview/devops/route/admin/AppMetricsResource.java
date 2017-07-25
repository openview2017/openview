package com.huawei.openview.devops.route.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppMetrics;
import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.service.admin.DatabaseService;
import com.huawei.openview.devops.util.NamingConventionUtil;
import io.undertow.util.Headers;
import kikaha.urouting.api.*;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.*;


/**
 * @author Mengqing Qian
 */


@Slf4j
@Singleton
@Path("/openview/api/v1/apps/{id}/metrics")

public class AppMetricsResource {

    @Inject
    private DatabaseService db;

    @Inject
    private Jackson jackson;

    @Inject
    private  KubeResource k8s;

    @PUT
    @Consumes(Mimes.JSON)
    @Produces(Mimes.JSON)
    public Response updateAppMetricsByAppId(@PathParam("id") Long id, AppMetrics[] appMetrics) {
        try {
            log.debug("updateAppMetricsByAppId - enter...");
            App app = db.getAppDao().queryForId(id);
            if (app == null) {
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            String namespace = NamingConventionUtil.getAppNamespaceNameByAppId(id);
            log.debug("namespace:"+namespace);
            Long k8s_endpoint_id = k8s.getK8sEndpointIdByAppId(id);
            log.debug("k8s_endpoint_id:"+k8s_endpoint_id);
            if(k8s_endpoint_id == null) {
                return DefaultResponse.response().statusCode(404);
            }
            //create map from pod to controller
            okhttp3.Response response_rs = k8s.callKubeMaster(k8s_endpoint_id,"/apis/extensions/v1beta1/namespaces/"+namespace+"/replicasets/","GET",null,null);
            okhttp3.Response response_rc = k8s.callKubeMaster(k8s_endpoint_id,"/api/v1/namespaces/"+namespace+"/replicationcontrollers/","GET",null,null);
            okhttp3.Response response_deploy = k8s.callKubeMaster(k8s_endpoint_id,"/apis/apps/v1beta1/namespaces/"+namespace+"/deployments/","GET",null,null);
            okhttp3.Response response_statefulsets = k8s.callKubeMaster(k8s_endpoint_id,"/apis/apps/v1beta1/namespaces/"+namespace+"/statefulsets/","GET",null,null);

            log.debug("rs:"+ response_rc);
            String k8s_rc_result = response_rc.body().string();
            String k8s_statefulsets_result = response_statefulsets.body().string();
            String k8s_rs_result = response_rs.body().string();
            String k8s_deploy_result = response_deploy.body().string();

            log.debug("k8s_rc_result:" + k8s_rc_result);
            log.debug("k8s_rs_result:" + k8s_rs_result);
            log.debug("k8s_deploy_result:" + k8s_deploy_result);
            log.debug("k8s_statefulsets_result:" + k8s_statefulsets_result);

            ObjectMapper rs_jsonMapper = new ObjectMapper();
            ObjectMapper rc_jsonMapper = new ObjectMapper();
            ObjectMapper statefulsets_jsonMapper = new ObjectMapper();
            ObjectMapper deploy_jsonMapper = new ObjectMapper();

            //deployment
            Iterator<JsonNode> k8s_deploy_res = deploy_jsonMapper.readTree(k8s_deploy_result).get("items").elements();
            Set<String> deploy_set = new HashSet<>();
            while (k8s_deploy_res.hasNext()) {
                JsonNode pod_configs = k8s_deploy_res.next();
                JsonNode metadata = pod_configs.get("metadata");
                if(metadata != null) {
                    JsonNode name =  metadata.get("name");
                    if(name != null) {
                        deploy_set.add(name.asText());
                    }
                }
            }
            //replicasets
            Iterator<JsonNode> k8s_rs_res = rs_jsonMapper.readTree(k8s_rs_result).get("items").elements();
            Set<String> rs_set = new HashSet<>();
            while (k8s_rs_res.hasNext()) {
                JsonNode pod_configs = k8s_rs_res.next();
                JsonNode metadata = pod_configs.get("metadata");
                if(metadata != null) {
                    JsonNode name =  metadata.get("name");
                    if(name != null) {
                        rs_set.add(name.asText());
                    }
                }
            }

            //replicationcontrollers
            Iterator<JsonNode> k8s_rc_res = rc_jsonMapper.readTree(k8s_rc_result).get("items").elements();
            Set<String> rc_set = new HashSet<>();
            while (k8s_rc_res.hasNext()) {
                JsonNode pod_configs = k8s_rc_res.next();
                JsonNode metadata = pod_configs.get("metadata");
                if(metadata != null) {
                    JsonNode name =  metadata.get("name");
                    if(name != null) {
                        rc_set.add(name.asText());
                    }
                }
            }
            //statefulsets
            Iterator<JsonNode> k8s_statefulsets_res = statefulsets_jsonMapper.readTree(k8s_statefulsets_result).get("items").elements();
            Set<String> statefulsets_set = new HashSet<>();
            while (k8s_statefulsets_res.hasNext()) {
                JsonNode pod_configs = k8s_statefulsets_res.next();
                JsonNode metadata = pod_configs.get("metadata");
                if(metadata != null) {
                    JsonNode name =  metadata.get("name");
                    if(name != null) {
                        statefulsets_set.add(name.asText());
                    }
                }
            }

            for(AppMetrics appMetric : appMetrics) {
                appMetric.setApp_id(id);
                String pod_name = appMetric.getPod_name();
                if(deploy_set.contains(pod_name)) {
                    appMetric.setController_kind("Deployment");
                    appMetric.setController_name(pod_name);
                }else if(rs_set.contains(pod_name)) {
                    appMetric.setController_kind("ReplicaSet");
                    appMetric.setController_name(pod_name);
                }else if(rc_set.contains(pod_name)) {
                    appMetric.setController_kind("ReplicationController");
                    appMetric.setController_name(pod_name);
                }else if(statefulsets_set.contains(pod_name)) {
                    appMetric.setController_kind("StatefulSet");
                    appMetric.setController_name(pod_name);
                }else {
                    log.warn("Unable to match the pod_name "+pod_name);
                }
            }
            db.getAppMetricsDao().create(Arrays.asList(appMetrics));
            String metricJson = jackson.objectMapper().writeValueAsString(appMetrics);
            return DefaultResponse.ok(metricJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
        } catch (Exception e) {
            e.printStackTrace();
            return DefaultResponse.serverError(e.getMessage());
        }
    }


    @GET
    @Produces(Mimes.JSON)
    public Response findAppMetrices(@PathParam("id") Long id, @QueryParam("index") String ids) {
        try {
            log.debug("getAppMetrices - enter...");
            App app = db.getAppDao().queryForId(id);
            if (app == null) {
                return DefaultResponse.notFound().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
            }
            List<AppMetrics> appMetrics;
            if("all".equals(ids)) {
                appMetrics = db.getAppMetricsDao().queryForEq(AppMetrics.APP_ID,id);
            }else {
                Object[] index = ids.split(",");
                appMetrics = db.getAppMetricsDao().queryBuilder().where().in(AppMetrics.APP_ID, id).and().in(AppMetrics.INDEX, index).query();
            }

            String appMetricsJson = jackson.objectMapper().writeValueAsString(appMetrics);
            return DefaultResponse.ok(appMetricsJson).header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
        } catch (Exception e) {
            e.printStackTrace();
            return DefaultResponse.serverError(e.getMessage());
        }
    }

    @DELETE
    @Produces(Mimes.JSON)
    public Response deleteAppMetricesByAppId(@PathParam("id") Long id, @QueryParam("index") String ids) {
        try {
            if(!db.getAppDao().idExists(id)) {
                return DefaultResponse.notFound().contentType(Mimes.JSON);
            }
            List<AppMetrics> appMetrics = db.getAppMetricsDao().queryForEq(AppMetrics.APP_ID,id);
            log.debug("metrics :"+appMetrics);
            if (appMetrics == null) {
                return DefaultResponse.notFound().contentType(Mimes.JSON);
            }
            if("all".equals(ids)) {
                db.getAppMetricsDao().delete(appMetrics);
            }else{
                Object[] index = ids.split(",");
                appMetrics = db.getAppMetricsDao().queryBuilder().where().in(AppMetrics.APP_ID, id).and().in(AppMetrics.INDEX, index).query();
                db.getAppMetricsDao().delete(appMetrics);
            }
            return DefaultResponse.ok().header(Headers.CONTENT_TYPE_STRING, Mimes.JSON);
        }catch (Exception e) {
            e.printStackTrace();
            return DefaultResponse.serverError(e.getMessage());
        }
    }
}
