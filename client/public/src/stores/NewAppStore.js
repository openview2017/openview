import { EventEmitter } from "events";
import dispatcher from '../libs/dispatcher';
require('babel-polyfill');

/**
* NewAppStore
*/
class NewAppStore extends EventEmitter{

    /**
    * constructor
    */
    constructor(){
        super();
        this.selectedStepId = 1;
        this.stepData = this.getInitData();
        this.deploymentData = {
            id: 0,
            locations: [],
            services: [],
            serviceList: [],
            attributeList: [],
            serviceTableHeader: [],
            tableDataStructure: [],
            autoPlans: [],
            manualPlans: [],
            costList: [],
            latencyList: [],
            errorList:[]
        };

        this.appid = null;
        this.topologyView = {"rawData":{}, "services":[], "configsById":{}, "yaml":"", "entryPoint":{} };
        this.selectedDPId = -1;
    }

    /**
    * getTopologyView
    */
    getTopologyView(id) {
        if (typeof id === 'undefined') {
            id = this.appid === null ? 1 : this.appid;
        }

        let topologyViewApi = "api/openview/api/v1/apps/" + id + "?detail=true";
        let slaApi = "/api/openview/api/v1/app/1/appslas";
        let topologyViewDataLocal;
        let slaDataLocal;
        $.when(
            $.getJSON(topologyViewApi, function(data) {
                topologyViewDataLocal = data;
            }),
            // $.getJSON(slaApi, function(data) {
            //     slaDataLocal = data;
            // })
        ).then(() => {
            if (topologyViewDataLocal) {
                let generateConfigs = function(configs, entPt) {
                    let updateConfigs = [];

                    if (Array.isArray( configs )) {
                        configs.forEach((config, idx, arrays) => {
                            let obj = {};
                            obj.name = config.metadata.name;
                            obj.id   = idx;
                            obj.kind = config.kind;
                            if (config.kind == 'Service') {
                                obj.NodePorts = [];
                                config.spec.ports.forEach((port) => {
                                    obj.NodePorts.push(port.port);
                                });
                                obj.entry_point = obj.name == entPt;
                                obj.targets = [];
                                //find targets id for services
                                let target_key = Object.keys(config.spec.selector);
                                let target_val = config.spec.selector[target_key];
                                arrays.forEach((ary, i) => {
                                    if (ary.spec && ary.spec.template && ary.spec.template.metadata && ary.spec.template.metadata.labels && typeof ary.spec.template.metadata.labels[target_key] !== 'undefined' && ary.spec.template.metadata.labels[target_key] == target_val) {
                                        obj.targets.push({reference_id: i});
                                    }
                                });
                                obj.allowedSetEntryPoint = (config.spec && config.spec.type && (config.spec.type == 'NodePort' || config.spec.type == 'LoadBalancer')) ? true : false;
                            }
                            if (["ReplicationController", "StatefulSet", "Deployment"].indexOf(config.kind) != -1) {
                                obj.podConfig = {containersConfig: {}};
                                if (config.spec && config.spec.template && config.spec.template.spec && Array.isArray(config.spec.template.spec.containers)) {
                                    config.spec.template.spec.containers.forEach((ctn) => {
                                        obj.podConfig.containersConfig[ctn.name] = ctn.resources ? ctn.resources : {};
                                    });
                                }
                                if (config.spec && config.spec.template && config.spec.template.metadata && config.spec.template.metadata.labels) {
                                    let lk = Object.keys(config.spec.template.metadata.labels);
                                    obj.podConfig['labels'] = lk.map((lb) => {
                                        return config.spec.template.metadata.labels[lb];
                                    });
                                }
                            }
                            if (config.spec && typeof config.spec.replicas !== 'undefined') {
                                obj.replicas = config.spec.replicas;
                            }
                            updateConfigs.push(obj);
                        });
                    }
                    return updateConfigs;
                }

                let app_id = topologyViewDataLocal.id;
                let app_name = topologyViewDataLocal.name;
                let sla = topologyViewDataLocal.sla ? topologyViewDataLocal.sla : {cost: 0, currency_type: "dollar", latency: 0, error_rate: 0};
                let yaml = topologyViewDataLocal && topologyViewDataLocal.blueprint && topologyViewDataLocal.blueprint.original_content ? topologyViewDataLocal.blueprint.original_content : "";
                let status = topologyViewDataLocal.status;
                let entryPoint = topologyViewDataLocal && topologyViewDataLocal.blueprint && topologyViewDataLocal.blueprint.entry_point ? topologyViewDataLocal.blueprint.entry_point : {};
                topologyViewDataLocal = JSON.parse(topologyViewDataLocal.blueprint.edited_content);
                topologyViewDataLocal.app_id = app_id;
                topologyViewDataLocal.app_name = app_name;
                topologyViewDataLocal.app_sla = sla;
                topologyViewDataLocal.status = status;
                topologyViewDataLocal.SetConfigs = generateConfigs(topologyViewDataLocal, entryPoint);
                let services = [];
                let configsById = {};
                let configures = topologyViewDataLocal.SetConfigs;
                let entryPointObj = {};

                if (typeof configures !== 'undefined') {
                    configures.forEach((config)=>{
                        if (config.kind === 'Service') {
                            services.push(config);
                            if (config.entry_point === true) {
                                entryPointObj = config;
                            }
                        }
                        configsById[config.id] = config;
                    });
                }

                this.topologyView = {"rawData":topologyViewDataLocal, "services":services, "configsById":configsById, "yaml": yaml, "entryPoint": entryPointObj};
                this.emit("change");
                // if (slaDataLocal) {
                //     let sla = {cost: "", currency_type: "dollar", latency: "", error_rate: ""};
                //     if (slaDataLocal.cost) sla.cost = slaDataLocal.cost;
                //     if (slaDataLocal.currency_type)    sla.currency_type = slaDataLocal.currency_type;
                //     if (slaDataLocal.latency)   sla.latency = slaDataLocal.latency;
                //     if (slaDataLocal.error_rate)   sla.error_rate = slaDataLocal.error_rate;
                //     this.topologyView.rawData.app_sla = sla;
                //     this.emit("change");
                // }
                // else {
                //     console.log("Failed to get : " + slaApi);
                // }
            }
            else {
                console.log("Failed to get : " + topologyViewApi);
            }
        });
    };

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    getSLAData() {
        //let slaApi = "/api/mockdata/slaData.json";
        let slaApi = "/api/openview/api/v1/app/" + (this.appid === null ? 1 : this.appid) + "/sla";
        $.getJSON(slaApi, (slaDataLocal) => {
            let sla = {cost: 0, currency_type: "dollar", latency: 0, error_rate: 0};
            let _self = this;
            if (slaDataLocal.cost)             sla.cost = slaDataLocal.cost;
            if (slaDataLocal.currency_type)    sla.currency_type = slaDataLocal.currency_type;
            if (slaDataLocal.latency)          sla.latency = slaDataLocal.latency;
            if (slaDataLocal.error_rate)       sla.error_rate = slaDataLocal.error_rate;
            let now = new Date().getTime();
            async function updateSLA() {
                while ((!_self.topologyView || !_self.topologyView.rawData) && (new Date().getTime() - now <= 2000)) {
                    await _self.sleep(500);
                };
                _self.topologyView.rawData.app_sla = sla;
            }
            updateSLA();
        }).done(() => {
            this.emit("change");
        });
    }

    setSLAData(slaData) {
        let updateTopologyView = (msg) => {
            this.topologyView.rawData.app_sla = slaData;
            this.emit("change");
        }
        if (!slaData.currency_type) slaData.currency_type = "dollar";
        let appID = this.appid === null ? 1 : this.appid;
        $.ajax( { url: "/api/openview/api/v1/app/" + appID + "/sla",
                  method: 'PUT',
                  contentType: "application/json",
                  data: JSON.stringify(slaData),
                  dataType: "json",
                  statusCode: {
                      200: updateTopologyView
                }
        } );
    }

    getDemandProfile() {
        let _self = this;
        let demandProfilesApi = "/api/openview/api/v1/app/" + (this.appid === null ? 1 : this.appid) + "/demand-profiles";
        $.getJSON(demandProfilesApi, (demandProfiles) => {
            let now = new Date().getTime();
            async function updateDP() {
                while ((!_self.topologyView || !_self.topologyView.rawData) && (new Date().getTime() - now <= 2000)) {
                    await _self.sleep(500);
                };
                _self.topologyView.rawData.app_dmdProfile = demandProfiles;
            }
            updateDP();
        }).done(() => {
            this.emit("change");
        });
    }

    /**
    * getTopologyViewData
    */
    getTopologyViewData() {
        return this.topologyView;
    };

    setAppID(id) {
        this.appid = id;
    }

    getAppID() {
        return this.appid;
    }

    getAppName() {
        return this.topologyView.rawData.app_name;
    }

    setDPID (id) {
        this.dpid = id;

    }

    getDPID () {
        return this.dpid;
    }
    /**
    * getInitData
    */
    getInitData(){
        let data= [
                        {
                            id: 1,
                            name: "Application Topology",
                            info: {selected: 1,
                                            applications :[{'id': 1, 'name':'Ngnix', 'instance_ct': 3, 'location': 'location', 'repositories' : 'https://hub.docker.com/_/nginx/', 'publicHost': 80, 'protocol': 'TCP', 'description': 'N/A', 'destinationService': 'MySQL', 'serviceLinkName': 'N/A' },
                                                {'id': 2, 'name':'AcmeAir', 'instance_ct': 2, 'location': 'location;affinity', 'repositories' : 'https://hub.docker.com/_/mySQL/', 'publicHost': 3306, 'protocol': 'TCP', 'description': 'N/A', 'destinationService': 'Couchbase', 'serviceLinkName': 'N/A' },
                                                {'id': 3, 'name':'MySQL', 'instance_ct': 2, 'location': 'location', 'repositories' : 'https://hub.docker.com/_/push/', 'publicHost': 5223, 'protocol': 'TCP', 'description': 'N/A', 'destinationService': 'Couchbase', 'serviceLinkName': 'N/A' }
                                            ]
                                        },
                            appTypes: { selected: "service",
                                                    types: [{id: "service", desc: "Service"},
                                                                    {id: "balancer", desc: "Load Balancer"},
                                                                    {id: "dns", desc: "DNS"}]
                                                },
                            status: "active"
                        },
                        {
                            id: 2,
                            name: "Operational Requirements",
                            info: {
                                cost: {name: "cost", title: "COST", sendto: {name: "Yue Chen", mailto: "engineering@lamienne.com", emailAlias: "Yue.Chen@huawei.com"}},
                                latency: {name: "latency", title: "LATENCY" , sendto: {name: "Xiaoyun Zhu", mailto: "engineering@lamienne.com", emailAlias: "Xiaoyun.Zhu@huawei.com"}},
                                geolocation: {name: "geo-location", title: "GEO LOCATION" , detail: "Exclude region - Africa"},

                                requirements: [{id: 1, name:"cost", title:"Estimated Cost", short_title: "COST",  checked:false, hint: "Set an acceptable budget threshold for your monthly cost.", options:[]}
                                              ,{id: 2, name:"latency", title:"Target Latency", short_title: "LATENCY", checked:false, hint: "Set a maximum threshold for latency.", options:[]}
                                              ,{id: 3, name:"errorrate", title:"Error Rate", short_title: "ERROR RATE", checked:false, hint: "Set a maximum error rate to stay below.", options:[]}
                                            //,{id: 4, name:"geolocation", title:"Geolocation Restriction", short_title: "GEO LOCATION", checked:true, hint: "Define any geographic preferences you may have, whether it's inclusions or exclusions.", options:[]}
                                            //,{id: 5, name:"throughput", title:"Throughput", short_title: "THROUGHPUT", checked:false, hint: "No hints for Throughput yet", options:[]}
                                            //,{id: 6, name:"storage", title:"Persistant Storage", short_title: "STORAGE", checked:false, hint: "No hints for Persistant Storage yet", options:[]}
                                            //,{id: 7, name:"coLocation", title:"Co-location", short_title: "CO-LOCATION", checked:false, hint: "No hints for Persistant Co-location", options:[]}
                                            //,{id: 8, name:"hostAffinity", title:"Host Affinity", short_title: "HOST", checked:false, hint: "No hints for Host Affinity", options:[]}
                                            //,{id: 9, name:"bandwidth", title:"Network Bandwidth", short_title: "BANDWIDTH", checked:false, hint: "No hints for Network Bandwidth", options:[]}
                                    ],

                                options: [{    id: 1, name: "common", hasDelete: false,
                                                        trigger_alert: 1,
                                                        trigger_alert_price: 0,
                                                        send_alert_to: { id: 1, name: "", email_add: "", email_list: ""    },
                                                        remedy_action: {id: 1, name: "Scale Down"}
                                                    },
                                                    {    id: 2, name: "latency", hasDelete: false,
                                                        trigger_alert_above_latency: 100,
                                                        send_alert_to: { id: 1, name: "", email_add: "", email_list: ""},
                                                        remedy_action: { id: 1, name: "Scale Down"}
                                                    },
                                                    {    id: 3, name: "errorrate", hasDelete: false,
                                                        trigger_alert_above_latency: 100,
                                                        send_alert_to: { id: 1, name: "", email_add: "", email_list: ""},
                                                        remedy_action: { id: 1, name: "Scale Down"}
                                                    }
                                                    // ,
                                                    // { id: 3, name: "geolocation",
                                                    //     include: false,
                                                    //     geo_area: { id: 1, name: "Africa"},
                                                    //     geo_area_list: [{    id: 0, name: "" },
                                                    //                                     { id: 1, name: "Africa" },
                                                    //                                     { id: 2, name: "Asia" },
                                                    //                                     { id: 3, name: "Central America" },
                                                    //                                     { id: 4, name: "Eastern Europe" },
                                                    //                                     { id: 5, name: "European Union" },
                                                    //                                     { id: 6, name: "Middle East" },
                                                    //                                     { id: 7, name: "North America" },
                                                    //                                     { id: 8, name: "Oceania" },
                                                    //                                     { id: 9, name: "South America" },
                                                    //                                     { id: 10, name: "Africa" }
                                                    //                                 ]
                                                    // }
                                                    ]

                            },
                            status: "not-active"
                        },
                        {
                            id: 3,
                            name: "Demand Profile",
                            info: {requirementDetails: { name: "Open Summit Conference", description: "25 concurrent users" }},
                            status: "not-active"
                        },
                        {
                            id: 4,
                            name: "Deployment Plans",
                            status: "not-active",
                            info: {}
                        },
                        {
                            id: 5,
                            name: "Deployment Configurations",
                            status: "not-active",
                            info: {}
                        }
                    ];

        //set options for different operational requirements
        let requirements = data.find(x=> x.id === 2).info.requirements;
        let options = data.find(x=> x.id === 2).info.options;
        let common_opt = Object.assign({}, options.find(x=> x.id === 1));
        let latency_opt = Object.assign({}, options.find(x=> x.id === 2));
        let error_rate_opt = Object.assign({}, options.find(x=> x.id === 3));

        let cost = requirements.find(x=> x.id === 1).options.push(common_opt);
        let latency = requirements.find(x=> x.id === 2).options.push(latency_opt);
        let error = requirements.find(x=> x.id === 3).options.push(error_rate_opt);
        //let geolocation = requirements.find(x=> x.id === 3).options.push(geolocation_opt);
        //let throughput = requirements.find(x=> x.id === 4).options.push(common_opt);
        //let storage = requirements.find(x=> x.id === 5).options.push(common_opt);
        //let coLocation = requirements.find(x=> x.id === 6).options.push(common_opt);
        //let hostAffinity = requirements.find(x=> x.id === 7).options.push(common_opt);
        //let bandwidth = requirements.find(x=> x.id === 8).options.push(common_opt);
        //console.log(data);
        return data;
    }

    /**
    * getInfoRequirements
    */
    getInfoRequirements(){
        return this.stepData.find(x=> x.id === 2).info.requirements;
    }

    /**
    * getAllStepData
    */
    getAllStepData(){
        return {
            selectedStep: this.getSelectedStep(),
            stepData: this.stepData,
            appService : this.getStepDataById(1),
            opRequirements : this.getStepDataById(2),
            demandProfile : this.getStepDataById(3),
            deployPlans : this.getStepDataById(4),
            deployConfig : this.getStepDataById(5),
            topologyView : this.topologyView
        }
    }

    /**
    * getStepData
    */
    getStepData(){
        return this.stepData;
    }

    /**
    * getStepDataById
    */
    getStepDataById(id){
        return this.stepData.find(x=> x.id === id);
    }

    /**
    * getSelectedStep
    */
    getSelectedStep(){
        return this.getStepDataById(this.selectedStepId);
    }

    /**
    * getAppServiceTypes
    */
    getAppServiceTypes(){
        return this.getStepDataById(1).appTypes;
    }

    /**
    * getSelectedMenuData
    */
    getSelectedMenuData(){
        let menuData = {};
        let selectedStep = this.getSelectedStep();
        let menuId = utils.getObjVal(selectedStep,"info.selected", -1);
        let apps = utils.getObjVal(selectedStep,"info.applications",[]);
        if (menuId >= 1 && apps.length){
            menuData = selectedStep.info.applications.find(x=> x.id === menuId);
        }
        return menuData;
    }

    /**
    * getDeploymentData
    */
    getDeploymentData() {
        return this.deploymentData;
    }

    /**
    * setSelectedStep
    */
    setSelectedStep(step){
        let selectedStepData =  this.getStepDataById(step);
        switch (step) {
            case 2:
                this.getSLAData();
                break;
            case 3:
                this.getDemandProfile();
                break;
            default:
                break;
        }
        selectedStepData.status = "active";
        this.selectedStepId = step;
        this.emit("chang_step");
        this.emit("change");
    }

    /**
    * setServiceMenuSelected
    */
    setServiceMenuSelected(menu){
        let selectedStepData =  this.getStepDataById(1);
        selectedStepData.info.selected = menu;
        this.emit("change");
    }

    /**
    * setDeploymentData
    */
    setDeploymentData(data) {
        this.deploymentData = data;
        this.emit("change");
    }

    /**
    * initData
    */
    initData(id){
        this.selectedStepId = 1;
        this.stepData = this.getInitData();
        this.topologyView = this.getTopologyView(id);
        this.emit("change");
    }

    /*
    *
    * */
    setSelectedDPId(id){
        this.selectedDPId = id;
        this.emit('profile_changed');
    }

    /*
    *
    * */
    getSelectedDPId(){
        return this.selectedDPId;
    }


    /**
    * handleActions
    */
    handleActions(action){
        switch(action.type){
            case "UPDATE_STEP": {
                this.setSelectedStep(action.step);
                break;
            }

            case "UPDATE_SERVICE_MENU": {
                this.setServiceMenuSelected(action.menuId);
                break;
            }

            case "UPDATE_DEPLOYMENT_DATA": {
                this.setDeploymentData(action.deploymentData);
                break;
            }

            case "UPDATE_SLA_DATA": {
                this.setSLAData(action.slaData);
                break;
            }

        }
    }

}

const newAppStore = new NewAppStore;
dispatcher.register(newAppStore.handleActions.bind(newAppStore));
export default newAppStore;
