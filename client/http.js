/**
 * Created by su on 3/23/17.
 */

import axios from 'axios'


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
        capacityPlan: pre + '/autoshift/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}',
        locations:pre + '/autoshift/api/v1/locations',
        getAllPlansResult: pre + '/autoshift/api/v1/apps/{0}/demand-profiles/{1}/all-merged',
        startPlan:pre + '/autoshift/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}/start',
        stopPlan:pre + '/autoshift/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}/stop'
    }
}


class HttpUtil {
    getCapacityPlan(appId,dpId) {

        let url = urlUtil.format(urlUtil.url.capacityPlan, appId, dpId, '');
        let request = axios.get(url)
            .then(function (res) {
            let capacity = res.data;
            let autoPlan = [];
            let manualPlan = [];
            let id = 0;

            capacity.forEach(function (item) {
                let obj = {};
                obj['plan_id'] = item.id;
                obj['location_id'] = item.location_id;
                obj['name'] = item.name;
                obj['sla_status'] = '';
                obj['status'] = item.status;
                obj['SetConfigs'] = item['SetConfigs'];
                id = item['demand_profile_id'];
                if (item['is_auto']) {
                    autoPlan.push(obj);
                } else {
                    manualPlan.push(obj);
                }
            });

            let pods = [];
            if (capacity.length > 0) {
                let pod = capacity[0];
                pod['SetConfigs'].forEach(function (item) {
                    let tmp = {};
                    tmp.name = item.name;
                    tmp.kind = item.kind;
                    tmp.containers = [];
                    if (item['podConfig']['containersConfig']) {
                        let config = item['podConfig']['containersConfig'];
                        for (let key in config) {
                            let containerItem = {};
                            containerItem['selector'] = key;
                            containerItem['attributes'] = [{
                                "selector": "cpu_quota",
                                "display_name": "CPU"
                            },
                                {
                                    "selector": "mem_limit",
                                    "display_name": "Memory"
                                }];
                            tmp.containers.push(containerItem);
                        }
                    }
                    pods.push(tmp);
                })

            }

            return {
                pods: pods,
                autoPlans: autoPlan,
                manualPlans: manualPlan,
            };
        });
        return request;
    }

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

            if(typeof res.data.manual_plans != "undefined" && typeof res.data.manual_plans === "object"){
                res.data.manual_plans.map(function (plan, i) {
                	//TODO: the logic of this if statements are wrong. Failure her will cost inconsistent data that can not be used inside DeploymentConfigurations
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                        plan.sla_result.cost !== ""){
                        let cost = parseFloat(parseFloat(plan.sla_result.cost).toFixed(2));
                        plan.sla_result.cost = cost;
                        costList_m.push(cost);
                        oc++;
                    } else {
                    	console.err("ERROR: server data is not consistent: cost is missing")
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                        plan.sla_result.latency!==""){
                        latencyList_m.push(parseFloat(plan.sla_result.latency));
                    }else {
                    	console.err("ERROR: server data is not consistent: latency is missing")
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                        plan.sla_result.error_rate!==""){
                        let error = parseFloat(parseFloat(plan.sla_result.error_rate).toFixed(2));
                        plan.sla_result.error_rate = error;
                        errorList_m.push(error);
                    }else {
                    	console.err("ERROR: server data is not consistent: error_rate is missing")
                    }
                })
            }
            if(typeof res.data.auto_plans != "undefined" && typeof res.data.auto_plans === "object"){
                res.data.auto_plans.map(function (plan, i) {
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                        plan.sla_result.cost !== ""){
                    	oc++;
                    	let cost = parseFloat(parseFloat(plan.sla_result.cost).toFixed(2));
                        plan.sla_result.cost = cost;
                        costList_a.push(cost);
                    }else {
                    	console.err("ERROR: server data is not consistent: cost is missing")
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                        plan.sla_result.latency!==""){
                        latencyList_a.push(parseFloat(plan.sla_result.latency));
                    }else {
                    	console.err("ERROR: server data is not consistent: latency is missing")
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                        plan.sla_result.error_rate!==""){
                        let error = parseFloat(parseFloat(plan.sla_result.error_rate).toFixed(2));
                        plan.sla_result.error_rate = error;
                        errorList_a.push(error);
                    }else {
                    	console.err("ERROR: server data is not consistent: error_rate is missing")
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
                sla:res.data.sla,
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
                if(manualMap[item.plan_id]){
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

                    plan.status = item.status;
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

}

const httpUtil = new HttpUtil;
export default httpUtil;