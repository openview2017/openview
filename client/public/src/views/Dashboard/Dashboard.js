import React from 'react'
import {Link} from 'react-router'
import {LeftSideBar} from './Util'
import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines'
import DashboardStore from '../../stores/DashboardStore'
import moment from 'moment'
import { getLearnMoreLive, getLearnMoreHistorical, setDataLive } from '../../actions/DashboardActions'
import Http from '../../utils/http'
import tool from '../../utils/tool'
import update from 'immutability-helper';
import Select, { Option } from 'rc-select';

export class ApplicationMode extends React.Component {
    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this.state = {
            selection: "openview",
            rangeValue: 90
        }
        this.handleChange = this.onChange.bind(this);
        this.showRangeValue = this.showRangeValue.bind(this);
        this.updateTimeout;
    }
    componentWillMount () {
        $.getJSON("/api/openview/api/v1/apps/" + DashboardStore.getAppID() + "/applicationmode", (data) => {
            if (typeof data === 'object' && typeof data.automation_level === 'number' && data.automation_level >= 10 && data.automation_level <= 90) {
                this.setState({selection: "openview", rangeValue: data.automation_level});
            } else {
                this.setState({selection: "advisory", rangeValue: 10});
            }
        });
    }
    updateMode (m, v) {
        let id    = DashboardStore.getAppID();
        let mode  = m === 'advisory' ? 'advisory' : 'openview';
        let range = mode === 'advisory' ? 100 : v;
        let content = {automation_level: range};
        $.ajax({ url: "/api/openview/api/v1/apps/" + DashboardStore.getAppID() + "/applicationmode",
                 method: 'PUT',
                 contentType: "application/json",
                 data: JSON.stringify(content),
                 dataType: "json",
                 complete: function(e, xhr, settings) {
                     if (e.status === 200){
                         console.log("update application mode success.");
                     } else {
                         console.log("update application mode failed: (" + e.status + ")");
                     }
                 }
        });
    }
    /**
    * onChange
    */
    onChange(ev) {
        this.setState({selection: ev.target.value});
        let mode = ev.target.value;
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            this.updateMode(mode, this.state.rangeValue);
        }, 500);
    }
    /**
    * showRangeValue
    * display max range value of the slider
    */
    showRangeValue(ev) {
        ev.stopPropagation();
        this.setState({rangeValue: ev.target.value});
        let value = ev.target.value;
        let el = $(".range_slider input[type=range]");
        el.removeClass();
        let newClass = "fifty";
        switch (ev.target.value) {
            case "60":
                newClass = "sixty";
                break;
            case "70":
                newClass = "seventy";
                break;
            case "80":
                newClass = "eighty";
                break;
            case "90":
                newClass = "ninety";
                break;
        }
        el.addClass(newClass);
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            this.updateMode(this.state.selection, value);
        }, 500);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let newClass = "ten";
        switch ((this.state.rangeValue).toString()) {
            case "20":
                newClass = "twenty";
                break;
            case "30":
                newClass = "thirty";
                break;
            case "40":
                newClass = "forty";
                break;
            case "50":
                newClass = "fifty";
                break;
            case "60":
                newClass = "sixty";
                break;
            case "70":
                newClass = "seventy";
                break;
            case "80":
            case "75":
                newClass = "eighty";
                break;
            case "90":
                newClass = "ninety";
                break;
        }
        return (
            <div>
                <h3>Application Mode</h3>
                <div className="content">
                    <div className="options">
                        <input id="advisory" checked={this.state.selection === "advisory"} onChange={this.handleChange} type="radio" name="option" value="advisory"/>
                        <label htmlFor="advisory">Advisory</label>
                        <div className="note">
                            All actions require user approval to execute
                        </div>
                    </div>
                    <div className="options">
                        <input id="openview" checked={this.state.selection === "openview"} onChange={this.handleChange} type="radio" name="option" value="openview"/>
                        <label htmlFor="openview">openview</label>
                        <div className="note">
                            Automatically execute actions above <span className="max_cntr">{this.state.rangeValue}%</span> confidence score
                        </div>
                        <div className="range_slider">
                            <input className={newClass} type="range" min="10" max="90" value={this.state.rangeValue} step="10" onChange={this.showRangeValue}/>
                            <div><span className="min_cntr">10%</span><span className="max_cntr">90%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class MonitoringStatistics extends React.Component {

    constructor(props) {
        super(props);
        DashboardStore.checkStatisticsData();
        this.updateState = this.updateState.bind(this);
        this.state = DashboardStore.getMonitoringStatisticsInitData();
    }

    componentDidMount () {
    	var _self = this;
        DashboardStore.on("StatisticsDone", this.updateState);
    }

    updateState () {
        let callback = this.setState.bind(this);
        DashboardStore.getMonitoringStatisticsData(callback);
    }

    componentWillUnmount () {
        DashboardStore.removeListener("StatisticsDone", this.updateState);
        // DashboardStore.removeListener("updateRecommendedActionCount", this.updateState);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        return (
            <div>
                <h3>Monitoring Statistics</h3>
                <div className="content">
                    <ul>
                        <li>
                            {
                                this.state.data.map((item,index) => {
                                    let display = (index <  (this.state.data.length-1)) ? "block" : "none";
                                    return (
                                        <div key={index}>
                                            <div className="monitoring_btn">
                                                <div className={"btn "+item.icon}>
                                                    <span className="cntr">{item.cntr}</span>
                                                    <span className="name">{item.name}</span>
                                                </div>
                                            </div>
                                            <div className="spacer" style={{display:display}}></div>
                                        </div>
                                    )
                                })
                            }
                        </li>
                        <li style={{position:"relative",marginTop:"30px"}}>
                            <div style={{borderBottom:"2px solid #767677",width: "22px",position: "absolute",left: "0px"}}></div>
                            <div className="spacer" style={{height:"125px"}}></div>
                            <div style={{borderBottom:"2px solid #767677",width: "22px",position: "absolute",left: "-20px"}}></div>
                        </li>
                        <li style={{margin:0}}>
                            <div className="current_monitoring">
                                <span>Currently Monitoring</span>
                                <span>{this.state.current_monitoring_count}</span>
                                <span>Metrics</span>
                            </div>
                            <div className="spacer" style={{marginTop:"30px"}}></div>
                            <div className="monitoring_btn" style={{padding:"15px 0"}}>
                                <span style={{fontSize:"14px"}}>{this.state.bottlenecks_detected} Recommended Actions</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

export class Summary24HR extends React.Component {

    constructor(props) {
        super(props);
        this.state = DashboardStore.get24HrSummaryData();
        this.updateState = this.updateState.bind(this);
    }

    componentDidMount () {
        DashboardStore.on("StatisticsDone", this.updateState);
        DashboardStore.on("UpdateUpDownTime", this.updateState);
    }

    updateState () {
        this.setState(DashboardStore.get24HrSummaryData());
    }

    componentWillUnmount () {
        DashboardStore.removeListener("StatisticsDone", this.updateState);
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        return (
            <div>
                <h3>Daily Summary</h3>
                <div className="content">
                    <ul>
                        <li>
                            <div className="summary_holder">
                                {
                                    this.state.data.map((item,index) => {
                                        return (
                                            <div key={index} className={"inner-holder "+ item.type}>
                                                <span>{item.label}</span>
                                                <span>{item.percent}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </li>
                        <li>
                            <div className="summary_holder">
                                <div className="action_summary">
                                    <h4>Performed Actions</h4>
                                    {
                                        this.state.actions.map((item, index) => {
                                            return (
                                                <div key={index}>
                                                    <span>{item.name}:</span>
                                                    <span>{item.value}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

export class OperationalStatusGraph extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let showThreshold = () => {
            let pos = 130 * (1 - (this.props.data.value.split(" ")[0] / this.props.data.max));
            pos = isNaN(pos) ? 57.7778 : pos;
            if (this.props.pos != 1) {
                return (
                    <div className={"reference_line "+this.props.data.status} style={{top:pos + "px"}}>
                        <span className="arrow_box">{this.props.data.value}</span>
                    </div>
                )
            }
        }
        let cursor = "";
        if(this.props.data.historical_date ){

            var dateArray = moment(new Date(this.props.data.historical_date)).format("MM/DD/YYYY HH:mm:ss").split(" ");

            var dateStr = dateArray[0];
            var timeStr = dateArray[1];
            var style = {
                left : this.props.data.percent + "%"
            }
            cursor = (
                <div>
                    <div className="cursor" style={style}></div>
                    <div className="cursor-date">
                        <span >{dateStr}</span>
                        <span>{timeStr}</span>
                    </div>
                </div>
            );


        }
        return (
            <li>
                <div className="box">
                    <h5>{this.props.data.title}</h5>
                    <div className="data_summary">{this.props.summary}</div>
                    { showThreshold.call(this) }
                    <div className={"data_graph "+this.props.data.status} style={{bottom:this.props.bottomPos}}>
                        <Sparklines data={this.props.data.graph} height={this.props.data.height} min={0} margin={0} max={this.props.data.max} >
                        <SparklinesLine style={{ stroke: "#59CED7", fill: "#475961", fillOpacity: "1" }} />
                        {/*<SparklinesReferenceLine type="custom" value={parseFloat(this.props.data.value.split(" ")[0])} />*/}
                        </Sparklines>
                        {cursor}
                    </div>

                    <div className="overlay"></div>
                </div>
            </li>
        )
    }
}

export class OperationalStatus extends React.Component {

    constructor(props) {
        super(props);
        this.state = DashboardStore.getOperationalStatusStore();
        this._onChange = this._onChange.bind(this);
        this.drawDoneActions = this.drawDoneActions.bind(this);
        this.drawReachThreshold = this.drawReachThreshold.bind(this);
        this._showLiveData = this._showLiveData.bind(this);
        this.timelineDateDiff = 0;
        this.dailySummaryInterval = null;
        this.dailyTimelineInterval = null;
        this._handleClick = this._handleClick.bind(this);
        this.state.selectedDate = "Today";
    }

    /**
    * _onChange
    * get store data upon store change
    */
    _onChange(query) {
        let result = DashboardStore.getOperationalStatusStore();
        let selectedDate = this.state.selectedDate;
        this.setState(result);
        this.setState({selectedDate: selectedDate});
        $("#estimated_cost_this_month").text(result['live_data'][0].summary);
        $("#estimated_cost_this_month_threshold").text(result['live_data'][0].value);
    }

    _setDailySummaryView(elArrow) {

        let that = this;
        let content = [], contentArrow = [];
        let totalPoints = 144*5; // total points to plot
        let minPerPoint = 600000/5 //ms -> 2 mins
        let midnightTime = moment(moment().format().split('T')[0] + 'T00:00:00').utc().subtract(this.timelineDateDiff, 'days').valueOf(); // midnight time in ms
        let nowTime = new Date().getTime(); // current time in ms

        let el = document.querySelector(".daily_summary_holder");

        // set width
        $(".daily_summary_holder").outerWidth(868);
         // get container width
        //let width = $(".daily_summary_holder").outerWidth();

        // get width per point
        let pointWidth = (868/totalPoints);

        let pointTime = midnightTime;

        // plot per 10 points
        for(let i = 0; i < totalPoints; i++) {
            if(pointTime <= nowTime) {
                contentArrow.push(`<span id="a_`+pointTime+`" data-date="`+moment(pointTime).format('YYYY-MM-DD HH:mm:ss')+`" data-vtime="`+(pointTime+120000/5)+`" class="passed" style="width:`+pointWidth+`px;"></span>`);
                let point = $("#"+pointTime);
                let newClass = point.length == 1 && point.attr('class') && point.attr('class') != "" ? point.attr('class') : "passed";
                let timeline = `<span id="`+pointTime+`" data-date="`+moment(pointTime).format('YYYY-MM-DD HH:mm:ss')+`" class="`+ newClass +`" style="width:`+pointWidth+`px;">` +
                               ((nowTime-pointTime)/minPerPoint <= 15 ? '<div></div>' : '')
                               +`</span>`;
                content.push(timeline);
            } else {
                contentArrow.push(`<span id="a_`+pointTime+`" data-date="`+moment(pointTime).format('YYYY-MM-DD HH:mm:ss')+`" style="width:`+pointWidth+`px;"></span>`);
                content.push(`<span id="`+pointTime+`" data-date="`+moment(pointTime).format('YYYY-MM-DD HH:mm:ss')+`" style="width:`+pointWidth+`px"></span>`);
            }

            pointTime += minPerPoint;
        }

        elArrow.innerHTML = contentArrow.join("");
        el.innerHTML = content.join("");

    }

    _showLearnMoreHistoricalModal(data, date) {
        getLearnMoreHistorical({data:data,date:date});
    }

    _addToolTip(time, msg) {
        msg = msg || "";
        let toolTipCotent = `<span class="tooltiptext">
            <span style="display:block">`+msg+`</span>
            <span style="display:block;width:100%;margin-top:10px">
                <small style="float:left">`+ time +`</small>
                <a href="javascript:void(0);" class="learn_more_historical" style="float:right">Learn More</a>
            </span>
        </span>`;



        return toolTipCotent;
    }

    _removeToolTip() {
        this._removeBorderInBuckets();
        let elementsArrow = document.querySelectorAll(".daily_summary_performed_action_arrow .warning");
        for (let i = 0; i < elementsArrow.length; i++) {
            elementsArrow[i].innerHTML = "";
        }
    }

    _addBorderToBuckets(id) {
        id = id.split("_");
        let el = document.getElementById(id[1]);
        for (let i=-7; i<=7; i++) {
            let timeline = $("#" + (parseInt(id[1])+120000*i));
            let highlightBottom = $("<div></div>");
            // switch (i) {
            //     case -7:
            //         timeline.addClass('first_bucket');
            //         break;
            //     case 7:
            //         timeline.addClass('last_bucket');
            //         break;
            //     default:
            //         timeline.addClass('center_bucket');
            // }
            timeline.html('').append(highlightBottom);
        }
    }

    _removeBorderInBuckets (){
        let elements = document.querySelectorAll(".daily_summary_holder span");
        for (let i = 0; i < elements.length; i++) {
            // elements[i].classList.remove("first_bucket");
            // elements[i].classList.remove("center_bucket");
            // elements[i].classList.remove("last_bucket");
            elements[i].innerHTML = '';
        }
    }

    _showHistoricalData(id,line,finishedTime) {
        setDataLive({status:false, donetime:finishedTime});
    }

    _showLiveData() {
        if(!this.state.live){
            setDataLive({status:true, donetime:null});
            this._removeToolTip();
        }
    }



    _addPerformedActionButtonClickListener() {
        let that = this;

        // add click listener for the arrow down to show tooltip
        let elementsArrow = $(".daily_summary_performed_action_arrow .warning").click(function() {
            // remove exixting tooltip if shown
            that._removeToolTip();

            // add white border to 30 min buckets
            that._addBorderToBuckets(this.id);

            // add tooltip
            this.innerHTML = that._addToolTip(moment(JSON.parse(this.getAttribute('data-action')).finishing_time).local().format('HH:mm'),
                                    JSON.parse(this.getAttribute('data-action')).suggestion);

            // add click listener to learn more
            let learnMoreToolTip = document.querySelector(".learn_more_historical");
            learnMoreToolTip.addEventListener("click", () => {
                let action = JSON.parse(this.getAttribute('data-action'));
                that._showLearnMoreHistoricalModal(action, action.finishing_time);
            });

            // show historical graph data
            that._showHistoricalData(this.id,this.getAttribute('data-vtime'),JSON.parse(this.getAttribute('data-action')).finishing_time);
        })
    }

    changeTimelineDate (date) {
        let value = date === "Today" ? 0 : moment().diff(moment(new Date(moment(date, "MM/DD/YYYY"))), 'days');
        this.timelineDateDiff = value;
        this.setState({selectedDate: date});
        DashboardStore.getDoneActions(this.timelineDateDiff);
        if (this.timelineDateDiff === "0") {
            this._showLiveData();
        }
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let buttonType = (this.state.live) ? "disabled" : "";

        let graph_data;
        if(this.state.live) {
            graph_data = this.state.live_data;
        } else {
            graph_data = this.state.historical_data;
        }

        let optionDates = [];
        for (let i=1; i<7; i++) {
            optionDates.push(moment().subtract(i, 'days').format('MM/DD/YYYY'));
        }

        return (
            <div className="operational_status">
                <div className="header">

                    <ul>
                        <li><h4>Operational Status</h4></li>
                        <li style={{border:"1px solid #4f5157", borderRadius:"2px", padding:"5px", position:"relative", top:"-5px",float:"right"}}>
                            <span style={{fontSize:"12px"}}>Estimated Monthly Cost:</span>
                            <span id="estimated_cost_this_month" style={{fontSize:"14px",color:"white", fontWeight:"bold", paddingLeft:"5px"}}>$0.00</span>
                            <span style={{fontSize:"12px", paddingLeft:"5px"}}>(Maximum:</span>
                            <span id="estimated_cost_this_month_threshold" style={{fontSize:"12px", paddingLeft:"5px"}}>$0.00</span>
                            <span style={{fontSize:"12px"}}>)</span>
                        </li>
                    </ul>
                    <div className="clearfix"></div>
                </div>
                <div className="content">
                    <div className="graphs">
                        <ul>
                            {
                                graph_data.map((item,index) => {
                                    let bottomPos = index == 1 ? '8px' : '10px';
                                    return (
                                        index != "0" ?
                                        <OperationalStatusGraph key={index} data={item} pos={index} bottomPos={bottomPos}
                                            status={item.status} height={item.height} title={item.title} summary={item.summary} value={item.value} max={item.max} /> : null
                                    )
                                })
                            }
                        </ul>
                        <div className="clearfix"></div>
                    </div>
                    <div className="daily_summary">
                        <div className="tip_title">
                            <h4 className="title">Daily Timeline</h4>
                            <ul className="menu">
                                <li>
                                    <span className="healthy stats"></span>
                                    <span className="text">Healthy</span>
                                </li>
                                <li>
                                    <span className="lightviolation stats"></span>
                                    <span className="text">Light</span>
                                </li>
                                <li>
                                    <span className="minorviolation stats"></span>
                                    <span className="text">Medium</span>
                                </li>
                                <li>
                                    <span className="violation stats"></span>
                                    <span className="text">Heavy</span>
                                </li>
                                <li>
                                    <span className="arrow_down"></span>
                                    <span className="text">Performed Action</span>
                                </li>
                            </ul>
                        </div>
                        <Select
                            value={this.state.selectedDate}
                            style={{ fontSize:"12px", width:"100px", backgroundColor:"#3a3d47", color:"#cbcbce", position:"absolute", right:0, top:0 }}
                            animation="slide-up"
                            showSearch={false}
                            onChange={this.changeTimelineDate.bind(this)}
                        >
                            <Option value="Today">Today</Option>
                            {
                                optionDates.map((item, idx) => {
                                    return (
                                        <Option key={idx} value={item}>{item}</Option>
                                    )
                                })
                            }
                        </Select>
                        <div>
                            <div className="daily_summary_performed_action_arrow"></div>
                            <div className="daily_summary_holder"></div>
                            <div className="legend">
                                <span>12AM</span>
                                <span className="mid">12PM</span>
                                <span className="last">12AM</span>
                                <div className="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    drawReachThreshold () {
        let result = DashboardStore.getReachthresholdErr();
        // --- inject sample data ---
        let midnightTime = moment(moment().format().split('T')[0] + 'T00:00:00').utc().subtract(this.timelineDateDiff, 'days').valueOf(); // midnight time in ms
        for (let i=0; i<result.length; i++) {
            let sampleArrow = moment(result[i][0]).valueOf();
            let el = document.getElementById(sampleArrow);
            if (el !== null) {
                if (result[i][1] >= 1 && result[i][1] < 5) {
                    if (el.className.indexOf("light")==-1) el.className += " light";
                }
                if (result[i][1] >= 5 && result[i][1] < 20) {
                    if (el.className.indexOf("warning")==-1) el.className += " warning";
                }
                if (result[i][1] > 20) {
                    if (el.className.indexOf("serious")==-1) el.className += " serious";
                }
            }
        }
    }

    drawDoneActions () {
        this._setDailySummaryView(document.querySelector(".daily_summary_performed_action_arrow"));
        let elAs = DashboardStore.getDoneActionsResult();

        // --- inject sample data ---
        let midnightTime = moment(moment().format().split('T')[0] + 'T00:00:00').utc().subtract(this.timelineDateDiff, 'days').valueOf(); // midnight time in ms

        for (let i=0; i<elAs.length; i++) {
            if (elAs[i].scale !== -1) {
                let sampleArrow = midnightTime + elAs[i].scale;
                let elA = document.getElementById('a_'+ sampleArrow);
                if (elA !== null) {
                    elA.className += " warning";
                    elA.setAttribute('data-action', JSON.stringify(elAs[i]));
                    let el = $("#"+sampleArrow);
                    let elOffset = el.offset();
                    $("#a_"+sampleArrow).offset({top:elOffset.top-8,left:elOffset.left-3}).css("z-index",9999+i);
                    if (el.attr("class") == "") {
                        el.addClass("passed light");
                    }
                }
            }
        }
        this._addPerformedActionButtonClickListener();
    }

    setDailyDataInterval() {
        let _self = this;
        if (_self.dailySummaryInterval === null) {
            DashboardStore.getDoneActions(_self.timelineDateDiff);
            _self.dailySummaryInterval = setInterval(() => {
                if (_self.timelineDateDiff == 0) {
                    DashboardStore.getDoneActions(_self.timelineDateDiff);
                }
            }, 60000);
        }
        if (_self.dailyTimelineInterval === null) {
            DashboardStore.getOperationalStatusData();
            _self.dailyTimelineInterval = setInterval(() => {
                DashboardStore.getOperationalStatusData();
            }, 10000);
        }
    }

    _handleClick(e){
        var tooltip = e.target.closest(".tooltiptext");
        var arrow = e.target.closest(".daily_summary_performed_action_arrow");
        if( !tooltip && !arrow ){
          this._showLiveData();
        }
    }

    componenetDidUpdate () {
        this.setDailyDataInterval();
    }

    componentDidMount() {
        this.setDailyDataInterval();
        DashboardStore.addChangeListener(this._onChange);
        DashboardStore.on("StatisticsDone", this.drawDoneActions);
        window.document.addEventListener('click',this._handleClick,false);
        DashboardStore.on("reachthresholdDone", this.drawReachThreshold);
    }



    /**
    * componentWillUnmount
    * remove store change listener
    */
    componentWillUnmount() {
        clearInterval(this.dailySummaryInterval);
        this.dailySummaryInterval = null;
        clearInterval(this.dailyTimelineInterval);
        this.dailyTimelineInterval = null;
        DashboardStore.removeChangeListener(this._onChange);
        DashboardStore.removeListener("StatisticsDone", this.drawDoneActions);
        window.document.removeEventListener('click',this._handleClick);
        DashboardStore.removeListener("reachthresholdDone", this.drawReachThreshold);
    }

}

export class RecommendedActions extends React.Component {

    constructor(props) {
        super(props);

        this.state = DashboardStore.getRecommendedActionsData();

        this._showModifyActionModal = this._showModifyActionModal.bind(this);

        // this._actionLoaded = this._actionLoaded.bind(this);
        // this._actionFailed = this._actionFailed.bind(this);
        // this._actionUnableToExecute = this._actionUnableToExecute.bind(this);
        // this._actionCompleted = this._actionCompleted.bind(this);
        // this._scheduleAction = this._scheduleAction.bind(this);
        this._filterActions = this._filterActions.bind(this);
        this._sortActions = this._sortActions.bind(this);
        this._getPriority = this._getPriority.bind(this);
        this._checkActionsStatus = this._checkActionsStatus.bind(this);
        this._getActionLBtn = this._getActionLBtn.bind(this);
        this._getActionRBtn = this._getActionRBtn.bind(this);
        this.timeInterval = null;

        this.dismissedMap = {};
        this.applyedArray = [];
        this.applying = false;

    }

    _filterActions(actions){
        let _this = this;
        let existMap = {};
        return actions.reverse().filter(function(item){
            if( _this.dismissedMap[item['id']] || existMap[item['id']]){
                return false;
            }
            existMap[item['id']] = 1;
            return true;
        }).reverse();
    }

    _sortActions(actions){
        let _this = this;
        actions.sort(function(a,b){
            return _this._getPriority(a['status']) - _this._getPriority(b['status']);
        });
    }

    _getPriority(status){
        switch (status){
            case 'RECOMMENDED':
                return 1;
                break;
            case 'APPLYING':
            case 'ROLLINGBACK':
                return 2;
                break;
            case 'TIMEOUT':
            case 'APPLIED':
            case 'ROLLEDBACK':
            case 'K8SCOMMUNICATIONERROR':
            case 'ROLLBACKFAILED':
                return 3;
                break;

            default:
                console.log("error status");
                break;
        }
    }

    _checkActionsStatus(actions){

        for (var i = 0; i < actions.length; i++){
            var item = actions[i];
            if(item['status'] == 'APPLYING'){
                this.applying = true;
                break;
            }
        }
    }


    _dismissAction(item){

        this.dismissedMap[item.id] = 1;
        var idx = this.applyedArray.indexOf(item.id);

        while (idx != -1){
            this.applyedArray.splice(idx,1);
            idx = this.applyedArray.indexOf(item.id);
        }
        idx = this.state.data.indexOf(item);
        if(idx != -1){
            var newData = update(this.state.data, {
                $splice: [[idx, 1]]
            });
            this.setState({data:newData});
        }


    }

    _getActionLBtn(item){
        let _this = this;

        if(this.applying){
            return (
                <div className="buttons">
                    <a href="javascript:;" className="btn-default" onClick={_this._showLearnMoreModal.bind(_this,item)}>Learn More</a>
                </div>
            );
        }

        switch (item.status){
            case 'RECOMMENDED':
            case 'TIMEOUT':
                return (
                    <div className="buttons">
                        <a href="javascript:;" className="btn-default" onClick={_this._showLearnMoreModal.bind(_this,item)}>Learn More</a>
                        <a href="javascript:;" className="btn-default" onClick={_this._showModifyActionModal.bind(_this,item)}>Modify Action</a>
                    </div>

                );

                break;
            case 'APPLYING':
            case 'ROLLINGBACK':
            case 'APPLIED':
            case 'ROLLEDBACK':
            case 'K8SCOMMUNICATIONERROR':
            case 'ROLLBACKFAILED':
            case "NOTACCEPTABLE":
                return (
                    <div className="buttons">
                        <a href="javascript:;" className="btn-default" onClick={_this._showLearnMoreModal.bind(_this,item)}>Learn More</a>
                    </div>
                );
                break;
            default:
                console.log("error status");
                break;
        }


    }
    _getActionRBtn(item){
        let _this = this;



        switch (item.status){
            case 'RECOMMENDED':

                if(_this.applying){
                    return ("");
                }
                return (
                    <div className="buttons">
                        <a href="javascript:;" className="btn-default action-recommended" onClick={_this._processAction.bind(_this,item)}>Apply</a>
                    </div>
                );

                break;
            case 'APPLYING':
                return (
                    <div className="buttons">
                        <span className="action-tip">Applying action...</span>
                        <a  className="btn-default action-applying" ><img  src="/themes/openview/images/action/applying.gif" />
                        </a>
                    </div>
                );
                break;
            case 'APPLIED':
                return (
                    <div className="buttons">
                        <span className="action-tip">Action completed</span>
                        <a href="javascript:;" className="btn-default action-applied" onClick={_this._dismissAction.bind(_this,item)} > <span >Dismiss</span>
                        </a>
                    </div>
                );

                break;
            case 'ROLLINGBACK':
                return (
                    <div className="buttons">
                        <span className="action-tip">Rolling back action...</span>
                        <a href="javascript:;" className="btn-default action-rolling-back" > <img  src="/themes/openview/images/action/rollback.gif" />
                        </a>
                    </div>
                );

            case 'TIMEOUT':
                if(_this.applying){
                    return (
                        <div className="buttons">
                            <span href="javascript:;" className="btn-default error">ERROR</span>
                            <span className="action-tip">Action timed out. Please retry.</span>
                        </div>
                    );
                }
                return (
                    <div className="buttons">
                        <span href="javascript:;" className="btn-default error">ERROR</span>
                        <span className="action-tip">Action timed out. Please retry.</span>
                        <a href="javascript:;" className="btn-default action-timeout" > <span>Retry</span>
                        </a>
                    </div>
                );
                break;

            case 'ROLLEDBACK':
                return (
                    <div className="buttons">
                        <span className="action-tip">Action rollback completed.</span>
                        <a href="javascript:;" className="btn-default action-rolled-back" onClick={_this._dismissAction.bind(_this,item)}  > <span>Dismiss</span>
                        </a>
                    </div>
                );
                break;
            case 'K8SCOMMUNICATIONERROR':
                return (
                    <div className="buttons">
                        <span href="javascript:;" className="btn-default error">ERROR</span>
                        <span className="action-tip">Action failed.Communication Error.</span>
                        <a href="javascript:;" className="btn-default action-error" onClick={_this._dismissAction.bind(_this,item)} > <span>Dismiss</span>
                        </a>
                    </div>
                );
                break;
            case 'ROLLBACKFAILED':
                return (
                    <div className="buttons">
                        <span href="javascript:;" className="btn-default error">ERROR</span>
                        <span className="action-tip">Action rollback failed.</span>
                        <a href="javascript:;" className="btn-default action-roll-failed" onClick={_this._dismissAction.bind(_this,item)}  > <span>Dismiss</span>
                        </a>
                    </div>
                );
                break;
            case "NOTACCEPTABLE":
                return (
                    <div className="buttons">
                        <span href="javascript:;" className="btn-default error">ERROR</span>
                        <span className="action-tip">This operation is not acceptable .</span>
                        <a href="javascript:;" className="btn-default action-not-acceptable" onClick={_this._dismissAction.bind(_this,item)}  > <span>Dismiss</span>
                        </a>
                    </div>
                );
                break;
                break;
            default:
                console.log("error status");
                break;
        }
    }



    _showModifyActionModal(item, ev) {
        DashboardStore.setModifiedActionOBj({data:item,appliedCallback:this._appliedCallback.bind(this,item)});
        document.getElementById("modify-action-modal").style.display = "block";
    }

    _showLearnMoreModal(data, ev) {
        ev.preventDefault();
        getLearnMoreLive(data);
    }

    _appliedCallback(item){
        var idx = this.applyedArray.indexOf(item);
        if(idx == -1){
            this.applyedArray.push(item.id);
            this.queryRecommendedAction();
        }
    }
    // _actionLoaded(ev) {
    //     if(!ev.target.classList.contains("action_loaded")&&ev.target.nodeName=="A") {
    //         ev.target.className += " action_loaded";
    //         ev.target.innerHTML = "<span class='action_loader'></span>";
    //
    //         var parentEl = ev.target.parentNode;
    //         var div = document.createElement("div");
    //         div.className = "action_message";
    //         div.innerHTML = "<span>Please wait while this action is applied...</span>";
    //
    //         parentEl.insertBefore(div, parentEl.firstChild);
    //     }
    // }
    //
    // _actionFailed(ev) {
    //     if(!ev.target.classList.contains("action_failed")&&ev.target.nodeName=="A") {
    //         ev.target.className += " action_failed";
    //         ev.target.innerHTML = "Retry <span class='action_retry'></span>";
    //
    //         var parentEl = ev.target.parentNode;
    //         var div = document.createElement("div");
    //         div.className = "action_message";
    //         div.innerHTML = "<span class='failed'>ERROR</span> <span>Action Failed. Enter description here.</span>";
    //
    //         parentEl.insertBefore(div, parentEl.firstChild);
    //     }
    // }

    // _actionUnableToExecute(ev) {
    //     if(!ev.target.classList.contains("action_failed")&&ev.target.nodeName=="A") {
    //         ev.target.className += " action_unable_excute";
    //         ev.target.innerHTML = "Dismiss <span class='action_checked'></span>";
    //
    //         var parentEl = ev.target.parentNode;
    //         var div = document.createElement("div");
    //         div.className = "action_message";
    //         div.innerHTML = "<span class='failed'>ERROR</span> <span>Unable to excute action. All changes reverted.</span>";
    //
    //         parentEl.insertBefore(div, parentEl.firstChild);
    //     }
    // }

    // _actionCompleted(ev) {
    //     if(!ev.target.classList.contains("action_completed")&&ev.target.nodeName=="A") {
    //         ev.target.className += " action_completed";
    //         ev.target.innerHTML = "Dismiss <span class='action_checked'></span>";
    //
    //         var parentEl = ev.target.parentNode;
    //         var div = document.createElement("div");
    //         div.className = "action_message";
    //         div.innerHTML = "<span class='completed'>Action Completed.</span>";
    //
    //         parentEl.insertBefore(div, parentEl.firstChild);
    //     }
    // }

    // _scheduleAction(ev) {
    //     if(!ev.target.classList.contains("action_schedule")&&ev.target.nodeName=="A") {
    //
    //         ev.target.className += " action_schedule";
    //
    //         var totalPoints = 144;
    //         var minPerPoint = 1800000 //in ms -> 30 minutes
    //         var midnightTime = new Date().setHours(0,0,0,0);
    //         var nowTime = new Date().getTime();
    //         var scheduleTimeView = [];
    //
    //         scheduleTimeView.push(`<span>Schedule time to apply action:</span>`);
    //         scheduleTimeView.push(`<select className="select-tab">`);
    //
    //         var pointTime = midnightTime;
    //         for(var i = 0; i < totalPoints; i++) {
    //
    //             if(pointTime >= nowTime) {
    //                 scheduleTimeView.push(`<option value="`+moment(pointTime).format('HH:mm')+`">`+moment(pointTime).format('HH:mm')+`</option>`);
    //             }
    //             pointTime += minPerPoint;
    //         }
    //         scheduleTimeView.push(`</select>`);
    //
    //         //var el = document.querySelector("#action1 .box_content_right .buttons");
    //         var parentEl = ev.target.parentNode;
    //         var scheduleTime = document.createElement("div");
    //         scheduleTime.className = "action_message schedule_action";
    //         scheduleTime.innerHTML = scheduleTimeView.join("");
    //
    //         parentEl.insertBefore(scheduleTime, parentEl.firstChild);
    //     }
    // }

    _processAction(item, ev) {

        let _this = this;
        item['status'] = 'APPLYING';
        this.applying = true;
        this.applyedArray.push(item.id);
        this.setState({data:this.state.data});

        Http.applyAction(item['app_id'],item['id']).then(function(){
            _this.queryRecommendedAction();
        },function (res) {
            _this.queryRecommendedAction();
        });

        // $.ajax({ url: "/api/openview/api/v1/apps/" + DashboardStore.getAppID() + "/actions/" + actionid + "/apply",
        //          method: 'POST',
        //          contentType: "application/json",
        //          statusCode: { 200: _self._actionCompleted(ev) },
        //          complete: function(e, xhr) {
        //              if (e.status !== 200) {
        //                  _self._actionFailed(ev);
        //              }
        //         }
        // });
        // TODO: server process
        // sample: showing event buttons
        // if(action == 0) {
        //     this._actionLoaded(ev);
        // } else if(action == 1) {
        //     this._actionFailed(ev);
        // } else if(action == 2) {
        //     this._actionUnableToExecute(ev);
        // } else if(action == 3) {
        //     this._actionCompleted(ev);
        // } else if(action == 4) {
        //     this._scheduleAction(ev);
        // }
    }

    queryRecommendedAction () {
        let sampleAction = {
          "id": 3612,
          "created": "2017-05-04T00:27:02Z",
          "action_name": "scale",
          "action_change_amount": "+1",
          "app_id": 1,
          "type": "AUTO_APPLIED",
          "status": "TIMEOUT",
          "issues": 0,
          "expiration_time": "2017-05-04T00:28:40Z",
          "finishing_time": "2017-05-04T00:29:02Z",
          "cost": 12.87713,
          "percentage": 53.6781,
          "suggestion": "Increase mysql (StatefulSet) scale by 1",
          "set_config_before_action": {
            "id": 1,
            "kind": "StatefulSet",
            "name": "mysql",
            "replicas": 3,
            "podConfig": {
              "containersConfig": {
                "mysql": {
                  "cpu_quota": 1000000,
                  "mem_limit": 1073741824
                }
              }
            }
          },
          "set_config_after_action": {
            "id": 1,
            "kind": "StatefulSet",
            "name": "mysql",
            "replicas": 4,
            "podConfig": {
              "containersConfig": {
                "mysql": {
                  "cpu_quota": 1000000,
                  "mem_limit": 1073741824
                }
              }
            }
          },
          "root_causes": [
            {
              "podConfig": {
                "containersConfig": {
                  "mysql": {}
                }
              },
              "root_causes": [
                {
                  "metric_id": "156",
                  "name": "mysql",
                  "anomaly_type": "incremental",
                  "podConfig": {
                    "containersConfig": {
                      "mysql": {}
                    }
                  },
                  "kind": "StatefulSet",
                  "confidence_score": 2.0711804797592923,
                  "metric": "cpu_usage_total_rate_max"
                }
              ],
              "kind": "StatefulSet",
              "bottleneck": "cpu_bottleneck",
              "confidence_score": 0.7723004793711382,
              "name": "mysql"
            },
            {
              "podConfig": {
                "containersConfig": {
                  "mysql": {}
                }
              },
              "root_causes": [
                {
                  "metric_id": "202",
                  "name": "mysql",
                  "anomaly_type": "incremental",
                  "podConfig": {
                    "containersConfig": {
                      "mysql": {}
                    }
                  },
                  "kind": "StatefulSet",
                  "confidence_score": 0.7478632143622457,
                  "metric": "blkio_io_service_bytes_recursive_total_rate_max"
                },
                {
                  "metric_id": "204",
                  "name": "mysql",
                  "anomaly_type": "incremental",
                  "podConfig": {
                    "containersConfig": {
                      "mysql": {}
                    }
                  },
                  "kind": "StatefulSet",
                  "confidence_score": 0.3143804545440146,
                  "metric": "mem_rss_mean"
                }
              ],
              "kind": "StatefulSet",
              "bottleneck": "mem_bottleneck",
              "confidence_score": 0.20088481689650436,
              "name": "mysql"
            }
          ]
        };
        let _self = this;
        var appId = DashboardStore.getAppID();
        Http.getActions(appId,this.applyedArray).then(function(array){
            let newData = [];
            DashboardStore.updateActionCount(array[0]['actions_detail'].length);
            DashboardStore.emit("StatisticsDone");
            for(var i = array.length -1 ; i >= 0; i--){
                var data = array[i]['actions_detail'];
                data.forEach(function(suggestion){
                    suggestion.cost = parseFloat(suggestion.cost).toFixed(2);
                    suggestion.percentage = parseInt(Math.round(suggestion.percentage));
                    newData.push(suggestion);
                })
            }
            newData = _self._filterActions(newData);
            _self.applying = false;
            _self._checkActionsStatus(newData);
            _self.setState({data: newData});
        });
        // $.getJSON("/api/openview/api/v1/apps/" + DashboardStore.getAppID() + "/actions", (data) => {
        //     let newData = [];
        //     data = Array.isArray(data.actions_detail) ? data.actions_detail : [];
        //     data.forEach((suggestion) => {
        //         //if (moment(suggestion.expiration_time).isAfter(moment().utc())) {
        //             suggestion.cost = parseFloat(suggestion.cost).toFixed(2);
        //             suggestion.percentage = parseInt(Math.round(suggestion.percentage));
        //             newData.push(suggestion);
        //         //}
        //     });
        //
        //     //#TODO:test
        //     newData[0].status = "RECOMMENDED";
        //     newData[1].status = "APPLYING";
        //     newData[2].status = "ROLLINGBACK";
        //     newData[3].status = "TIMEOUT";
        //     newData[4].status = "APPLIED";
        //     newData[5].status = "ROLLEDBACK";
        //     newData[6].status = "K8SCOMMUNICATIONERROR";
        //     newData[7].status = "ROLLBACKFAILED";
        //     newData = _self._filterActions(newData);
        //     // _self._sortActions(newData);
        //     _self._checkActionsStatus(newData);
        //     _self.setState({data: newData});
        // }).fail(function() {
        //     _self.setState({data: []});
        // });
    }

    setActionsInterval () {
        let _self = this;
        let getRecommendedActions = () => {
            _self.queryRecommendedAction();
            if (window.location.href.indexOf('/dashboard?') === -1) {
                clearInterval(this.timeInterval);
                this.timeInterval = null;
            }
        }

        if (this.timeInterval === null && window.location.href.indexOf('/dashboard?') !== -1) {
            this.timeInterval = setInterval(function() {
                getRecommendedActions();
            }, 10000);
        }
    }

    componentWillMount () {
        this.queryRecommendedAction();
    }

    componentWillUnmount () {
        clearInterval(this.timeInterval);
        this.timeInterval = null;
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        if (this.timeInterval === null) this.setActionsInterval();
        let _this = this;

        return (
            <div className="recommended_actions">
                <div className="header">
                    <h4>Current Recommended Actions (Select One)</h4>
                    <div className="clearfix"></div>
                </div>
                <div className="content">
                   <ul>
                        {
                            this.state.data.map((item, index) => {

                                let leftBtn = _this._getActionLBtn(item);
                                let rightBtn = _this._getActionRBtn(item);

                                return (
                                    <li key={index}>
                                       <div id={"action"+index} className="box">
                                            <div className="box_content_left">
                                                <h4>{item.suggestion}</h4>
                                                <p>We are <span>{item.percentage}%</span> confident this will fix the issue.</p>

                                                    {leftBtn}
                                            </div>
                                            <div className="box_content_right">
                                                    <div className="estimated_cost_diff">
                                                        <span>Estimated</span>
                                                        <span>Cost Differential</span>
                                                    </div>
                                                    <div className="cost">
                                                        <span className="price_tag_icon"></span>
                                                        <span className={item.cost > 0 ? "arrow_up" : "arrow_down"}></span>
                                                        <span>${Math.abs(item.cost)} / mo</span>
                                                    </div>
                                                {rightBtn}
                                            </div>
                                       </div>
                                   </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export class ModifyActionModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {options1: [], actionTypes: ["scale"], values: [0], properties: [], msg: "", costDiff: 0, selectedTarget:""};
        this.scale = {};
        this.cost  = {};
        this.setconfigs = {};
        this.containers = {};
        this.property = {name:"", scale:"", cpu:"", memory:""};
        this._closeModal = this._closeModal.bind(this);
        this._saveChanges = this._saveChanges.bind(this);
    }
    changeValue (id, val) {
        let updateMsg = (isContainer, target, type, value) => {
            if (isContainer) {
                let newValue = value.replace("+","").replace("-","");
                let action = $(".modified-action-selected-value").text().indexOf("+") !== -1 ? "Increase " : "Decrease ";
                let oriValue = type === 'CPU' ? this.property.cpu : this.property.memory;
                let costDiff  = ( type === 'CPU' ? parseFloat(this.property.cpu.split(" ")[0]) * 0.36 : parseFloat(this.property.memory.split(" ")[0] / 1024) * 8.64 ) * parseInt(value) / 100;
                this.setState({msg: action + this.property.name + " " + type + " " + newValue + " from " + oriValue});
                this.setState({costDiff: costDiff.toFixed(2)});
            } else {
                this.setState({msg: "Scale " + this.property.name + " from " + this.property.scale + " to " + (parseInt(this.property.scale) + parseInt(value))});
                this.setState({costDiff: (this.cost[target] * parseInt(value)).toFixed(2)});
            }
        }

        switch (id) {
            case 'target':
                let properties = [];
                this.setState({selectedTarget: val});
                if (val.indexOf('...container / ') !== -1) {
                    this.setState({actionTypes: ['cpu', 'memory']});
                    this.setState({values: ['-60%', '-40%', '-20%', '+20%', '+40%', '+60%']});
                    this.setState({selectedType: 'cpu'});
                    this.setState({selectedValue: '-60%'});
                    this.property = {name: val.replace("...container / ",""), cpu:(this.scale[val].cpu_quota / 1000000).toString() + " cores", memory:(this.scale[val].mem_limit / 1024 / 1024).toString() + " MB"};
                    properties.push(<span>Memory: <small>{this.property.memory}</small></span>);
                    properties.push(<span>CPU: <small>{this.property.cpu}</small></span>);
                    updateMsg(true, val, 'CPU', '-60%');
                } else {
                    this.setState({actionTypes: ['scale']});
                    let newValues = this.getValuesArray(this.scale[val]);
                    this.setState({values: newValues});
                    this.setState({selectedType: 'scale'});
                    this.setState({selectedValue: newValues[0]});
                    this.property = {name: val.split("/")[1], scale:(this.scale[val]).toString()};
                    properties.push(<span>Scale: <small>{this.property.scale}</small></span>);
                    updateMsg(false, val, null, newValues[0]);
                }
                this.setState({properties: properties});
                break;
            case 'type':
                let isContainer = $(".modified-action-selected-target").text().indexOf('...container / ') !== -1;
                this.setState({selectedType: val});
                this.setState({selectedValue: isContainer ? '-60%' : this.state.value[0]});
                let newType = val.indexOf('cpu') !== -1 ? 'CPU' : 'Memory';
                updateMsg(isContainer, null, newType, isContainer ? '-60%' : this.state.values[0]);
                break;
            case 'value':
                this.setState({selectedValue: val});
                let type = $(".modified-action-selected-type").text().indexOf('cpu') !== -1 ? 'CPU' : 'Memory';
                let target = $(".modified-action-selected-target").text();
                updateMsg($(".modified-action-selected-target").text().indexOf('...container / ') !== -1, target, type, val);
                break;
            default:
                break;
        }
    }

    getValuesArray (scale) {
        let newValues = [];
        let min = scale == 1 ? 2 : 1;
        let max = scale == 1 ? 5 : (scale-min + 1)*2;
        for (let i=0; i<max; i++) {
            if ((min + i) - scale !== 0) newValues.push(((min + i) - scale > 0 ? "+" : "") + ((min + i) - scale).toString());
        }
        return newValues;
    }

    _closeModal() {
        this.refs.modifyAction.style.display = "none";
    }

    _saveChanges() {
        let target = $(".modified-action-selected-target").text();
        let type   = $(".modified-action-selected-type").text();
        let value  = $(".modified-action-selected-value").text();
        let obj = DashboardStore.getModifiedActionObj();
        let mid    =  obj['data']['id'];
        let callback = obj['appliedCallback'];
        let updateConfig = {};

        if (target.indexOf('...container /') !== -1) {
            var newObject = jQuery.extend(true, {}, this.setconfigs[target]);
            newObject.podConfig.containersConfig = {};
            newObject.podConfig.containersConfig[target.replace("...container / ","")] = this.scale[target];
            updateConfig = {action_name: type==='cpu' ? 'cpu_quota' : 'mem_limit',
                            action_change_amount: value,
                            set_config_before_action: newObject
                           }
        } else {
            updateConfig = {action_name: "scale",
                            action_change_amount: value,
                            set_config_before_action: this.setconfigs[target]
                           }
        }

        let _self = this;
        $.ajax({ url: "/api/openview/api/v1/apps/" + DashboardStore.getAppID() + "/actions/" + mid,
                 method: 'PATCH',
                 data: JSON.stringify(updateConfig),
                 dataType: "json",
                 contentType: "application/json",
                 statusCode: { 200: console.log("success modified") },
                 complete: function(e, xhr) {
                     if (e.status !== 200) {
                         console.log("error code:" + e.status);
                     }else{
                         callback();
                     }
                }
        });
        this.refs.modifyAction.style.display = "none";
    }

    componentWillReceiveProps(nextProps) {
        let configs = nextProps.configs;
        let options1 = [];
        let newValues = [];
        if (Array.isArray(configs)) {
            configs.forEach((config) => {
                if (config.kind === 'StatefulSet' || config.kind === 'Deployment' || config.kind === 'ReplicationController' || config.kind === 'ReplicationControllers') {
                    options1.push(config.kind + " / " + config.name);
                    let keys = Object.keys(config.podConfig.containersConfig);
                    let cpuSum = 0;
                    let memSum = 0;
                    keys.forEach((key) => {
                        if (config.kind === 'Deployment') {
                            options1.push('...container / ' + key);
                            this.scale['...container / ' + key] = config.podConfig.containersConfig[key];
                            this.setconfigs['...container / ' + key] = config;
                        }
                        cpuSum += config.podConfig.containersConfig[key].cpu_quota / 1000000;
                        memSum += config.podConfig.containersConfig[key].mem_limit / 1024 / 1024 / 1024;
                    });
                    this.cost[config.kind + " / " + config.name] = 8.64 * memSum + 0.36 * cpuSum;

                    if (options1.length === 1) {
                        newValues = this.getValuesArray(config.replicas);
                        let properties = [];
                        properties.push(<span>Scale: <small>{config.replicas}</small></span>);
                        this.setState({properties: properties});
                        this.setState({selectedValue: newValues[0]});
                        this.property.scale = config.replicas;
                        this.property.name = config.name;
                        this.setState({msg: "Scale " + config.name + " from " + config.replicas + " to " + (parseInt(config.replicas) + parseInt(newValues[0]))});
                        this.setState({costDiff: (this.cost[config.kind + " / " + config.name] * parseInt(config.replicas)).toFixed(2)});
                    }
                    this.scale[config.kind + " / " + config.name] = config.replicas;
                    this.setconfigs[config.kind + " / " + config.name] = config;
                }
            });
        }
        this.setState({options1: options1});
        this.setState({selectedTarget: options1[0]});
        this.setState({selectedType: this.state.actionTypes[0]});
        this.setState({values: newValues});
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div id="modify-action-modal" ref="modifyAction" className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <span className="close" onClick={this._closeModal}>×</span>
                        <strong style={{fontSize:"14px",fontWeight:"normal"}}>Define Custom Action</strong>
                    </div>
                    <div className="modal-body">
                        <div className="modify-action">
                            <div className="actions">
                                <ul>
                                    <li style={{width:"65%"}}>
                                        <div className="action">
                                            <span>1. Target</span>
                                            <Select
                                                className="modified-action-selected-target"
                                                value={ this.state.selectedTarget }
                                                style={{ fontSize:"12px", width:"239px", backgroundColor:"#414550", color:"#cbcbce", marginRight:"5px" }}
                                                animation="slide-up"
                                                showSearch={false}
                                                onChange={this.changeValue.bind(this, 'target')}
                                                optionLabelProp="text"
                                            >
                                            {this.state.options1.map(function(cfg, idx) {
                                                return (<Option key={idx} text={cfg} value={cfg}>{cfg}</Option>)
                                            })}
                                            </Select>
                                        </div>
                                        <div className="action">
                                            <span>2. Action Type</span>
                                            <Select
                                                className="modified-action-selected-type"
                                                value={ this.state.selectedType }
                                                style={{ fontSize:"12px", width:"239px", backgroundColor:"#414550", color:"#cbcbce", marginRight:"5px" }}
                                                animation="slide-up"
                                                showSearch={false}
                                                onChange={this.changeValue.bind(this, 'type')}
                                                optionLabelProp="text"
                                            >
                                            {this.state.actionTypes.map(function(actionType, idx) {
                                                return (<Option key={idx} text={actionType} value={actionType}>{actionType}</Option>)
                                            })}
                                            </Select>
                                        </div>
                                        <div className="action">
                                            <span>3. Change Value</span>
                                            <Select
                                                className="modified-action-selected-value"
                                                value={ this.state.selectedValue }
                                                style={{ fontSize:"12px", width:"239px", backgroundColor:"#414550", color:"#cbcbce", marginRight:"5px" }}
                                                animation="slide-up"
                                                showSearch={false}
                                                onChange={this.changeValue.bind(this, 'value')}
                                                optionLabelProp="text"
                                            >
                                            {this.state.values.map(function(value, idx) {
                                                return (<Option key={idx} text={value} value={value}>{value}</Option>)
                                            })}
                                            </Select>
                                        </div>
                                    </li>
                                    <li style={{width:"35%"}}>
                                        <div className="properties">
                                            <div></div>
                                            <div>
                                                <h5>Properties</h5>
                                                <span>Name: <small>{this.property.name}</small></span>
                                                { this.state.properties }
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <div className="clearfix"></div>
                            </div>
                            <div className="description">
                                <span>Action Description</span>
                                <span>{this.state.msg}</span>
                            </div>
                            <div className="estimated_cost">
                                <span>Estimated Cost Differential</span>
                                <div className="cost">
                                    <span className="price_tag_icon"></span>
                                    <span className={this.state.costDiff >= 0 ? "arrow_up" : "arrow_down"}></span>
                                    <span>$ {this.state.costDiff} / mo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a href="javascript:void(0)" className="confirm btn-default" onClick={this._saveChanges} style={{float:"right",border:"1px solid #32c668",marginRight:'15px'}}>Apply</a> &nbsp;
                        <a href="javascript:void(0)" className="cancel btn-default" onClick={this._closeModal}>Cancel</a>
                    </div>
                </div>
            </div>
        )
    }
}

export class LearnMoreGraph extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */


    scale(array){
        let min = Infinity;
        array.forEach(function (item) {
            if(item != null){
                min = min > item ? item : min;
            }
        })

       return array.map(function (item) {
           if(item == null){
               return min;
           }
           return item - min;
       })
    }



    render() {
        var summary = this.props.summary;

        summary =  tool.addUnit(summary,this.props.title);

        let cursor = "";
        if(this.props.historicalDate != null){

            var dateArray = moment(new Date(this.props.historicalDate)).format("MM/DD/YYYY HH:mm:ss").split(" ");

            var dateStr = dateArray[0];
            var timeStr = dateArray[1];
            cursor = (
                <div>
                    <div className="cursor" ></div>
                    <div className="cursor-date">
                        <span >{dateStr}</span>
                        <span>{timeStr}</span>
                    </div>
                </div>
            );

        }
        let titleArr = this.props.title.split("_");
        let title = titleArr.join(" ");
        let scaledData = this.scale(this.props.data);

        return (
            <div className="box_conteiner">
                <div className="box">
                    <div className="data_graph">
                        <Sparklines data={scaledData} height={123} min={0.5} margin={0}>
                            <SparklinesLine style={{ stroke: "#59CED7", fill: "#475961", fillOpacity: "1" }} />
                        </Sparklines>
                        {cursor}
                    </div>
                    <h5 className="data_title">{title}</h5>
                    <div className="data_summary">{summary}</div>

                </div>
                <div className="box_type">
                    <span>Anomoly Type: </span>
                    <span>{this.props.anomolyType}</span>
                </div>
            </div>
        )
    }
}

export class LearnMoreLiveModal extends React.Component {


    constructor(props) {
        super(props);
        this.element = null;
        this._closeModal = this._closeModal.bind(this);
        this._showLearnMore = this._showLearnMore.bind(this);
        this._updateValues = this._updateValues.bind(this);
        this.state = {};
        this.live =false;
        this.actionId = null;
        this.bottleneckMap = {
            mem_bottleneck:"Memory Bottleneck",
            cpu_bottleneck:"CPU Bottleneck",
            mem_idle:"Memory Idle",
            cpu_idle:"CPU Idle"
        }
    }

    _showLearnMore(live) {
        this.live = live;
        this.element.style.display = "block";
        this._dataFormat(DashboardStore.getLearnMoreLiveData());
    }

    _closeModal() {
        this.element.style.display = "none";
        this.actionId = null;
        this.setState({values:{},issues:[]});
    }


    _dataFormat(rawData){
        var data = rawData.data;
        var _this = this;
        var result = {
            'issues':[],
            'values':{}
        };
        var appList = DashboardStore.getAppList();
        var appId = data['app_id'];
        var userId = -1;
        for (var i = 0; i < appList.length ; i++){

            if(appList[i]['id'] == appId){
                userId = appList[i]['user_id'];
                break;
            }
        }
        if(userId == -1){
            console.log("user ID not exist");
            return;
        }

        this.actionId = data.id;
        result['suggestion'] = data['suggestion'];
        result['cost'] =  parseFloat(data['cost']).toFixed(2);
        result['percentage'] =  Math.ceil(parseFloat(data['percentage']));
        if(!data['root_causes'] || data['root_causes'].length == 0){
            return result;
        }
        var ids = [];
        if(typeof data['root_causes'][0]['root_causes'] !== 'undefined'){
            data['root_causes'].forEach(function(item){
                var resItem = {};
                resItem['service'] = item['kind'];
                resItem['pod'] = item['name'];
                resItem['container'] = Object.keys(item['podConfig']['containersConfig'])[0];
                resItem['name'] = _this.bottleneckMap[item['bottleneck']];
                resItem['list'] = [];
                item['root_causes'].forEach(function(plotItem){
                    var tmpItem = {};
                    tmpItem['title'] = plotItem['metric'];
                    tmpItem['type'] = tool.capitalizeFirstLetter(plotItem['anomaly_type']);
                    tmpItem['metric_id'] = plotItem['metric_id'];
                    ids.push(plotItem['metric_id']);
                    resItem['list'].push(tmpItem);
                })
                result.issues.push(resItem);
            });
        }else{
            var causes = data['root_causes'];
            causes.sort(function(a,b){
                return a['confidence_score'] - b['confidence_score'];
            })
            var caseMap = {};
            causes.forEach(function(item){
                var key = item['kind'] + "("+item['name']+")" + Object.keys(item['podConfig']['containersConfig'])[0];
                if(!caseMap[key]){
                    var resItem = {};
                    resItem['service'] = item['kind'];
                    resItem['pod'] = item['name'];
                    resItem['container'] = Object.keys(item['podConfig']['containersConfig'])[0];
                    resItem['name'] = "Anomaly Features";
                    resItem['list'] = [];
                    caseMap[key] = resItem['list'];
                    result['issues'].push(resItem);
                }
                var tmpItem = {};
                tmpItem['title'] = item['metric'];
                tmpItem['type'] = tool.capitalizeFirstLetter(item['anomaly_type']);
                tmpItem['metric_id'] = item['metric_id'];
                ids.push(item['metric_id']);
                caseMap[key].push(tmpItem);
            })
        }

        if(this.live){
            _this._updateValues(data['app_id'],ids,userId,data.id);
        }else{

            var date = rawData.date;
            this.historivalDate = date;
            result['date'] = (new Date(date)).toUTCString();
            var starDate = (new Date(new Date(date) - 15 * 60000)).toISOString();
            var endDate = (new Date(+(new Date(date)) + 15 * 60000)).toISOString();
            _this._updateValues(data['app_id'],ids,userId,data.id,starDate,endDate);
        }

        _this.setState(result);
    }

    _updateValues(appId,ids,userId,actionId,startDate,endDate){
        var _this = this;
        Http.getABTData(appId,ids,userId,startDate,endDate).then(function(resData){
            var dbData = resData['results'][0]['series']['0'];
            var columns = dbData['columns'];
            var values = dbData['values'];
            var matrix = [];
            for (var key in columns){
                matrix.push([]);
            }
            values.forEach(function (item) {
                item.forEach(function(value,i){
                    // if(value === null && matrix[i].length == 0){
                    //     return;
                    // }
                    matrix[i].push(value);
                })
            })
            var valueMap = {};
            for (var i in columns){
                valueMap[columns[i]] = matrix[i].reverse();
            }
            if(_this.actionId == actionId){
                _this.setState({values:valueMap});
                if(_this.live){
                    setTimeout(function(){
                        _this._updateValues(appId,ids,userId,actionId);
                    },10000);
                }
            }
        });
    }

    setElement (element) {
        if (element !== null) this.element = element;
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let _this = this;
        let issues = [];
        if(this.state.issues) {
            issues = this.state.issues;
        }
        let issueNum = 0;
        issues.forEach(function (item) {
            issueNum += item['list'].length;
        })

        let dateTitle = ( <strong className="code-mode" style={{fontSize:"12px",fontWeight:"normal", color:'#CCCCCC'}}>LIVE</strong>);
        if(!this.live){

            let targetDate = new Date(this.state.date);
            let timeStr = moment(targetDate).format('ddd Do MM YYYY, HH:mm:ss zz') + targetDate.toString().split(" ")[6];
            targetDate.to
            dateTitle = (<strong className="code-mode" style={{fontSize:"12px",fontWeight:"normal", color:'#CCCCCC'}}>
                {timeStr}
                         </strong>);
        }

        let priceClass = "arrow_down";
        if(this.state.cost > 0){
            priceClass = "arrow_up";
        }

        let historicalDate = null;
        if(this.live == false){
            historicalDate = this.historivalDate;
        }

        return (
            <div id="learn-more-action-modal" ref={this.setElement.bind(this)} className="modal">
                <div className="modal-content large">
                    <div className="modal-header" style={{textAlign: "center"}}>
                        <span className="close" onClick={this._closeModal}>×</span>
                        {dateTitle}
                        <strong className="title" style={{float:"left",fontSize:"12px",fontWeight:"normal", color: "#FFFFFF"}}>Action - Learn More</strong>
                    </div>
                    <div className="modal-body">
                        <div className="learn-more-live">
                            <div className="header">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="action_description">Action Description</th>
                                            <th className="estimated_cost">Estimated Cost Differential</th>
                                            <th className="score">Confidence Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="action_description">{this.state.suggestion}</td>
                                            <td className="estimated_cost">
                                                <div className="cost"><span className="price_tag_icon"></span><span className={priceClass}></span><span>${Math.abs(this.state.cost)} / mo</span></div>
                                            </td>
                                            <td className="score">{this.state.percentage}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="contributing_issues">
                                <span>Contributing Issues: </span>
                                <span>{issueNum}</span>
                            </div>
                            {
                                issues.map((item,index) => {
                                    return (
                                        <div key={index} className="container">
                                            <div className="container_header">
                                                <span>{index + 1}. {item.name}</span>
                                                <div>
                                                    <span>{item.service}</span> (
                                                    <span>{item.pod}</span> )
                                                    <span className="arrow_right"></span>
                                                    <span>{item.container}</span>
                                                </div>
                                            </div>
                                            <div className="container_content">
                                                <ul>
                                                    {
                                                        item.list.map((obj,i) => {
                                                            if(_this.state['values'][obj['metric_id']]){
                                                                var data = _this.state['values'][obj['metric_id']];
                                                                let nearestValidValueId = data.length - 1;
                                                                while (isNaN(data[nearestValidValueId]) && nearestValidValueId >= 0) {
                                                                    nearestValidValueId --;
                                                                }
                                                                let nearestValidValueValue = nearestValidValueId === -1 ? '-' : data[nearestValidValueValue];
                                                                return (
                                                                    <li key={i}>
                                                                        <LearnMoreGraph
                                                                            title={obj.title}
                                                                            summary={ nearestValidValueValue }
                                                                            data={data}
                                                                            anomolyType={obj.type}
                                                                            historicalDate={historicalDate}
                                                                        />
                                                                    </li>
                                                                )
                                                            }else{
                                                                return ("");
                                                            }

                                                        })
                                                    }
                                                </ul>
                                                <div className="clearfix"></div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /**
    * componentDidMount
    * add store change listener
    */
    componentDidMount() {
        DashboardStore.on("show_learn_more",this._showLearnMore);
    }

    /**
    * componentWillUnmount
    * remove store change listener
    */
    componentWillUnmount() {
        DashboardStore.removeListener("show_learn_more",this._showLearnMore);
    }
}



/**
* DashboardContent
*/
export class DashboardContent extends React.Component {
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div id="content" className="metric_dashboard">
                <div className="metric">
                    <ul>
                        <li className="application_mode">
                            <ApplicationMode />
                        </li>
                        <li className="monitoring_statistics">
                            <MonitoringStatistics />
                        </li>
                        <li className="summary24hr">
                            <Summary24HR />
                        </li>
                    </ul>
                    <div className="clearfix"></div>
                </div>
                <OperationalStatus />
                <RecommendedActions />
            </div>
        )
    }
}

/**
* Dashboard
*/
export default class Dashboard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {configs: []};
    }
    componentDidMount () {
        $.getJSON("/api/openview/api/v1/apps/" + DashboardStore.getAppID() + "/current-setconfigs", (data) => {
            DashboardStore.setConfigs(data);
            this.setState({configs: data});
        });
    }
	/**
    * render
    * @return {ReactElement} markup
    */
	render() {
    	return (
    		<div>
        		<LeftSideBar pageName='dashboard'/>
                <DashboardContent />
                <ModifyActionModal configs={this.state.configs} />
                <LearnMoreLiveModal />
     		</div>
    	)
  	}
}
