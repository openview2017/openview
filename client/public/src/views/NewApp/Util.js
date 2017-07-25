import React from 'react'
import { Link,withRouter } from 'react-router'
import { Content} from '../../components/Layouts'
import AccordionLinks, { AccLink, Slide, APPList, SLAList, DPList } from '../../components/AccordionLinks'
import { SideBar, SideBarTopSection, SideBarNavSection } from '../../components/Layouts'
import Slider from 'react-slick'
import axios from 'axios'
import update from 'immutability-helper'
import ApplicationService from './ApplicationService'
import OperationalRequirements from './OperationalRequirements'
import DemandProfile from './DemandProfile'
import DeploymentPlans from './DeploymentPlans'
import DeploymentConfigurations from './DeploymentConfigurations'
import { ModalPopup } from '../../components/Popup.js'
import NewAppStore from '../../stores/NewAppStore'
import dispatcher from '../../libs/dispatcher'
import * as NewAppActions from '../../actions/NewAppActions'
import EditCodeModal from '../CodeEditor/CodeEditor'
import './newapp.css'
import HttpUtil from '../../utils/http'

/**
* ButtonArea
**/
export class ButtonArea extends React.Component {
    constructor (props) {
        super(props);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        var titleIcon = "title " + (typeof this.props.icon ==="string" ? (" " + this.props.icon) : "") + " icon" ;
        var titleClass = this.props.titleClass ? this.props.titleClass : "";
        var buttonPosition = 'right';

        var buttonItems = '',headerTextItems, cntr=0;

        if(typeof this.props.headerText != "undefined" && typeof this.props.headerText === "object"){
            headerTextItems = this.props.headerText.map(function (button, i) {
                cntr++;
                  return (<span key={i} className={button.className}>{button.content}</span>);
            });
        }

        if(typeof this.props.additionalButtons != "undefined" && typeof this.props.additionalButtons === "object"){
            buttonPosition = this.props.additionalButtons[0].position === 'left' ? 'left' : buttonPosition;
            buttonItems = this.props.additionalButtons.map(function (button, i) {
                var id = (typeof button.id != "undefined") ? button.id : "";
                  return (<Link to={button.to} key={i+cntr} id={id} className={button.className}>{button.title}</Link>);
            });
        }

        return (
            <div className="top-panel alter newapp-slide-title">
                <div className="btn-area">
                    <strong className={titleIcon}><span className={titleClass}>{this.props.title}</span></strong>
                    <div className="additional-btns">
                        <div className="header-text">
                            {headerTextItems}
                            <div className={"pull-" + buttonPosition}>
                                {buttonItems}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class LoadingScreenModal extends React.Component {

    closeModal() {
        this.refs.loadingModal.style.display = "none";
    }

    render() {
        return (
            <div id="loading-screen-modal" ref="loadingModal" className="modal">
                <div className="modal-content">
                    <div className="modal-body">
                        <span className="close" style={{float:"right",position:"relative",top:"-14px", right:"-5px"}} onClick={this.closeModal.bind(this)}>脳</span>
                        <div style={{margin:"20px 0", textAlign: "center", fontSize: "12px", color: "#FFFFFF"}}>Validating File...</div>
                        <div className="h-loader">
                            <img src="themes/openview/images/hpreloader.gif"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class AsideNote extends React.Component {

    closeAside() {
        if(document.body.classList.contains('nav-active')) {
            document.querySelector('body').classList.remove('nav-active');
        }
    }

    render() {
        return (
            <aside id="newapp_aside" className="aside">
                  <span className="nav-close" onClick={this.closeAside.bind(this)}></span>
                  <div id="newapp_aside_content">
                      <span className="aside-head normal">Node name</span>
                      <div className="aside-block">
                          Node content
                      </div>
                  </div>
            </aside>
        )
    }
}


/**
* HintField
**/
export class HintField extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div className="hint-field">
                <strong className="hint-title">{this.props.title}</strong>
                <p>{this.props.message}</p>
            </div>
        )
    }
}

/**
* PrevButton
**/
class PrevButton extends React.Component {
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return <button {...this.props}>Back</button>
    }
}

let validateData = (step, topologyView) => {
    switch (step) {
        case 0:
            return (topologyView && topologyView.entryPoint && Object.keys(topologyView.entryPoint).length > 0 &&
                    topologyView.entryPoint.allowedSetEntryPoint && topologyView.entryPoint.allowedSetEntryPoint === true);
            break;
        case 1:
            return (topologyView && topologyView.rawData && topologyView.rawData.app_sla && Object.keys(topologyView.rawData.app_sla).length == 4 &&
                    (topologyView.rawData.app_sla.currency_type == 'dollar' || topologyView.rawData.app_sla.currency_type == 'yuan') &&
                    Number(topologyView.rawData.app_sla.cost) > 0 &&
                    Number(topologyView.rawData.app_sla.error_rate) > 0 && Number(topologyView.rawData.app_sla.error_rate) < 100 &&
                    Number(topologyView.rawData.app_sla.latency) > 0);
            break;
        case 2:
            return (topologyView && topologyView.rawData && topologyView.rawData.app_dmdProfile &&
                    Array.isArray(topologyView.rawData.app_dmdProfile) &&
                    topologyView.rawData.app_dmdProfile.length > 0 &&
                    topologyView.rawData.app_dmdProfile.some((dp) => {
                        return (dp.config && dp.config!=='' &&
                                dp.config_json && dp.config_json!=='' &&
                                dp.config_filename && dp.config_filename!=='' &&
                                dp.name!=='' &&
                                dp.load_duration>=300 &&
                                dp.load_duration<=1200); }
                    )
                   );
            break;
        case 3:
            return true;
            break;
        default:
            return false;
            break;
    }
}

class NextButton extends React.Component {
    constructor (props) {
        super(props);
        this.state = {classname: this.props.className + (this.props.currentSlide <= 0 ? '' : ' slick-disabled')};
    }
    componentWillReceiveProps (nextProps) {
        let topologyView = nextProps.topologyView;
        let newClassName = "";
        if(nextProps.currentSlide < 3 ){
            newClassName  = nextProps.className + (validateData(nextProps.currentSlide, topologyView) ? '' : ' slick-disabled');
        }else{
            newClassName  = nextProps.className + (nextProps.result ? '' : ' slick-disabled');
        }
        this.setState({classname: newClassName});
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return <button id="next_step" {...this.props} className={this.state.classname}>Next</button>
    }
}

/**
* RightSideContent
**/
export class RightSideContent extends React.Component {

    /**
    * constructor
    **/
    constructor(props) {
        super(props);
        this.updateState = this.updateState.bind(this);
        let url_params = utils.getUrlParams();
        let step       = !$.isEmptyObject(url_params) && $.isNumeric(url_params.step) && Number(url_params.step) >= 1 && Number(url_params.step) <= 5 ? Number(url_params.step) - 1 : -1;
        this.state = {
            id: 0,
            locations: [],
            pods: [],
            autoPlans: [],
            manualPlans: [],
            costList_a: [],
            latencyList_a: [],
            errorList_a: [],
            costList_m: [],
            latencyList_m: [],
            errorList_m: [],
            topologyView: {},
            uploadFile: {"appID": null, "appName": "", "content": "", "uploadFileFailed": false, "errorLine": 0, "uploadFileType": "blueprint"},
            autoSlickGoToDone: false,
            hasSLAResult : false
        }
        this.step = step;
    }
    slickGoTo(force) {
        if (force === 4 && this.state.uploadFile.uploadFileFailed && this.state.uploadFile.uploadFileType == 'config') {
            // user close Editor with error
            $('#config-file-name').val('');
            $('#file-upload').val('').attr('type','').attr('type','file');
        }
        if (force || (this.step >= 0 && this.step <= 4 && this.state.autoSlickGoToDone === false)) {
            let validated = false;
            let foundInvalid = false;
            let latestStep = 0;
            for (let i=0; i<this.step; i++) {
                validated = validateData(i, this.state.topologyView);
                if (!validated) { foundInvalid = true; break; }
                else latestStep = i + 1;
            }
            this.refs.configNewAppSlider.slickGoTo(latestStep);
            if (!force && !foundInvalid) this.state.autoSlickGoToDone = true;
        }
        $("body").removeClass("nav-active");
    }
    /**
    * componentWillMount
    **/
    componentWillMount() {
    	this.loadProfile(6);
    }

    loadProfile(id, callback) {
        let _this = this;
        const apiUrl = "libs/fixtures/deployment-plans-pods-new-init"+id+".json";
        this.serverRequest = axios({
            url: apiUrl,
            requestId: 'newapp'
        }).then(res => {
            let costList_m = [], latencyList_m = [], errorList_m = [];
            let costList_a = [], latencyList_a = [], errorList_a = [];
            if(typeof res.data.manual_plans != "undefined" && typeof res.data.manual_plans === "object"){
                res.data.manual_plans.map(function (plan, i) {
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                       plan.sla_result.cost != ""){
                        costList_m.push(parseFloat(plan.sla_result.cost));
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                       plan.sla_result.latency!=""){
                        latencyList_m.push(parseFloat(plan.sla_result.latency));
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                       plan.sla_result.error_rate!=""){
                        errorList_m.push(parseFloat(plan.sla_result.error_rate));
                    }
                })
            }
            if(typeof res.data.auto_plans != "undefined" && typeof res.data.auto_plans === "object"){
                res.data.auto_plans.map(function (plan, i) {
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.cost != "undefined" &&
                       plan.sla_result.cost != ""){
                        costList_a.push(parseFloat(plan.sla_result.cost));
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.latency != "undefined" &&
                       plan.sla_result.latency!=""){
                        latencyList_a.push(parseFloat(plan.sla_result.latency));
                    }
                    if(typeof plan.sla_result != "undefined" && typeof plan.sla_result.error_rate != "undefined" &&
                       plan.sla_result.error_rate!=""){
                        errorList_a.push(parseFloat(plan.sla_result.error_rate));
                    }
                })
            }
            var result = {
                    id: res.data.id,
                    locations: res.data.locations,
                    pods: res.data.setconfig_selectors,
                    autoPlans: res.data.auto_plans,
                    manualPlans: res.data.manual_plans,
                    costList_m: costList_m,
                    latencyList_m: latencyList_m,
                    errorList_m: errorList_m,
                    costList_a: costList_a,
                    latencyList_a: latencyList_a,
                    errorList_a: errorList_a,
                    topologyView: _this.state.topologyView
                }

            if (callback) {
            	callback(result);
            } else {
            	_this.setState(result);
            }
        });
    }
    /**
    * componentDidMount
    **/
    componentDidMount(){
        NewAppStore.on("change", this.updateState );
        pageInit();
        window.scrollTo(0, 0);
        //$(".slick-arrow.slick-next").prop('disabled', true);
    }
    componentDidUpdate() {
        window.scrollTo(0, 0);
    }


    /**
    * componentWillUnmount
    **/
    componentWillUnmount(){
        NewAppStore.removeListener("change", this.updateState );
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.slideState.itemid !== -1) {
            NewAppStore.setDPID(nextProps.slideState.itemid);
        }
        if (nextProps.slideState.step !== -1) {
            this.step = nextProps.slideState.step;
            this.slickGoTo(true);
        }
    }
    /**
    * updateState
    **/
    updateState(){
        let newTopologyViewData = NewAppStore.getTopologyViewData();
        if (typeof newTopologyViewData === 'undefined') return;
        this.setState({topologyView : newTopologyViewData});
        //const newUploadFile = update(this.state.uploadFile, {uploadFileFailed: {$set: false}, errorLine: {$set: 0}});
        let newUploadFile = {"appID": newTopologyViewData.rawData.app_id, "appName": newTopologyViewData.rawData.app_name, "content": newTopologyViewData.yaml, "uploadFileFailed": false, "errorLine": 0, "uploadFileType": "blueprint"};
        this.setState({uploadFile : newUploadFile});
        this.slickGoTo();
    }
    updateEditCodeContent (content, type, showEditor, emsg, elin) {
        const newUploadFile = update(this.state.uploadFile, {"content": {$set: content}, "uploadFileFailed": {$set: showEditor}, "errorLine": {$set: elin}, "uploadFileType": {$set: type}});
        this.setState({uploadFile : newUploadFile});
    }
    updateSLAData(slaData) {
        slaData.currency_type = slaData.currency_type == 'yuan' ? 'yuan' : 'dollar';
        slaData.cost          = $.isNumeric(slaData.cost) ? Number(slaData.cost) : 0;
        slaData.error_rate    = $.isNumeric(slaData.error_rate) ? Number(slaData.error_rate) : 0;
        slaData.latency       = $.isNumeric(slaData.latency) ? Number(slaData.latency) : 0;
        NewAppActions.updateSlaData(slaData);
    }
    afterChange (currentSlideIndex) {
        switch (currentSlideIndex+1) {
            case 1:
                this.updateEditCodeContent(this.state.topologyView.yaml, "blueprint", false, '', 0);
                break;
            default:
                break;
        }
        this.props.updateStepQuery(currentSlideIndex + 1);
        NewAppActions.updateStep(currentSlideIndex+1);
    }
    uploadConfigFile (type, content) {
        if (this.state && this.state.uploadFile && this.state.uploadFile.uploadFileType && this.state.uploadFile.uploadFileType === 'blueprint') {
            this.uploadBluePrintYaml(content);
        } else {
            this.uploadDemandProfileYaml(content);
        }
    }
    uploadBluePrintYaml (content) {
        let _self = this;
        const newUploadFile = update(_self.state.uploadFile, {content: {$set: content}});
        _self.setState({uploadFile : newUploadFile});
        $.ajax({ url: "/api/openview/api/v1/app/" + _self.state.uploadFile.appID + "/blueprint/original_content",
                 method: 'PUT',
                 contentType: "application/json",
                 data: JSON.stringify(content),
                 dataType: "json",
                 complete: function(e, xhr, settings) {
                     if (e.status === 200) {
                         const newUploadFile = update(_self.state.uploadFile, {uploadFileFailed: {$set: false}, errorLine: {$set: 0}});
                         _self.setState({uploadFile : newUploadFile});
                         NewAppStore.getTopologyView();
                         window.scrollTo(0, 0);
                     } else {
                         console.log("upload blueprint YAML failed (" + e.status + ") : ");
                         const newUploadFile = update(_self.state.uploadFile, {uploadFileFailed: {$set: true}, errorLine: {$set: JSON.parse(e.responseText).errorLine}});
                         _self.setState({uploadFile : newUploadFile});
                     }
                 }
        });
    }
    uploadDemandProfileYaml (content) {
        let dpid = NewAppStore.getDPID();
        let appid = NewAppStore.getAppID();
        if (dpid == 0 || !this.state.topologyView || !this.state.topologyView.rawData || !this.state.topologyView.rawData.app_dmdProfile) return;
        let name = '';
        let desc = '';
        let dura = 0;
        let yaml = '';
        this.state.topologyView.rawData.app_dmdProfile.some((dp) => {
            if (dp.id == dpid) {
                name = dp.name;
                desc = dp.description;
                dura = dp.load_duration;
            }
        });
        let data = {"name": name, "description": desc, "config": content, "load_duration": dura};
        let _self = this;
        $.ajax({ url: "/api/openview/api/v1/app/" + appid + "/demand-profiles/" + dpid,
                 method: 'PUT',
                 contentType: "application/json",
                 data: JSON.stringify(data),
                 dataType: "json",
                 complete: function(e, xhr, settings) {
                     if (e.status === 200){
                         NewAppStore.setDPID(dpid);
                         NewAppStore.getDemandProfile();
                     } else {
                         console.log("update Demand Config Profile : [" + dpid + "] failed (" + e.status + ") : ");
                         let errorline = e.responseText.match(/line \d*/)[0].replace('line ', '');
                         _self.updateEditCodeContent(content, 'config', true, e.responseText, errorline);
                     }
                 }
        });
    }

    /*
    *
    * */
    capacityPlanUpdate(result){
        let _this = this;
        if(result != this.state.SLAResult){
            let newResult = update(_this.state.SLAResult,{$set:result});
            this.setState({
                SLAResult:newResult
            })
        }
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        var slideChanged = this.stepChanged;
        var settings = {
            fade: false,
            infinite: false,
            speed: 1000,
            draggable: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: false,
            swipe: false,
            touchMove: true,
            accessibility: false,
            prevArrow: <PrevButton />,
            nextArrow: <NextButton topologyView={this.state.topologyView} result={this.state.SLAResult}/>,
            afterChange: this.afterChange.bind(this)
        };
        return(
            <div>
            <EditCodeModal uploadFile={this.state.uploadFile} slickGoTo={this.slickGoTo.bind(this)} uploadYAML={this.uploadConfigFile.bind(this)}/>
            <Content>
                <AsideNote />
                <div className="application-steps">
                    <form className="application-form" action="#">
                        <Slider ref="configNewAppSlider" {...settings} >
                            <div><ApplicationService topologyView={this.state.topologyView} /></div>
                            <div><OperationalRequirements updateSLAData={this.updateSLAData.bind(this)} topologyView={this.state.topologyView} /></div>
                            <div><DemandProfile updateEditCodeContent={this.updateEditCodeContent.bind(this)} topologyView={this.state.topologyView} /></div>
                            <div><DeploymentPlans capacityPlanUpdate={this.capacityPlanUpdate.bind(this)} plans={this.state} topologyView={this.state.topologyView} /></div>
                            <div><DeploymentConfigurations plans={this.state} parent={this} topologyView={this.state.topologyView} /></div>
                        </Slider>
                    </form>
                </div>
            </Content>
            </div>
        )
    }
}

/**
* LeftSideBar
**/
export class LeftSideBar extends React.Component {

    /**
    * constructor
    **/
    constructor() {
      super();
      this.state = NewAppStore.getAllStepData();
      let url_params = utils.getUrlParams();
      let app_id     = !$.isEmptyObject(url_params) && $.isNumeric(url_params.app) ? url_params.app : 1;
      let step       = !$.isEmptyObject(url_params) && $.isNumeric(url_params.step) && Number(url_params.step) >= 1 && Number(url_params.step) <= 5 ? Number(url_params.step) - 1 : -1;
      let dp_id      = !$.isEmptyObject(url_params) && $.isNumeric(url_params.dp) ? url_params.dp : 0;

      NewAppStore.setAppID(app_id);
      NewAppStore.setDPID(dp_id);
      this.updateState = this.updateState.bind(this);
      this.serviceMenuChanged = this.serviceMenuChanged.bind(this);
      this.launchApplication = this.launchApplication.bind(this);
      this.state.topologyView = {};
      this.state.errMsg = "";
      this.step = step;
    }

    /**
    * componentDidMount
    **/
    componentDidMount(){
        NewAppStore.on("change", this.updateState );
        NewAppStore.initData();
        for (let i=0; i<=this.step; i++) {
            switch (i) {
                case 1:
                    NewAppStore.getSLAData();
                    break;
                case 2:
                    NewAppStore.getDemandProfile();
                    break;
                default:
                    break;
            }
        }
    }

    /**
    * componentWillUnmount
    **/
    componentWillUnmount(){
        NewAppStore.removeListener("change", this.updateState );
    }

    /**
    * updateState
    **/
    updateState(){
        this.setState(NewAppStore.getAllStepData());
        this.step = NewAppStore.getSelectedStep().id;
        if (this.state.topologyView && Object.keys(this.state.topologyView).length != 0 && this.state.topologyView.rawData && this.state.topologyView.rawData.app_sla &&
            ((this.state.topologyView.rawData.app_sla.cost && this.state.topologyView.rawData.app_sla.cost !== "") ||
             (this.state.topologyView.rawData.app_sla.latency && this.state.topologyView.rawData.app_sla.latency !== "") ||
             (this.state.topologyView.rawData.app_sla.error_rate && this.state.topologyView.rawData.app_sla.error_rate !== ""))
           )
           {
               const newOpRequirements = update(this.state.opRequirements, {"status": {$set: "active"}});
               this.setState({opRequirements: newOpRequirements});
           }
    }

    /**
    * serviceMenuChanged
    **/
    serviceMenuChanged(menuId){
        NewAppActions.updateServiceMenu(menuId);
    }

    backtoTopologyView () {
        this.props.changeSlide(1);
    }

    showFailedMessageModal (result) {
        this.setState({errMsg: JSON.parse(result.responseText).status_summary.note});
        $("#launch_application_status_modal").css("display", "block");
    }

    /*
    *
    * */
    launchApplication(){
        let _this = this;
        if(this.step == 5){
            let appId = NewAppStore.getAppID();
            let _this = this;
            $.ajax({ url: "/api/openview/api/v1/apps/" + appId + "/launch?capacity-plan-result-id=" + NewAppStore.selectedConfig.id,
                     method: 'POST',
                     statusCode: { 422: _this.showFailedMessageModal.bind(_this) },
                     complete: function(e, xhr) {
                         if (e.status == 200) {
                              window.location.hash = 'home';
                         }
                    }
            });

        }

    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        var app_name = this.state.topologyView && this.state.topologyView.rawData ?
                       this.state.topologyView.rawData.app_name : "";
        var appService = this.state.appService;
        var opRequirements = this.state.opRequirements;
        var demandProfile = this.state.demandProfile;
        var deployPlans = this.state.deployPlans;
        var deployConfig = this.state.deployConfig;
        let listArray = [appService, opRequirements, demandProfile, deployPlans, deployConfig];
        let style = {
        }

        var className = "btn-application";
        for (let i=0; i<=this.step; i++) {
            if (validateData(i, this.state.topologyView)) {
                listArray[i].status = 'active';
            }
            if(i == 5){

                className += " enable";
            }
        }

        return(
            <div>
            <SideBar>
                <SideBarTopSection>
                    <div className="intro">
                        <h1 className="app-name">{app_name}</h1>
                        <p>
                            APPLICATION CONFIGURATIONS
                        </p>
                        <span className="hint">STEP {this.state.selectedStep.id} OF {this.state.stepData.length}</span>
                    </div>
                    <span className="btn-holder"><Link to="home" className="btn-back">Back</Link></span>
                </SideBarTopSection>

                <SideBarNavSection>
                    <AccordionLinks>
                        <AccLink className={appService.status} link_name={appService.name} changeSlide={this.props.changeSlide.bind(this)} step={1} >
                            <Slide>
                                <APPList changeSlide = {this.props.changeSlide.bind(this)}
                                data = {typeof this.state.topologyView === 'undefined' || Object.keys(this.state.topologyView).length === 0 || !this.state.topologyView.services || this.state.topologyView.services.length === 0 ? [] : this.state.topologyView.services}
                                configsById = {typeof this.state.topologyView === 'undefined' || Object.keys(this.state.topologyView).length === 0 || !this.state.topologyView.configsById ? [] : this.state.topologyView.configsById} />
                            </Slide>
                        </AccLink>

                        <AccLink link_name={opRequirements.name} className={opRequirements.status} changeSlide={this.props.changeSlide.bind(this)} step={2} >
                            <Slide>
                                <SLAList changeSlide = {this.props.changeSlide.bind(this)}
                                sla = {typeof this.state.topologyView === 'undefined' || Object.keys(this.state.topologyView).length === 0 || !this.state.topologyView.rawData || !this.state.topologyView.rawData.app_sla ? {cost:"", latency:"", error_rate:""} : this.state.topologyView.rawData.app_sla}
                                currencyType = {typeof this.state.topologyView === 'undefined' || Object.keys(this.state.topologyView).length === 0 || !this.state.topologyView.rawData || !this.state.topologyView.rawData.app_sla || !this.state.topologyView.rawData.app_sla.currency_type ? "usd" : this.state.topologyView.rawData.app_sla.currency_type } />
                            </Slide>
                        </AccLink>

                        <AccLink link_name={demandProfile.name} className={demandProfile.status} changeSlide={this.props.changeSlide.bind(this)} step={3} >
                            <Slide>
                                <DPList changeSlide = {this.props.changeSlide.bind(this)}
                                dp = {typeof this.state.topologyView === 'undefined' || Object.keys(this.state.topologyView).length === 0 || !this.state.topologyView.rawData || !this.state.topologyView.rawData || !this.state.topologyView.rawData.app_dmdProfile ? [] : this.state.topologyView.rawData.app_dmdProfile} />
                            </Slide>
                        </AccLink>

                        <AccLink link_name={deployPlans.name} className={deployPlans.status} changeSlide={this.props.changeSlide.bind(this)} step={4} />
                        <AccLink link_name={deployConfig.name} className={deployConfig.status} changeSlide={this.props.changeSlide.bind(this)} step={5} />
                    </AccordionLinks>
                </SideBarNavSection>

                <div className="btn-box inner">
                    <a id="launchapp" style={style} onClick={this.launchApplication}  className={className}>Launch Application</a>
                </div>

            </SideBar>
            <ModalPopup ref="launchAppStatus"
                        eleId="launch_application_status_modal"
                        title="Launch Application Failed"
                        bodyDesc={this.state.errMsg}
                        saveBtn="Edit Config"
                        saveChange={this.backtoTopologyView.bind(this)}
                        hidInput={true}
                        cancelBtn="Close" />
            </div>
        )
    }
}

LeftSideBar.contextTypes = {
    router: React.PropTypes.object
}
