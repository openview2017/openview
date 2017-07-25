import React from 'react'
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router'
import Slider from 'react-slick'
import NewAppStore from '../../stores/NewAppStore'
//import DashboardStore from '../../stores/DashboardStore'
import update from 'immutability-helper'
import EditCodeModal from '../CodeEditor/CodeEditor'
import { ModalPopup } from '../../components/Popup.js'
import './home.css'
import Select, { Option } from 'rc-select';

/**
* Add new block
*/
class AddNewBlock extends React.Component {

    /**
    * constructor
    **/
    constructor(props) {
        super(props);
        this.state = {
            topologyView: {services:[]},
            selectedEntryPoint: "",
            updateResult: true,
            updateResultMsg: 'Invalid File',
            showFix: "",
            uploadFile: {"appID": null, "appName": "", "content": "", "uploadFileFailed": false, "errorLine": 0, "errorMsg": ""}
        }
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleAppNameChange = this.handleAppNameChange.bind(this);
    }
    /**
    * handleFileSelect
    * handles file select
    */
    handleFileSelect(evt) {
        this.slickGoTo(3);
        var files = evt.target.files; // FileList object
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            if (!f.name.match('\.yaml') && !f.name.match('\.json') && !f.name.match('\.yml')) {
                console.log("not support");
                this.setState({updateResultMsg: "Invalid File. Not support type!"});
                this.setState({updateResult: false});
                this.setState({showFix: " one-button"});
                setTimeout(() => {
                    this.slickGoTo(4);
                }, 1000);
                continue;
            }
            reader.onload = (function(e) {
                this.createApp(reader.result);
            }).bind(this);
            reader.readAsText(f);
        }
    }
    gotoSetupEntryPoint() {
        let resolve = () => {
            this.setState({topologyView: NewAppStore.getTopologyViewData()});
            this.slickGoTo(5);
            NewAppStore.removeListener("change", resolve);
        }
        NewAppStore.initData(this.state.uploadFile.appID);
        NewAppStore.on("change", resolve);
    }
    gotoTopologyView() {
        console.log(this.state.selectedEntryPoint);
        if (this.state.selectedEntryPoint !== "") {
            NewAppStore.setAppID(this.state.topologyView.rawData.app_id);
            //this.uploadConfigFile('json', JSON.stringify(this.state.topologyView.rawData));
            this.redirectToNewAppPage();
        }
    }
    slickGoTo(nextStep) {
        this.refs.newAppSlider.slickGoTo(nextStep);
    }
    /**
    * gotoSecond
    * show second slide
    **/
    gotoSecond(resetform) {
        if (resetform === true) {
            $("form#addNewApp").trigger('reset');
            this.showCodeEditor(false);
        }
        if(this.state.uploadFile.appName != "" || resetform === true) {
            this.slickGoTo(2);
        }
    }
    redirectToNewAppPage() {
        window.location.hash = '#newapp?app=' + this.state.uploadFile.appID;
        window.scrollTo(0,0);
    }
    /**
    * handleAppNameChange
    * handles application name change
    **/
    handleAppNameChange(evt) {
        const newUploadFile = update(this.state.uploadFile, {appName: {$set: evt.target.value}});
        this.setState({uploadFile : newUploadFile});
    }

    uploadConfigFile (type, content, msg) {
        var _self = this;

        if (typeof msg !== 'undefined') {
            const newUploadFile = update(_self.state.uploadFile, {appID: {$set: msg.id}});
            _self.setState({uploadFile : newUploadFile});
        } else {
            const newUploadFile = update(_self.state.uploadFile, {content: {$set: content}});
            _self.setState({uploadFile : newUploadFile});
        }

        $.ajax({ url: "/api/openview/api/v1/app/" + _self.state.uploadFile.appID + "/blueprint/" + (type=='yaml' ? "original_content" : "edited_content"),
                 method: 'PUT',
                 contentType: "application/json",
                 data: JSON.stringify(content),
                 dataType: "json",
                 complete: function(e, xhr, settings) {
                     if (e.status === 200){
                         console.log("upload " + type.toUpperCase() + " success.");
                         _self.setState({updateResult: true});
                         _self.props.updateInprogressId(_self.state.uploadFile.appID);
                         const newUploadFile = update(_self.state.uploadFile, {uploadFileFailed: {$set: false}, errorLine: {$set: 0}, errorMsg: {$set: ""}});
                         _self.setState({uploadFile : newUploadFile});
                         if (type == 'yaml') {
                             setTimeout(() => {
                                 _self.slickGoTo(4);
                             }, 1000);
                         } else {
                             _self.redirectToNewAppPage();
                         }
                     } else {
                         console.log("upload " + type.toUpperCase() + " failed (" + e.status + ") : ");
                         _self.setState({updateResult: false});
                         _self.setState({updateResultMsg: 'Invalid File'});
                         _self.setState({showFix: ""});
                         const newUploadFile = update(_self.state.uploadFile, {uploadFileFailed: {$set: true}, errorLine: {$set: JSON.parse(e.responseText).errorLine},errorMsg: {$set: JSON.parse(e.responseText).errorMsg}});
                         _self.setState({uploadFile : newUploadFile});
                     }
                 }
        });
    };

    createApp(content) {
        if (this.state.uploadFile.appID !== null) {
            this.uploadConfigFile('yaml', content);
        } else {
            var _self = this;
            var logoSample = ['acme-air', 'flightbox', 'sky-stats'];
            var logoIdx = Math.floor(Math.random() * 3);

            let appInfo = {"name": this.state.uploadFile.appName,
                           "logo_url": "themes/openview/images/logos/" + logoSample[logoIdx] + ".png",
                           "user_id": 1
                          };
            $.ajax({ url: "/api/openview/api/v1/apps/",
                     method: 'POST',
                     contentType: "application/json",
                     data: JSON.stringify(appInfo),
                     dataType: "json",
                     statusCode: { 201: _self.uploadConfigFile.bind(_self, 'yaml', content) },
                     complete: function(e, xhr) {
                         if (e.status !== 201) {
                              _self.setState({updateResult: false});
                              _self.setState({updateResultMsg: 'Created App Failed!'});
                              _self.setState({showFix: ""});
                              _self.showCodeEditor(true);
                              const newUploadFile = update(_self.state.uploadFile, {uploadFileFailed: {$set: true}, errorLine: {$set: 0}, errorMsg: {$set: ""}});
                              _self.setState({uploadFile : newUploadFile});
                         }
                    }
            });
            const newUploadFile = update(this.state.uploadFile, {content: {$set: content}});
            this.setState({uploadFile : newUploadFile});
        }
    }
    handleEntryPointChange(value) {
        this.state.selectedEntryPoint = value;
        this.setState({selectedEntryPoint: value});
        $.ajax({ url: "/api/openview/api/v1/app/" + this.state.uploadFile.appID + "/blueprint/entry_point",
                 method: 'PUT',
                 contentType: "application/json",
                 data: JSON.stringify(this.state.selectedEntryPoint),
                 dataType: "json",
                 complete: function(e, xhr, settings) {
                     if (e.status === 200){
                         console.log("set Entry Point success.");
                     } else {
                         console.log("set Entry Point failed.");
                     }
                 }
        });

        // this.state.topologyView.rawData.SetConfigs.map((config, idx) => {
        //     if (config.kind === 'Service') {
        //         this.state.topologyView.rawData.SetConfigs[idx]['entry_point'] = config.name == this.state.selectedEntryPoint;
        //     }
        // });
    }
    /**
    * handleDocumentClick
    * reset slider if click event happen outside the add new block
    **/
    handleDocumentClick(evt) {
        if ($.inArray("entryl-point-service", evt.target.classList)) return;
        const area = ReactDOM.findDOMNode(this.refs.newAppSlider);
        if (!area.contains(evt.target) && $(evt.target).parents('#edit-code-modal').length === 0) {
            $("form#addNewApp").trigger('reset');
            this.slickGoTo(0);
            this.showCodeEditor(false);
        }
    }

    /**
    * submitHandler
    * disable form submittion, show last slide
    */
    submitHandler(evt) {
        evt.preventDefault();
        if(this.state.uploadFile.appName != "") {
            this.slickGoTo(2);
        }
        return false;
    }
    showCodeEditor(status) {
        const newUploadFile = update(this.state.uploadFile, {uploadFileFailed: {$set: status}});
        this.setState({uploadFile : newUploadFile});
    }
    /**
    * componentWillMount
    **/
    componentWillMount() {
        document.addEventListener('click', this.handleDocumentClick, false);
    }
    /**
    * componentWillUnmount
    **/
    componentWillUnmount() {
        document.removeEventListener('click', this.handleDocumentClick, false);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        const settings = {
            draggable: false,
            swipe: false,
            touchMove: true,
            arrows: false,
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerPadding: '0px'
        };

        return (
            <div className="addnew-block">
                <form id="addNewApp" className="applications-name" onSubmit={this.submitHandler.bind(this)}>
                    <div className="mask">
                        <Slider ref="newAppSlider" className="holder" {...settings} >
                            <div>
                                 <div className="slide add-new">
                                    <a className="btn-add next" onClick = {this.slickGoTo.bind(this, 1)} href="javascript:void(0);">
                                        Add New
                                    </a>
                                </div>
                            </div>
                            <div>
                                <div className="slide app-name">
                                    <div className="validate-row">
                                        <span className="app-title">What’s Your<br/> Applications Name?</span>
                                        <input className="required" id="app_name" onChange={this.handleAppNameChange} type="text" />
                                        <button type="button" onClick = {this.gotoSecond.bind(this)} className="btn-form next">Next</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="slide select-file">
                                    <label htmlFor="file" className="import-yaml-file">
                                        Import Existing Compose YAML File
                                    </label>
                                    <input type="file" id="file" name="file" className="input-file" accept=".yaml,.json,.yml" />
                                </div>
                            </div>
                            <div>
                                <div className="validation-file">
                                    <div className="validation-status">Validating File......</div>
                                    <div className="validation-status validating"></div>
                                </div>
                            </div>
                            <div>
                                <div className="validation-file">
                                    <div style={{display: this.state.updateResult === true ? '' : 'none'}}>
                                        <div className="validation-status">Valid File</div>
                                        <div className="validation-status valid"></div>
                                        <button type="button" onClick = {this.gotoSetupEntryPoint.bind(this)} className="btn-form next">Next</button>
                                    </div>
                                    <div style={{display: this.state.updateResult === true ? 'none' : ''}}>
                                        <div className="validation-status">{this.state.updateResultMsg}</div>
                                        <div className="validation-status invalid"></div>
                                        <button type="button" onClick = {this.gotoSecond.bind(this, true)} className={"btn-form tryagain" + this.state.showFix}>Try Again</button>
                                        <button type="button" onClick = {this.showCodeEditor.bind(this, true)} className={"btn-form fixerror" + this.state.showFix}>Fix Error</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="slide app-name">
                                    <div className="validate-row">
                                        <span className="app-title">What’s Your entry point?</span>
                                        <Select
                                            value={this.state.selectedEntryPoint}
                                            style={{ fontSize:"12px", width:"185px", backgroundColor:"#32353e", color:"#e9e9ea" }}
                                            animation="slide-up"
                                            showSearch={false}
                                            onChange={this.handleEntryPointChange.bind(this)}
                                            optionLabelProp="text"
                                        >
                                            <Option className="entryl-point-service" text="Select One" value="" disabled={true}>Select One</Option>
                                            {
                                                this.state.topologyView.services.map((service, idx)=> {
                                                    return <Option className="entryl-point-service" key={idx} text={service.name} value={service.name} disabled={!service.allowedSetEntryPoint}>{service.name}</Option>
                                                })
                                            }
                                        </Select>
                                        <button type="button" onClick = {this.gotoTopologyView.bind(this)} className="btn-form next gototopology">Next</button>
                                    </div>
                                </div>
                            </div>
                        </Slider>
                    </div>
                </form>
                <EditCodeModal uploadFile={this.state.uploadFile} slickGoTo={this.slickGoTo.bind(this)} uploadYAML={this.uploadConfigFile.bind(this)}/>
            </div>
        )
    }

    componentDidMount() {
        document.getElementById('file').addEventListener('change', this.handleFileSelect.bind(this), false);
    }
}

/**
* Application box
*/
class AppBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {statusPhase: this.props.data.status.phase};
        this.state.service_count = this.props.data.status.service_count;
        this.state.pod_count = this.props.data.status.pod_count;
        this.state.ready_pod_count = typeof this.props.data.status.ready_pod_count === 'undefined' ? -1 : this.props.data.status.ready_pod_count;
        this.state.container_count = this.props.data.status.container_count;
    }
    onClick(id) {
        this.props.deleteApp(id);
    }
    componentWillReceiveProps(nextProps) {
        this.setState({statusPhase: nextProps.data.status.phase, service_count: nextProps.data.status.service_count, pod_count: nextProps.data.status.pod_count, container_count: nextProps.data.status.container_count, ready_pod_count: typeof nextProps.data.status.ready_pod_count === 'undefined' ? -1 : nextProps.data.status.ready_pod_count});
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        var container_ct = 0;
        let service_count = this.state.service_count;
        let pod_count = this.state.pod_count;
        let ready_pod_count = this.state.ready_pod_count;
        let container_count = this.state.container_count;
        let statusPhase = this.state.statusPhase;

        var appStatus = "";
        var appStatusIndicator = "";
        var appLink = "";
        var appRemove = "";
        var appRemoveIcon = "";
        var appStatusIndicatorClass = "";

        switch(statusPhase){
            case "error":
                appLink = "#/newapp?app="+this.props.data.id+"&step=1";
                appRemove = "close";
                appRemoveIcon = "x";
                appStatus = "error";
                appStatusIndicatorClass = "indicator nostatus";
                appStatusIndicator = "ERROR";
                break;
            case "creating":
            case "planning":
                appLink = "#/newapp?app="+this.props.data.id+"&step=" + (statusPhase == "creating" ? "1" : "4");
                appRemove = "close";
                appRemoveIcon = "x";
                appStatus = "incomplete";
                appStatusIndicatorClass = "indicator nostatus";
                appStatusIndicator = statusPhase == "creating" ? "INCOMPLETE" : "PLANNING";
                break;
            case "launching":
            case "deleting":
                appLink = "#/home";
                appRemove = "close";
                appRemoveIcon = "x";
                appStatus = statusPhase;
                appStatusIndicatorClass = "indicator nostatus";
                appStatusIndicator = statusPhase.toUpperCase();
                break;
            case "launched":
                appLink = "#/dashboard?app="+this.props.data.id;
                appRemove = "close";
                appRemoveIcon = "x";
                appStatus = "";
                appStatusIndicatorClass = "indicator good";
                appStatusIndicator = "LIVE";
                break;
            default:
                console.log("========= app status error");
                break;
        }

        var id = (typeof this.props.data.name) === "string" ? this.props.data.name : "";
        var status = "block add2 " + (typeof this.props.data.status.phase === "string" ? this.props.data.status.phase : "incomplete");
        var logoSrc = "";
        var imageStyle = {
            width:'184px'
        }
        if (!this.props.data.logo_url) {
            this.props.data.logo_url = this.props.data.logo;
        }
        if (this.props.data.logo_url && this.props.data.logo_url !== "") {
            if(this.props.data.name == "flightbox") {
                imageStyle = {
                    width:'236px'
                }
            }
            logoSrc = this.props.data.logo_url;
        }

        return (
            <div className={status}>
                <span className={appStatus}></span>
                <span className={appRemove} onClick={this.onClick.bind(this,this.props.data.id)}>{appRemoveIcon}</span>
                <a href={appLink}>
                    <div className="chart-holder app1"></div>
                    <div className="text-detail">
                        {/*<img src={logoSrc} style={imageStyle} />*/}
                        <h1>{this.props.data.name}</h1>
                        <p>
                            {/*LAST 30 MIN AVG RESPONSE TIME - <span className="live_point">N/A</span>*/}
                        </p>
                        <span className={appStatusIndicatorClass}>{appStatusIndicator}</span>
                    </div>
                    <div className="bottom-text home">
                        <span className="stack home">Service(s): {service_count}</span>
                        <span className="pod home">Pod(s): { ( ready_pod_count >= 0 ? ready_pod_count+"/"+pod_count : pod_count) }</span>
                        <span className="container home">Container(s): {container_count}</span>
                    </div>
                </a>
            </div>
        )
    }
}

/**
* Application list
*/
class AppList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {appList: []};
        this.timeInterval = null;
        this.activingCount = 0;
        this.tmpDeleteAppID = -1;
        this.deleteAppID = [];
        this.inProgressId = -1;
    }

    updateInprogressId (id) {
        this.inProgressId = id;
    }

    confirmDeleteApp (input) {
        if (input === "DELETE" && this.tmpDeleteAppID != -1) {
            this.deleteAppID.push(this.tmpDeleteAppID);
            this.deleteApp(this.tmpDeleteAppID);
        } else {
            this.tmpDeleteAppID = -1;
        }
    }

    resetDeleteApp () {
        this.tmpDeleteAppID = -1;
    }

    showConfirmDeleteModal (id) {
        $("#updatedConfigValue", "#update-config-modal").val("");
        $("#update-config-modal").css("display", "block");
        $("#updatedConfigValue", "#update-config-modal").focus();
        this.tmpDeleteAppID = id;
    }

    deleteApp(id) {
        console.log("Delete id:" + id);
        let _self = this;
        let updateList = () => {
            let newList = this.state.appList.filter(function(item) {
                return item.id !== id;
            });
            this.setState({appList: newList});
        }
        $.ajax({ url: "/api/openview/api/v1/apps/" + id,
                 method: 'DELETE',
                 dataType: "json",
                 statusCode: {
                     200: (() => {
                         setTimeout(() => {
                             _self.activingCount = 1;
                         }, 2000);
                     }),
                     404: (function(errorMsg) {
                         console.log("Can not fine Appid: " + id);
                         console.dir(errorMsg);
                     })
                 },
                //  complete: () => {_self.deleteAppID = -1;}
        });
    }

    query () {
        let jqxhr = $.getJSON("/api/openview/api/v1/apps", (data) => {
            //DashboardStore.setAppList(data);
            this.setState({appList: data});
        })
        .fail(function() {
            console.log("Get Application list failed!");
        });
    }

    componentWillMount () {
        let _self = this;
        if (this.timeInterval === null) {
            this.query();
        }
        clearInterval(this.timeInterval);
        this.timeInterval = setInterval(() => {
            if (_self.activingCount !== 0 || _self.deleteAppID.length > 0) {
                _self.query();
            }
        }, 1000);
    }

    componentWillUnmount () {
        clearInterval(this.timeInterval);
        this.inProgressId = -1;
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        // let addedApps = "";
        // getAppList((applist) => {
        //     addedApps = applist.map((app, i) => {
        //           return (
        //               <AppBox key={i} data={app} deleteApp={this.showConfirmDeleteModal.bind(this)} />
        //           );
        //     });
        // })
        //let length = addedApps.length;
        let newAddedApps = [];

        let updatedList = this.state.appList.map((app) => {
            this.deleteAppID.forEach((did) => {
                if (did == app.id) {
                    app.status.phase = "deleting";
                }
            });
            return app;
        });

        this.activingCount = 0;
        let keepDeleteAppid = [];
        newAddedApps = updatedList.map((app, i) => {
            this.deleteAppID.forEach((did) =>{
                if (did == app.id) {
                    keepDeleteAppid.push(did);
                }
            });
            if (app.status.phase === 'launching' || app.status.phase === 'deleting') {
                this.activingCount ++;
            }
            return (
                (this.inProgressId !== app.id) ?
                <AppBox key={i} data={app} deleteApp={this.showConfirmDeleteModal.bind(this)} /> : null
            );
        });

        ((updateDID) => {
            this.deleteAppID = updateDID;
        })(keepDeleteAppid);

        return (
            <div>
                { newAddedApps }
                <AddNewBlock updateInprogressId={this.updateInprogressId.bind(this) }/>
                <ModalPopup title="Delete Application" bodyDesc="To confirm deleteing application, please type the word 'DELETE' below." saveBtn="Confirm Delete" cancelBtn="Cancel"
                            saveChange={this.confirmDeleteApp.bind(this)}
                            cancelChange={this.resetDeleteApp.bind(this)} />
            </div>
        )
    }
}

/**
* Home content
*/
class HomeContent extends React.Component {
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div>
                <AppList />
            </div>
        )
    }
}

/**
* Home component
*/
export default class Home extends React.Component {
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div>
                <HomeContent />
            </div>
        )
    }
}
