import React from 'react'
import { HintField, ButtonArea } from './Util'
import NewAppStore from '../../stores/NewAppStore'
import Select, { Option } from 'rc-select';

/**
* Requirement
**/
class Requirement extends React.Component{
    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        return(
            <div className="post" id={"req" + this.props.data.id}>
                <div className="opener-holder validate-row">
                    <div className={"opener " + this.props.data.name}>
                        <label>{this.props.data.title}</label>
                    </div>
                </div>
                <div>
                    <div className="field-box" data-id={this.props.data.name}>
                        <div className="box">
                            {
                                this.props.data.options.map(function(opt,i) {
                                //let key = "-" + this.props.data.id + opt.id;
                                    switch (this.props.data.name) {
                                        case "latency":   return <LatencyOpt key={i} onChangeValue={this.props.onChangeValue.bind(this)} sla={this.props.sla} />;
                                        case "errorrate": return <ErrorRateOpt key={i} onChangeValue={this.props.onChangeValue.bind(this)} sla={this.props.sla} />;
                                        default: return <CostOpt key={i} onChangeValue={this.props.onChangeValue.bind(this)} sla={this.props.sla} />;
                                    }
                                },this)
                            }
                        </div>
                    </div>
                </div>
                <div className="hint-field">
                    <strong className="hint-title">{this.props.data.title}</strong>
                    <p>{this.props.data.hint}</p>
                </div>
            </div>
        )
    }
}

/**
* LatencyOpt
**/
class LatencyOpt extends React.Component{
    constructor(props){
        super(props);
        this.state = {"value": ''};
        this.changeTimer;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.sla.latency !== '') this.setState({"value": nextProps.sla.latency});
    }
    onChangeValue (key, event) {
        let slakey = key;
        let value = event.target.value;
        this.setState({"value": value});
        clearTimeout(this.changeTimer);
        this.changeTimer = setTimeout(() => {
            this.props.onChangeValue(slakey, value);
        }, 500);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return(
            <div id="latency_requirements">
                <div className="slide-holder latency">
                       <div className="alert-input validate-item">
                        <label className="alert-input-label" htmlFor="latency">Maximum 90th Percentile Tail Latency (ms) </label>
                        <div className="alert-input-holder">
                            <input className="required-email" type="text" placeholder=" " value={this.state.value} id="latency" onChange={this.onChangeValue.bind(this, "latency")} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* ErrorRateOpt
**/
class ErrorRateOpt extends React.Component{
    constructor(props){
        super(props);
        this.state = {"value": ''};
        this.changeTimer;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.sla.error_rate !== '') this.setState({"value": nextProps.sla.error_rate});
    }
    onChangeValue (key, event) {
        let slakey = key;
        let value = event.target.value;
        this.setState({"value": value});
        clearTimeout(this.changeTimer);
        this.changeTimer = setTimeout(() => {
            this.props.onChangeValue(slakey, value);
        }, 500);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        return(
            <div id="common-requirements">
                <div className="slide-holder budget">
                    <div className="alert-input validate-item">
                        <label className="alert-input-label" htmlFor="error_rate">Maximum Error Rate is % </label>
                        <div className="alert-input-holder">
                            <input className="required-email" type="text" placeholder=" " value={this.state.value} id="error_rate" onChange={this.onChangeValue.bind(this, "error_rate")} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* CostOpt
**/
class CostOpt extends React.Component{
    constructor(props){
        super(props);
        this.state = {"value": '', "currency_type": "$(USD)"};
        this.changeTimer;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.sla.cost !== '') this.setState({"value": nextProps.sla.cost});
        if (nextProps.sla && nextProps.sla.currency_type != this.state.currency_type) {
            let ct = this.props.sla.currency_type === 'yuan' ? "¥(‎RMB)" : "$(USD)";
            this.setState({currency_type: ct});
        }
    }
    onChangeValue (key, evt) {
        let slakey = key;
        let value = evt.target.value;
        if (key === "cost") this.setState({"value": value});
        clearTimeout(this.changeTimer);
        this.changeTimer = setTimeout(() => {
            this.props.onChangeValue(slakey, value);
        }, 500);
    }
    onChangeSelectValue (key, value) {
        let slakey = key;
        let mapValue = value==='¥(‎RMB)' ? "yuan" : "dollar" ;
        this.setState({"currency_type": value});
        clearTimeout(this.changeTimer);
        this.changeTimer = setTimeout(() => {
            this.props.onChangeValue(slakey, mapValue);
        }, 500);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        let _self = this;
        return(
            <div id="common-requirements">
                <div className="slide-holder budget">
                    <div className="alert-input validate-item">
                        <label className="alert-input-label" htmlFor="cost">Target Monthly Budget is </label>
                        <div className="alert-input-holder">
                            <input className="required-email" type="text" placeholder=" " value={this.state.value} id="cost" onChange={this.onChangeValue.bind(this, "cost")} />
                        </div>
                        <div className="select-holder1 validate-item" style={{marginLeft:"10px"}}>
                            <Select
                                value={this.state.currency_type}
                                style={{ fontSize:"12px", width:"80px", backgroundColor:"#5e626a", color:"#ffffff" }}
                                animation="slide-up"
                                showSearch={false}
                                onChange={_self.onChangeSelectValue.bind(_self, "currency_type")}
                            >
                                <Option value="$(USD)">$(USD)</Option>
                                <Option value="¥(‎RMB)">¥(‎RMB)</Option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* Content
**/
class Content extends React.Component{

    /**
    * constructor
    **/
    constructor(props){
        super(props);
        this.state = {"requirements": NewAppStore.getInfoRequirements(), "sla": {cost: "", currency_type: "dollar", latency: "", error_rate: ""}};
        this.changTimer;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topologyView && nextProps.topologyView.rawData && nextProps.topologyView.rawData.app_sla && Object.keys(nextProps.topologyView.rawData.app_sla).length === 4) {
            this.setState({"sla": nextProps.topologyView.rawData.app_sla});
        }
    }

    handleChange(key, value) {
        this.state.sla[key] = key==='currency_type' ? value : ($.isNumeric(value) ? Number(value) : this.state.sla[key]);
    }

    handleSubmit(event) {
        this.props.updateSLAData(this.state.sla);
        event.preventDefault();
    }

    /**
    * handleChangeChk
    **/
    handleChangeChk(reqId,val){
        this.state.requirements.find(x=> x.id === reqId).checked = val;
        this.setState({requirements: this.state.requirements});
    }

    /**
    * clickAdd
    **/
    clickAdd(reqId){
        let opts = this.state.requirements.find(x=> x.id === reqId).options;
        opts.push({id: opts.length + 1, hasDelete: true});
        this.setState({requirements: this.state.requirements});
    }

    /**
    * clickDelete
    **/
    clickDelete(reqId, optId){
        let opts = this.state.requirements.find(x=> x.id === reqId).options;
        opts.splice( opts.findIndex( x => x.id === optId ), 1 );
        this.setState({requirements: this.state.requirements});
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        return(
                <div className="newapp-slide-content">
                    <div className="requirements-posts checkbox-holder">
                        {this.state.requirements.map(function(req) {
                            return (<Requirement data={req} key={req.id} onChangeValue={this.handleChange.bind(this)} sla={this.state.sla} />)
                        },this)}

                        <div className="form-post bitn-post">
                            <div className="btn-frame">
                                <div className="btn-default" type="submit" onClick={this.handleSubmit.bind(this)}>
                                    Save
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
        )
    }
}

/**
* OperationalRequirements
**/
export default class OperationalRequirements extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
      render() {
          return (
            <div className="application-form application-data operation-requirements">
                <ButtonArea icon="icon-gears-new" title="Operational Requirements" titleClass="new-application"/>
                <Content updateSLAData={this.props.updateSLAData} topologyView={this.props.topologyView} />
            </div>
          )
  }
}
