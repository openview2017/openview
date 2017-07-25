import { EventEmitter } from 'events';
import DashboardDispatcher from '../dispatcher/DashboardDispatcher'
import { DashboardConstants } from '../constants/DashboardConstants'
import moment from 'moment'
import HttpUtil from '../utils/http'

const CHANGE_EVENT = 'change';
const SHOW_LEARN_MORE = 'show_learn_more';

let _24HrSummaryStore = {
    data: [{type:"up_time", label: "Healthy", percent:"-%"},{type:"down_time", label: "Violation", percent:"-%"}],
    actions:[{name:"openview", value:0},{name:"Recommended", value:0},{name:"Custome", value:0},{name:"Total", value:0}]
}

let _operationalStatusStore = {
    live_data:[
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Projected Cost Per Month",
            summary: "$ 0.00",
            value: "$ 0.00",
            max: 0
        },
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Total Requests",
            summary: "0.00 / s",
            value: "0.00 / s",
            max: 0
        },
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Max Latency",
            summary: "0.00 ms",
            value: "0.00 ms",
            max: 0
        },
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Application Error Rate",
            summary: "0.00 %",
            value: "0.00 %",
            max: 0
        }
    ],
    historical_data:[
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Projected Cost Per Month",
            summary: "$58.64",
            value: "$200",
            max: 0
        },
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Total Requests",
            summary: "0.00 / s",
            value: "0.00 / s",
            max: 0
        },
        {
            graph:[0],
            status:"violation",
            height: 120,
            title: "Max Latency",
            summary: "221 ms",
            value: "200 ms",
            max: 0
        },
        {
            graph:[0],
            status:"healthy",
            height: 120,
            title: "Application Error Rate",
            summary: "3.00%",
            value: "10.00%",
            max: 0
        }
    ],
    live: true,
    donetime: null
}

let _recommendedActionStore = {
    data: [],
    learnMoreData: {
        suggestion:"",
        percentage:0,
        cost:0,
        data: []
    }
}

let _doneActionArray = [];
// sample data
let _learnMoreData = {

    id1: {
        issues: [
            {
                name: "Memory Bottleneck",
                service: "acmeair",
                pod: "web-rc",
                container: "web",
                list: [
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Bursting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Bursting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"}
                ]
            },
            {
                name: "CPU Idle",
                service: "acmeair",
                pod: "web-rc",
                container: "web",
                list: [
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Plummeting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Decremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Decremental"}
                ]
            }
        ]
    },
    id2: {
        issues: [
            {
                name: "Memory Bottleneck",
                service: "acmeair",
                pod: "web-rc",
                container: "web",
                list: [
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Bursting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Bursting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"}
                ]
            },
            {
                name: "CPU Idle",
                service: "acmeair",
                pod: "web-rc",
                container: "web",
                list: [
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Plummeting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Decremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Decremental"}
                ]
            }
        ]
    },
    id3: {
        issues: [
            {
                name: "Memory Bottleneck",
                service: "acmeair",
                pod: "web-rc",
                container: "web",
                list: [
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Bursting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Bursting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Incremental"}
                ]
            },
            {
                name: "CPU Idle",
                service: "acmeair",
                pod: "web-rc",
                container: "web",
                list: [
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Plummeting"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Decremental"},
                    {title:"mem_pgmajfault_rate_max",summary:"58.65",value:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2],type:"Decremental"}
                ]
            }
        ]
    }
}

let _monitoringStatistics = {
    data:[{icon:'services',cntr:0,name:'Services'},
          {icon:'pods',cntr:0,name:'Pods'},
          {icon:'containers',cntr:0,name:'Containers'}],
    current_monitoring_count: 0,
    bottlenecks_detected: 0,
    editing: false
};

// Define the public event listeners and getters that
// the views will use to listen for changes and retrieve
// the store
class DashboardStoreClass extends EventEmitter {

    addChangeListener(cb) {
        this.on(CHANGE_EVENT, cb);
    }

    removeChangeListener(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    }

    getMonitoringStatisticsInitData () {
        return _monitoringStatistics;
    }

    getMonitoringStatisticsData(cb) {
        let _self  = this;
        let sCount = 0;
        let pCount = 0;
        let cCount = 0;
        let bottlenextCount  = 0;

        $.getJSON("/api/openview/api/v1/apps/" + _self.getAppID(), (app) => {
            _self.appList = [app];

            if (Array.isArray(_self.appList)) {
                _self.appList.some((app) => {
                    if (app.id.toString() == _self.appID) {
                        sCount = app.status.service_count;
                        pCount = app.status.pod_count;
                        cCount = app.status.container_count;
                    }
                    return (app.id.toString() == _self.appID);
                })
            }
            _monitoringStatistics.data[0].cntr = sCount;
            _monitoringStatistics.data[1].cntr = pCount;
            _monitoringStatistics.data[2].cntr = cCount;
            _monitoringStatistics.current_monitoring_count = cCount * 54;
            cb(_monitoringStatistics);
        });
    }

    getDoneActions (dateDiff) {
        let _self = this;
        let baseTime = moment(moment().format().split('T')[0] + 'T00:00:00').utc().subtract(dateDiff, 'days');
        let startTime = baseTime.format();
        let endTime;
        this.queryDateDiff = dateDiff;

        if (dateDiff === 0) {
            endTime   = moment().utc().format();
        } else {
            endTime  = moment(moment().format().split('T')[0] + 'T23:59:59').utc().subtract(dateDiff, 'days').format();
        }

        this.getTotalPoints();

        $.getJSON("/api/openview/api/v1/app/" + this.appID + "/actions" + "?starttime=" + startTime + "&endtime=" + endTime + "&statuses_notin=RECOMMENDED", (data) => {
            let rcmdActionsCount = 0;
            let autoActinosCount = 0;
            let userActionsCount = 0;
            let custActionsCount = 0;

            if (typeof data.actions_summary !== 'undefined') {
                if (typeof data.actions_summary.RECOMMENDED   !== 'undefined') rcmdActionsCount = data.actions_summary.RECOMMENDED;
                if (typeof data.actions_summary.AUTO_APPLIED  !== 'undefined') autoActinosCount = data.actions_summary.AUTO_APPLIED;
                if (typeof data.actions_summary.USER_APPROVED !== 'undefined') userActionsCount = data.actions_summary.USER_APPROVED;
                if (typeof data.actions_summary.CUSTOMIZED    !== 'undefined') custActionsCount = data.actions_summary.CUSTOMIZED;

                let total = autoActinosCount + userActionsCount + custActionsCount;
                _24HrSummaryStore.actions =[ {name:"openview", value:autoActinosCount},
                                             {name:"Recommended", value:userActionsCount},
                                             {name:"Custom", value:custActionsCount},
                                             {name:"Total", value:total} ];

                if (typeof data.actions_detail !== 'undefined' && Array.isArray(data.actions_detail)) {
                    for (let i=0; i<data.actions_detail.length; i++) {
                        if (typeof data.actions_detail[i].finishing_time !== 'undefined') {
                            data.actions_detail[i].scale = Math.ceil((moment(data.actions_detail[i].finishing_time).valueOf() - baseTime.valueOf()) / 120000) * 120000;
                        } else {
                            data.actions_detail[i].scale = -1;
                        }
                    }
                    _doneActionArray = data.actions_detail;
                }
                _self.emit("StatisticsDone");
            }
        })
    }

    checkStatisticsData() {
        let _self = this;
        async function waitForStatisticsData() {
            while (typeof _self.appList === 'undefined') {
                await _self.sleep(500);
            }
            _self.emit("StatisticsDone");
        }
        waitForStatisticsData();
    }

    get24HrSummaryData() {
        return _24HrSummaryStore;
    }

    set24HrSummaryData(upTime, downTime) {
        _24HrSummaryStore.data = [{type:"up_time", label: "Healthy", percent:upTime+"%"},{type:"down_time", label: "Violation", percent:downTime+"%"}];
    }

    getDoneActionsResult () {
        return _doneActionArray;
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    getSLA () {
        return this.sla;
    }

    updateActionCount (count) {
        _monitoringStatistics.bottlenecks_detected = count;
    }

    getTotalPoints() {
        let _self = this;
        let dateDiff = typeof this.queryDateDiff === 'undefined' ? 0 : this.queryDateDiff;
        let from = "%27"+moment(moment().format().split('T')[0] + 'T00:00:00').utc().subtract(dateDiff, 'days').format()+"%27";
        let to = "%27"+moment(moment().format().split('T')[0] + 'T23:59:59').utc().subtract(dateDiff, 'days').format()+"%27";

        let queryTotalPoints = () => {
            $.when(
                $.getJSON("/influxdb/query?q=select+count(latency)+from+SLA_metrics_app"+this.appID+"+where+time+>=+"+from+"+and+time+<=+"+to+"&db=user_"+this.appList[0].user_id),
                typeof _self.sla === 'undefined' ? $.getJSON("/api/openview/api/v1/app/"+this.appID+"/sla") : _self.sla
            ).done((data, sla) => {
                if (typeof _self.sla === 'undefined') {
                    _self.sla = sla;
                }
                if (data &&  data.length>0 && data[0].results && data[0].results.length === 1 && data[0].results[0]['series'] &&
                        data[0].results[0]['series'].length===1 && data[0].results[0]['series'][0]['values'] && Array.isArray(data[0].results[0]['series'][0]['values'])) {
                    _self.getUpDownTime(sla, data[0].results[0].series[0].values[0][1], from, to);
                } else {
                    this.set24HrSummaryData("-", "-");
                    _self.emit("UpdateUpDownTime");
                }
            });
        }

        async function waitForAPPData() {
            while (typeof _self.appList === 'undefined' || typeof _self.appList === 'undefined' || _self.appList === null) {
                await _self.sleep(500);
            }
            queryTotalPoints();
        }
        waitForAPPData();
    }

    getUpDownTime(sla, allPontsRes, from, to) {
        let _self = this;

        $.when(
            $.getJSON("/influxdb/query?q=select+count(latency)+from+SLA_metrics_app"+this.appID+"+where+(latency+>+"+sla[0].latency+"+or+error_rate>+"+sla[0].error_rate+")+and+time+>=+"+from+"+and+time+<="+to+"&db=user_"+this.appList[0].user_id),
            $.getJSON("/influxdb/query?q=select+count(latency)%2F0.24+from+SLA_metrics_app"+this.appID+"+where+time+>=+"+from+"+and+time+<=+"+to+"+and+(+latency+>+"+sla[0].latency+"+or+error_rate+>+"+sla[0].error_rate+"+)+group+by+time(2m)+order+by+time+asc&db=user_"+this.appList[0].user_id)
        ).done((data, reachthreshold) => {
            if (data && data.length>0 && data[0].results && data[0].results.length === 1 && data[0].results[0]['series'] &&
                    data[0].results[0]['series'].length===1 && data[0].results[0]['series'][0]['values'] && Array.isArray(data[0].results[0]['series'][0]['values'])) {
                let ud = data[0].results[0].series[0].values[0][1];
                let r = Math.round(100*(ud/allPontsRes));
                this.set24HrSummaryData(100-r, r);
                _self.emit("UpdateUpDownTime");
            } else if (data && data.length == 3 && data[1] == "success" && data[0].results.length == 1 && data[0].results[0].statement_id == 0) {
                this.set24HrSummaryData(100, 0);
                _self.emit("UpdateUpDownTime");
            } else {
                this.set24HrSummaryData("-", "-");
                _self.emit("UpdateUpDownTime");
            }
            if (reachthreshold &&  reachthreshold.length>0 && reachthreshold[0].results && reachthreshold[0].results.length === 1 && reachthreshold[0].results[0]['series'] && reachthreshold[0].results[0]['series'].length===1 && reachthreshold[0].results[0]['series'][0]['values'] && Array.isArray(reachthreshold[0].results[0]['series'][0]['values'])) {
                this.reachthresholdErr = reachthreshold[0].results[0]['series'][0]['values'];
                _self.emit("reachthresholdDone");
            }
        });
    }

    getHistoricalData () {
        let _self = this;
        var appId = this.appID;
        var userId = -1;
        for (var i = 0; i < this.appList.length; i++){
            if(this.appList[i]['id'] == appId){
                userId = this.appList[i]['user_id'];
            }
        }
        if(userId == -1){
            console.log("no user_id");
        }
        var date = _operationalStatusStore.donetime;
        var fromDate = (new Date( +(new Date(date)) - 15 * 60000)).toISOString();
        var toDate = (new Date( +(new Date(date)) + 15 * 60000)).toISOString();
        HttpUtil.getHistoricalData(appId,userId,fromDate,toDate).then(function (data) {
            _self.updateLiveAndHistoricalData(data, _self.sla[0], 'historical_data');
            _self.emit(CHANGE_EVENT, false);
        })
    }

    updateLiveAndHistoricalData (data, sla, key) {
        let costResults = [];
        let requestResults = [];
        let latencyResults = [];
        let errorRateResults = [];
        let _self = this;
        let timeWindow = 5;
        if(process.env.REQUEST_TIME_WINDOW){
            timeWindow = parseInt(process.env.REQUEST_TIME_WINDOW);
        }

        if (data && data.results && data.results.length === 1 && data.results[0]['series'] &&
            data.results[0]['series'].length===1 && data.results[0]['series'][0]['values'] && Array.isArray(data.results[0]['series'][0]['values']))
        {
            if (key === 'historical_data') {
                _operationalStatusStore[key][0].status = 'healthy';
                _operationalStatusStore[key][1].status = 'healthy';
                _operationalStatusStore[key][2].status = 'healthy';
                _operationalStatusStore[key][3].status = 'healthy';
            }
            let maxRequest = 0;
            let count = 0;
            let endDate = new Date(_operationalStatusStore.donetime);
            _operationalStatusStore[key][0].summary = "CHECKING";
            _operationalStatusStore[key][2].summary = "CHECKING";
            _operationalStatusStore[key][3].summary = "CHECKING";
            _operationalStatusStore[key][0].max = sla.cost*1.8;
            _operationalStatusStore[key][2].max = sla.latency*1.8;
            _operationalStatusStore[key][3].max = sla.error_rate*1.8;
            data.results[0]['series'][0]['values'].forEach((val, idx) => {
                if (idx === data.results[0]['series'][0]['values'].length - 1) {
                    _operationalStatusStore[key][1].summary = (typeof val[2] !== 'undefined' && val[2] !== null ? val[2]/timeWindow : 0).toFixed(0).toString() + " / s";
                    _operationalStatusStore[key][0].value = (sla.currency_type === "dollar" ? "$" : "¥") + (sla.cost).toFixed(2);
                    _operationalStatusStore[key][2].value = (sla.latency).toFixed(2).toString() + " ms";
                    _operationalStatusStore[key][3].value = (sla.error_rate).toFixed(2).toString() + " %";

                    if (key === 'live_data') {
                        _operationalStatusStore[key][0].status = (sla.cost - (sla.currency_type === "dollar" ? (typeof val[1] !== 'undefined' && val[1] !== null ? val[1] : 0) : ((typeof val[1] !== 'undefined' && val[1] !== null ? val[1] : 0) * 6)))  >= 0 ? 'healthy' : 'violation';
                        _operationalStatusStore[key][2].status = (sla.latency - (typeof val[3] !== 'undefined' && val[3] !== null ? val[3] : 0)) >= 0 ? 'healthy' : 'violation';
                        _operationalStatusStore[key][3].status = (sla.error_rate - (typeof val[4] !== 'undefined' && val[4] !== null ? val[4] : 0)) >= 0 ? 'healthy' : 'violation';
                    }
                }
                if (key === 'historical_data') {
                    if (_operationalStatusStore[key][0].status === 'healthy')
                        _operationalStatusStore[key][0].status = (sla.cost - (sla.currency_type === "dollar" ? (typeof val[1] !== 'undefined' && val[1] !== null ? val[1] : 0) : ((typeof val[1] !== 'undefined' && val[1] !== null ? val[1] : 0) * 6)))  >= 0 ? 'healthy' : 'violation';
                    if (_operationalStatusStore[key][2].status === 'healthy')
                        _operationalStatusStore[key][2].status = (sla.latency - (typeof val[3] !== 'undefined' && val[3] !== null ? val[3] : 0)) >= 0 ? 'healthy' : 'violation';
                    if (_operationalStatusStore[key][3].status === 'healthy')
                        _operationalStatusStore[key][3].status = (sla.error_rate - (typeof val[4] !== 'undefined' && val[4] !== null ? val[4] : 0)) >= 0 ? 'healthy' : 'violation';
                }

                let latestCost = (typeof val[1] !== 'undefined' && val[1] !== null ? val[1] : -1).toFixed(2).toString();
                if (latestCost != "-1.00") {
                    _operationalStatusStore[key][0].summary = (sla.currency_type === "dollar" ? "$" + latestCost : "¥" + (6*latestCost).toFixed(2));
                }

                let latestLatency = (typeof val[3] !== 'undefined' && val[3] !== null ? val[3] : -1).toFixed(2).toString();
                if (latestLatency != "-1.00") {
                    _operationalStatusStore[key][2].summary = latestLatency + " ms";
                }
                if (parseFloat(latestLatency) > _operationalStatusStore[key][2].max) {
                    _operationalStatusStore[key][2].max = parseFloat(latestLatency);
                }

                let latestErrorRate = (typeof val[4] !== 'undefined' && val[4] !== null ? val[4] : -1).toFixed(2).toString();
                if (latestErrorRate != "-1.00") {
                    _operationalStatusStore[key][3].summary = latestErrorRate + " %";
                }
                if (parseFloat(latestErrorRate) > _operationalStatusStore[key][3].max) {
                    _operationalStatusStore[key][3].max = parseFloat(latestErrorRate);
                }
                val[2] = val[2] === -1 ? 0 : val[2];
                val[3] = val[3] === -1 ? 0 : val[3];
                val[4] = val[4] === -1 ? 0 : val[4];
                let request = typeof val[2] !== 'undefined' && val[2] !== null ? val[2]/timeWindow : 0;
                costResults.push(typeof val[1] !== 'undefined' && val[1] !== null ? val[1] : 0);
                requestResults.push(request);
                latencyResults.push(typeof val[3] !== 'undefined' && val[3] !== null ? val[3] : 0);
                errorRateResults.push(typeof val[4] !== 'undefined' && !val[4] !== null ? val[4] : 0);
                maxRequest = request > maxRequest ? request : maxRequest;
                let current = new Date(val[0]);
                if(current < endDate){
                    count ++;
                }
            });
            _operationalStatusStore[key][0].graph = costResults;
            _operationalStatusStore[key][1].graph = requestResults;
            _operationalStatusStore[key][2].graph = latencyResults;
            _operationalStatusStore[key][3].graph = errorRateResults;
            if (key === 'live_data') {
                this.maxRequest = typeof this.maxRequest === 'undefined' ? maxRequest : (maxRequest > this.maxRequest ? maxRequest : this.maxRequest);
                _operationalStatusStore[key][1].max = this.maxRequest;
            } else {
                this.maxRequestHist = typeof this.maxRequestHist === 'undefined' ? maxRequest : (maxRequest > this.maxRequestHist ? maxRequest : this.maxRequestHist);
                _operationalStatusStore[key][1].max = this.maxRequestHist;
                _operationalStatusStore[key].forEach(function(item){
                    item['percent'] = Math.floor(count / item.graph.length * 100);
                    item['historical_date'] = _operationalStatusStore.donetime;
                })
            }
            _self.emit(CHANGE_EVENT);
        }
    }

    getOperationalStatusData (query) {
        let _self = this;
        let retryTimeout = null;

        //https://ifdb.openview.us:443/query?q=select+max(error_rate)+as+error_rate%2C+max(latency)+as+latency%2C+max(cost)+as+cost+from+SLA_metrics_app1+where+(time+%3E+now()+-+30m)+AND+(time+%3C+now()+-+20s)+and+error_rate+%3E+-1+group+by+time(30s)+fill(0)+order+by+time+desc+limit+60&db=user_1

        if (query === false || typeof this.appID === 'undefined' || typeof this.appList === 'undefined' || this.appList === null || typeof this.appList[0].user_id === 'undefined') {
            if (typeof query === 'undefined') {
                clearTimeout(retryTimeout);
                retryTimeout = setTimeout(() => {
                    _self.getOperationalStatusData();
                }, 100);
            }
        } else {
            let queryStr = encodeURI("/influxdb/query?q=select+max(cost)+as+cost,+max(total_request)+as+total_request,+max(latency)+as+latency,+max(error_rate)+as+error_rate+from+SLA_metrics_app"+ this.appID+"+where+(time+>+now()+-+30m)+AND+(time+<+now()+-+20s)+group+by+time(30s)+fill(-1)+order+by+time+asc+limit+60&db=user_"+this.appList[0].user_id);
            $.when(
                $.getJSON(queryStr),
                typeof _self.sla === 'undefined' ? $.getJSON("/api/openview/api/v1/app/"+this.appID+"/sla") : _self.getSLA()
            ).done((data, sla) => {
                if (typeof _self.sla === 'undefined') {
                    _self.sla = sla;
                }
                data = data[0];
                sla  = sla[0];
                _self.updateLiveAndHistoricalData(data, sla, 'live_data');
            });
        }
    }

    getOperationalStatusStore () {
        return _operationalStatusStore;
    }

    getRecommendedActionsData() {
        // {id:'id1',suggestion:"Scale web-server from 1 to 3 instances",percentage:72,cost:30.12,issues: 2},
        // {id:'id2',suggestion:"Increase web-server memory from 512 to 1024 MB",percentage:67,cost:16.38,issues: 2},
        // {id:'id3',suggestion:"Increase web-server CPU from 1.5 to 2.5 cores",percentage:51,cost:44.71,issues: 2},
        // {id:'id3',suggestion:"Increase web-server CPU from 1.5 to 2.5 cores",percentage:72,cost:30.12,issues: 2},
        // {id:'id3',suggestion:"Increase web-server CPU from 1.5 to 2.5 cores",percentage:72,cost:30.12,issues: 2}
        return _recommendedActionStore;
    }

    getLearnMoreLiveData() {
        return _recommendedActionStore.learnMoreData;
    }


    setAppList (data) {
        this.appList = data;
    }

    getAppList () {
        return this.appList;
    }

    setAppID (id) {
        if (typeof this.appID !== 'undefined' && this.appID != id) {
            this.initiateData();
        }
        this.appID = id;
    }

    getAppID () {
        return this.appID;
    }

    setConfigs (data) {
        this.configs = data;
    }

    getConfigs () {
        return this.configs;
    }

    setModifiedActionOBj (Obj) {
        this.modifyActionObj = Obj;
    }

    getModifiedActionObj () {
        return this.modifyActionObj;
    }

    getReachthresholdErr () {
        return this.reachthresholdErr;
    }

    initiateData () {
        _operationalStatusStore.live = true;
        for (let i=0; i<4; i++) {
            _operationalStatusStore.live_data[i].graph = [0];
            _operationalStatusStore.live_data[i].status = 'healthy';
            _operationalStatusStore.live_data[i].summary = "0.00";
            _operationalStatusStore.live_data[i].value = "0.00";
            _operationalStatusStore.live_data[i].max = 0;
        }
        this.set24HrSummaryData("-", "-");
        this.appList = null;
    }
}

// Initialize the singleton to register with the
// dispatcher and export for React components
const DashboardStore = new DashboardStoreClass();

// Register each of the actions with the dispatcher
// by changing the store's data and emitting a
// change
DashboardDispatcher.register((payload) => {
    const action = payload.action;

    switch(action.actionType) {
        case DashboardConstants.GET_LEARN_MORE_LIVE:
            _recommendedActionStore.learnMoreData.data = action.data;
            DashboardStore.emit(SHOW_LEARN_MORE,true);
        break;
        case DashboardConstants.GET_LEARN_MORE_HISTORICAL:
            _recommendedActionStore.learnMoreData.data = action.data.data;
            _recommendedActionStore.learnMoreData.date = action.data.date;
            DashboardStore.emit(SHOW_LEARN_MORE,false);
        break;
        case DashboardConstants.SET_DATA_LIVE:
            _operationalStatusStore.live = action.type.status;
            _operationalStatusStore.donetime = action.type.donetime;
            DashboardStore.getHistoricalData();
            //DashboardStore.emit(CHANGE_EVENT,false);
        break;
        default:
            return true;
    }

})

export default DashboardStore;
