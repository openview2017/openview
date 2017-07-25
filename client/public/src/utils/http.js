/**
 * Created by su on 3/23/17.
 */

import axios from 'axios'
import tool from './tool'


let pre = '/api';
const urlUtil = {
    format:function(str){
        var args = Array.prototype.slice.call(arguments,1);
        return str.replace(/{(\d+)}/g,function(match, number){
            return typeof args[number] != undefined
                ? args[number] : match;
        });
    },
    url:{
        capacityPlan: pre + '/openview/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}',
        locations:pre + '/openview/api/v1/locations',
        getAllPlansResult: pre + '/openview/api/v1/apps/{0}/demand-profiles/{1}/all-merged',
        startPlan:pre + '/openview/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}/start',
        stopPlan:pre + '/openview/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}/stop',
        runApplication: pre + '/openview/api/v1/apps/{0}/launch?capacity-plan-result-id={1}',
        actionApply:pre + '/openview/api/v1/apps/{0}/actions/{1}/apply',
        actionList:pre + '/openview/api/v1/apps/{0}/actions?isexpired=false'
    }
}


class HttpUtil {

    addCapacityPlan(appId,dpId,plan){
        let url = urlUtil.format(urlUtil.url.capacityPlan,appId,dpId,'');
        return axios.post(url,plan).then(function(res){
            return res.data;
        });
    }
    deleteCapacityPlan(appId,dpId,planId){
        let url = urlUtil.format(urlUtil.url.capacityPlan,appId,dpId,planId);
        return axios.delete(url).then(function(res){
            return res.data;
        })
    }

    updateCapacityPlan(appId,dpId,planId,plan){
        let url = urlUtil.format(urlUtil.url.capacityPlan,appId,dpId,planId);
        return axios.put(url,plan).then(function(res){
            return res.data;
        });
    }


    getAllPlansResult(appId,dpId,withPlan){
        let url = urlUtil.format(urlUtil.url.getAllPlansResult,appId,dpId);
        let request = axios.get(url).then(function(res){
            let costList_a = [], latencyList_a = [], errorList_a = [],costList_m = [], latencyList_m = [], errorList_m = [];
            let oc = 0;
            let sla = res.data.sla;
            let target = sla.currency_type;
            sla.currency_display = tool.getCurrencyDisplay(target);

            if(typeof res.data.manual_plans != "undefined" && typeof res.data.manual_plans === "object"){
                res.data.manual_plans.map(function (plan, i) {
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                        plan.sla_result.cost !== ""){
                        let cost = tool.currencyConversion(target,plan.sla_result.currency_type,plan.sla_result.cost);
                        plan.sla_result.cost = cost;
                        costList_m.push(cost);
                        oc++;
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                        plan.sla_result.latency!==""){
                        latencyList_m.push(parseFloat(plan.sla_result.latency));
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                        plan.sla_result.error_rate!==""){
                        let error = parseFloat(parseFloat(plan.sla_result.error_rate).toFixed(2));
                        plan.sla_result.error_rate = error;
                        errorList_m.push(error);
                    }
                })
            }
            if(typeof res.data.auto_plans != "undefined" && typeof res.data.auto_plans === "object"){
                res.data.auto_plans.map(function (plan, i) {
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                        plan.sla_result.cost !== ""){
                    	oc++;
                    	let cost = tool.currencyConversion(target,plan.sla_result.currency_type,plan.sla_result.cost);
                        plan.sla_result.cost = cost;
                        costList_a.push(cost);
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                        plan.sla_result.latency!==""){
                        latencyList_a.push(parseFloat(plan.sla_result.latency));
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                        plan.sla_result.error_rate!==""){
                        let error = parseFloat(parseFloat(plan.sla_result.error_rate).toFixed(2));
                        plan.sla_result.error_rate = error;
                        errorList_a.push(error);
                    }
                })
            }

            var ps = 0;
            if (res.data.auto_plans.length>0 || res.data.manual_plans.length>0) {
            	ps = 1;
            }

            if (oc>0) {
            	ps = 2;
            }

            let state = {
                sla:sla,
                locations: res.data.k8sEndpoints,
                pods: res.data.setconfig_selectors,
                autoPlans: res.data.auto_plans,
                manualPlans: res.data.manual_plans,
                costList_a: costList_a,
                latencyList_a: latencyList_a,
                errorList_a: errorList_a,
                costList_m: costList_m,
                latencyList_m: latencyList_m,
				profileState:ps,
                errorList_m: errorList_m
            };



            if(!withPlan){
                let capacityMap = {};
                for ( let i = 0; i < res.data.capacity_plans.length; i++){
                    let item = res.data.capacity_plans[i];
                    capacityMap[item.id] = item;
                }
                for (let i = 0; i < state.manualPlans.length;i++){
                    let item = state.manualPlans[i];
                    if(capacityMap[item['plan_id']]){
                        item['name'] = capacityMap[item['plan_id']]['name'];
                    }
                }

                return state;
            }


            let autoPlan = [];
            let manualPlan = [];
            let capacity = res.data.capacity_plans;
            costList_m.length = 0;
            latencyList_m.length = 0;
            errorList_m.length = 0;


            capacity.forEach(function (item) {
                let obj = {};
                obj['plan_id'] = item.id;
                obj['k8s_endpoint_id'] = item.k8s_endpoint_id;
                obj['name'] = item.name;
                obj['message'] = item.message;
                obj['sla_status'] = '';
                obj['status'] = item.status;
                if (item['is_auto']) {
                    autoPlan.push(obj);
                } else {
                    obj['SetConfigs'] = item['SetConfigs'];
                    manualPlan.push(obj);
                }
            });


            let manualMap = {};
            if(res.data.manual_plans.length > 0){
                res.data.manual_plans.forEach(function (item) {
                    manualMap[item.plan_id] = item;
                })
            };

            manualPlan =  manualPlan.map(function(item){
                if(manualMap[item.plan_id] && manualMap[item.plan_id].sla_result){
                    let plan = manualMap[item.plan_id];
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                        plan.sla_result.cost != ""){
                        costList_m.push(parseFloat(plan.sla_result.cost));
                    }else{
                        costList_m.push(-1);
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                        plan.sla_result.latency!=""){
                        latencyList_m.push(parseFloat(plan.sla_result.latency));
                    }else{
                        latencyList_m.push(-1);
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                        plan.sla_result.error_rate!=""){
                        errorList_m.push(parseFloat(plan.sla_result.error_rate));
                    }else{
                        errorList_m.push(-1);
                    }

                    plan.name = item.name;
                    plan.status = item.status;
                    plan.message = item.message;
                    return plan;
                }else{
                    costList_m.push(-1);
                    latencyList_m.push(-1);
                    errorList_m.push(-1);
                    return item;
                }
            });




            if(res.data.auto_plans.length == 0){
                state.autoPlans = autoPlan;
                state.costList_a = [];
                state.latencyList_a = [];
                state.costList_a = [];
            }else{
                let auto = autoPlan[0];
                state.autoPlans = state.autoPlans.map(function(plan){
                    plan.status = auto.status;
                    plan.message = auto.message;
                    return plan;
                })
            }

            state.manualPlans = manualPlan;

            return state;
        });
        return request;
    }

    getLocations(){
        let url = urlUtil.format(urlUtil.url.locations);
        let request = axios.get(url).then(function(res){
            return res.data;
        });
        return request;
    }

    starPlan(appId,dpId,planId){
        let url = urlUtil.format(urlUtil.url.startPlan,appId,dpId,planId);
        let request = axios.post(url,{}).then(function(res){
            return res.data;
        })
        return request;
    }

    stopPlan(appId,dpId,planId){
        let url = urlUtil.format(urlUtil.url.stopPlan,appId,dpId,planId);
        let request = axios.delete(url,{}).then(function(res){
            return res.data;
        });
        return request;
    }

    getABTData(appId,ids,userId,fromDate,toDate){
        if(typeof userId === "undefined"){
            userId = 1;
        }
        var where = "(time >= now() - 30m) and (time <= now() - 20s) ";
        if(fromDate && toDate){
            where = "(time >= '" + fromDate+ "' ) and (time <= '" +toDate+"' ) ";
        }
        var tail = " GROUP BY time(30s) ORDER BY time DESC";
        var idStrArray = [];
        ids.forEach(function(id){
            idStrArray.push("max(\"" +id+"\") AS \"" + id +"\"");
        })
        var sql = "select " + idStrArray.join(",") + " from ABT_metrics_app" + appId.toString() + " where " + where + tail;
        var queryParam = {q:sql,db:'user_'+userId};
        var query = "/influxdb/query?";
        query += $.param(queryParam);
        let request = axios.get(query).then(function(res){
            return res.data;
        })
        return request;
    }

    applyAction(appId,actionId){
        let request = axios.post(urlUtil.format(urlUtil.url.actionApply,appId,actionId),{}).then(function(res){
            return res.data;
        })
        return request;
    }

    getActions(appId,ids){
        var request;
        var url = urlUtil.format(urlUtil.url.actionList,appId);
        if(ids && ids.length > 0){

            var listUrl = url + "&action_ids=" + encodeURIComponent( ids.join(","));
            request = axios.all([axios.get(url),axios.get(listUrl)]).then(function(array){
                return[array[0].data,array[1].data];
            })
        }else{
            request = axios.get(url).then(function(res){
                return [res.data,{'actions_detail':[]}];
            })
        }
        return request;
    }

    getHistoricalData(appId,userId,fromDate,toDate){

        var where = " where (time >= '" + fromDate+ "' ) and (time <= '" +toDate+"' ) ";
        var tail = " GROUP BY time(30s) ORDER BY time ASC";
        var sql = "SELECT max(\"cost\") AS \"cost\",max(\"total_request\") AS \"total_request\", max(\"latency\") AS \"latency\", max(\"error_rate\") AS \"error_rate\" from SLA_metrics_app"+ appId + " " ;
        sql += where + tail;
        var db = "user_"+userId;
        var queryStr = $.param({q:sql,db:db});
        return axios.get("/influxdb/query?" + queryStr).then(function(res){
            return res.data;
        });

    }
}

const httpUtil = new HttpUtil;
export default httpUtil;
