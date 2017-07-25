import React from 'react'
import { Link } from 'react-router'
import { ButtonArea } from './Util'
import Slider from 'react-slick'
import NewAppStore from '../../stores/NewAppStore'
import * as NewAppActions from '../../actions/NewAppActions'
import axios from 'axios'
import HttpUtil from '../../utils/http'
import { ModalPopup } from '../../components/Popup.js'
import Select, { Option } from 'rc-select';


/**
* SectionAddPlan
**/
class SectionAddPlan extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);
		this.handleChange = this.onChange.bind(this);
        this.state = {setSelectedDPId: ""};
	}

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.setSelectedDPId !== nextState.setSelectedDPId) {
            this.setState({setSelectedDPId: nextState.setSelectedDPId});
            return true;
        }
        if ( Array.isArray(nextProps.demandProfileList) && nextProps.demandProfileList.length > 0 && NewAppStore.getSelectedDPId() !== this.state.setSelectedDPId ) {
            this.setState({setSelectedDPId: nextProps.demandProfileList[0].id});
        }
        return true;
    }

	/**
	* onChange event
	**/
	onChange(value) {
        NewAppStore.setSelectedDPId(Number(value));
		this.setState({setSelectedDPId:value});
	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		let planList = [];
		let planDescList = [];

		this.props.demandProfileList.forEach((function(plan, index){
			var val = plan.id;
			//planList.push(<option key={index} value={val} data-tab={'#select-tab-' + val}>{plan.name}</option>);
            planList.push(<Option key={index} value={val} text={plan.name} data-tab={'#select-tab-' + val}>{plan.name}</Option>);
			planDescList.push(
				<div className={"holder-cols d_plans" + (this.props.selectedDPId === val ? "" : " js-tab-hidden")} id={"select-tab-" + val}>
					<div className="dp_duration_region">
						<span className="dp_title">Duration:</span><span>{Number(plan.load_duration) / 60} min</span>&nbsp;
						{/*<span className="dp_title">Regions:</span><span>2</span>*/}
					</div>
					<div>
						<span style={{fontStyle:"italic"}}>{plan.description}</span>
					</div>
				</div>
			);
		}).bind(this));

		return (
			<div>
				<div className="box">
                    <Select
                        value={ this.state.setSelectedDPId }
                        style={{ fontSize:"12px", width:"200px", backgroundColor:"#5e626a", color:"#ffffff", marginRight:"5px" }}
                        animation="slide-up"
                        showSearch={false}
                        onChange={this.handleChange}
                        optionLabelProp="text"
                    >
                        { planList }
                    </Select>
					<a onClick={this.props.addPlan} className="btn-default">Add Plan</a>
				</div>
				<div className="same-cols">
					<div data-tab-holder="true">
						{ planDescList }
					</div>
				</div>
			</div>
		)
	}
}

/**
* SectionPerformanceMetrics
**/
class SectionPerformanceMetrics extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);

		this.handleOnclick = this.onClick.bind(this);
	}

	/**
	* onClick event
	**/
	onClick(ev) {
		ev.persist();

		var elements = document.querySelectorAll('.openview_plans')

	    for (var i = 0; i < elements.length; i++){
	        elements[i].style.display = 'none';
	    }

		switch(ev.target.id){
			case 'cost-selector':
				let dataCost = this.props && Array.isArray(this.props.costList) &&  this.props.costList.length > 0 ? Math.min.apply(Math, this.props.costList) : 0;
				document.querySelector(".openview [data-cost='" + dataCost + "']").style.display = 'block';
				break;
			case 'latency-selector':
				let dataLatency = this.props && Array.isArray(this.props.latencyList) &&  this.props.latencyList.length > 0 ? Math.min.apply(Math, this.props.latencyList) : 0;
				document.querySelector(".openview [data-latency='" + dataLatency + "']").style.display = 'block';
				break;
			case 'error-rate-selector':
				let dataError = this.props && Array.isArray(this.props.errorList) &&  this.props.errorList.length > 0 ? Math.min.apply(Math, this.props.errorList) : 0;
				document.querySelector(".openview [data-error='" + dataError + "']").style.display = 'block';
				break;
		}
	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		let style = {}
		if(!this.props.costList || !this.props.latencyList || !this.props.errorList || ( this.props.costList.length <= 1 && this.props.latencyList.length <= 1 && this.props.errorList.length <= 1)){
			style = {
                visibility: "hidden"
			}
		}
		return (
			<div className="box-switcher" style={style}>
				<p>Sort Performance Metrics By</p>
				<ul className="switch-list" data-graph="true">
					<li><Link id="cost-selector" to="" data-type="success" onClick={this.handleOnclick} className="success active">Cost</Link></li>
					<li><Link id="latency-selector" to="" data-type="warning" onClick={this.handleOnclick} className="warning">Latency</Link></li>
					<li><Link id="error-rate-selector" to="" data-type="dangers" onClick={this.handleOnclick} className="danger">Error Rate</Link></li>
				</ul>
			</div>
		)
	}
}

/**
* LeftTableData
**/
class LeftTableData extends React.Component {

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {

		let _this = this;
		let podItems = "";
		let locationItems = "";
		let kindsArray = {"StatefulSet": "Stateful Set", "replicationController": "Replication Controler", "pod": "Pod"};

		if(typeof this.props.pods != "undefined" && typeof this.props.pods === "object"){
			podItems = this.props.pods.map(function (pod, i) {
		      	return (
		      		<table key={"lpod"+i} className="main-table table-info pods width350">
						<thead>
							<tr><th>{pod.kind}: {pod.name}</th></tr>
							<tr className="pod-replica"><td>Pod Replicas</td></tr>
						</thead>
						{
							pod.containers.map(function(container, j){
								return (
									<tbody key={"lcontainer"+j}>
										<tr className="pod-container"><td>{container.selector}</td></tr>
										{
											container.attributes.map(function(attribute, k){
													if(attribute['selector'] == 'cpu_quota'){
														return (<tr className="pod-container-attribute" key={"lattribute"+k}><td>{attribute.display_name}(cores)</td></tr>);
													}else if(attribute['selector'] == 'mem_limit'){
														return (<tr className="pod-container-attribute" key={"lattribute"+k}><td>{attribute.display_name}(MB)</td></tr>);
													}else{
														return (<tr className="pod-container-attribute" key={"lattribute"+k}><td>{attribute.display_name}</td></tr>);
                                                    }

											})
										}
									</tbody>
								);
							})
						}
					</table>
		      	)
		    })
		}

		if(typeof this.props.locations != "undefined" && typeof this.props.locations === "object"){
			locationItems = this.props.locations.map(function (location, j) {
		      	return (
		      		<tr key={"location"+j}><td id={location.id}>{location.name}</td></tr>
		      	)
		    })
		}

		return (
			<div className="line">
				{podItems}
				<table className="main-table table-info pods width350">
					<tbody>
						<tr><th>Endpoint Locations</th></tr>
						{locationItems}
					</tbody>
				</table>
			</div>
		)
	}
}

/**
* ServiceData
**/
class ServicesData extends React.Component {

	constructor(props){
		super(props);
		this.canEdit = this.canEdit.bind(this);
	}

    updateConfig(container,key,times,evt) {

        if( this.props.auto || this.props.plan.status != 'CREATED' && !(this.props.plan.status == 'COMPLETED' && !this.props.plan.sla_result) ){
			return
        }
        var _this = this;
        var elem = evt.target;
        $("#update-config-modal").css("display", "block");

        var value = evt.target.dataset.val;
        $("#updatedConfigValue").val(value);
        let containerTmp = container;
        let planTmp = this.props.plan;

        var saveBtn = document.querySelector("#update-config-modal a.confirm");
        var fun = function() {
            elem.innerHTML = document.getElementById("updatedConfigValue").value;
            let val = document.getElementById("updatedConfigValue").value;
            val = $.trim(val);
            if(val.length == 0){
            	return;
			}
			if(key == 'replicas'){
            	val = Math.round(parseFloat(val)).toString();
			}
            if( typeof  containerTmp[key] == 'number' ){
                containerTmp[key] = Number(val) * times;
            }else{
                containerTmp[key] = val;
            }
            _this.props.manage.updatePlan(planTmp);
            saveBtn.removeEventListener('click',fun);
        };
        saveBtn.addEventListener("click", fun);
    }

    /*
    *
    * */
    updateLocation(k8s_endpoint_id){
        if(k8s_endpoint_id != this.props.plan.k8s_endpoint_id){
    		this.props.plan.k8s_endpoint_id = k8s_endpoint_id;
    		this.props.manage.updatePlan(this.props.plan);
		}
	}

	/*
	*
	* */
	canEdit(){
		return  !this.props.auto && (this.props.plan.status === 'CREATED' || this.props.plan.status === 'STOPPED'  || (this.props.plan.status == 'COMPLETED' && !this.props.plan.sla_result));
	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {

		let _this = this;
		let  podItems = "";
		let locationItems = "";
		let title = "";

		title = (_this.props.title == "openview") ? `<a style="color:#5bd2da">`+_this.props.title+`</a>`: _this.props.title;



		if(typeof this.props.pods != "undefined" && typeof this.props.pods === "object"){
			podItems = this.props.pods.map(function (pod, i) {

				if(!_this.props.plan.SetConfigs){
					return (
						<ul key={"pod"+i} className="plan-list">
							<li className="title" dangerouslySetInnerHTML={{__html: title}} />
							<li className="pod-replica"></li>
							{
                                pod.containers.map(function(container, j){
                                	return (
										<ul key={"container"+j}>
											<li className="pod-container"></li>
											{
                                                container.attributes.map(function(attribute, k){
													return(
														<li className="pod-container-attribute" key={"attribute"+k}>
															<a></a>
														</li>
													);
												})
											}
										</ul>
									);
								})
							}
						</ul>
					);
				}

				//mysql-set, nqinx, web, web-debug
				let config = null;
				let replicas = null;
				let detail = null;
				_this.props.plan.SetConfigs.some((config_detail) => {
					if (config_detail.name == pod.name) {
						config = config_detail.podConfig.containersConfig;
						replicas = config_detail.replicas;
						detail = config_detail;
						return true;
					}
				});


                if(!_this.canEdit()){

                    return (
						<ul key={"pod"+i} className="plan-list">
							<li className="title"data-val={_this.props.plan.name}  dangerouslySetInnerHTML={{__html: title}} />
							<li className="pod-replica">{Number(replicas)}</li>
                            {
                                pod.containers.map(function(container, j){
                                    //mysql, mysql-forwarder
                                    return (
										<ul key={"container"+j}>
											<li className="pod-container"></li>
                                            {
                                                container.attributes.map(function(attribute, k){
                                                    //cpu_quota, mem_limit
                                                    let value = "0";
                                                    if (config != null) {
                                                        value = config[container.selector][attribute.selector];
                                                    }
                                                    let times = 1000000;
                                                    if(attribute.selector == "cpu_quota") {
                                                        value = Math.floor(parseInt(value) / 10000)/ 100 ;
                                                    } else if (attribute.selector == "mem_limit") {
                                                        value = Math.floor(parseInt(value) / 1048576);
                                                        times = 1048576;
                                                    }
                                                    return (
														<li className="pod-container-attribute" key={"attribute"+k}>
															{value}
														</li>
                                                    )
                                                })
                                            }
										</ul>
                                    )
                                })
                            }
						</ul>
                    )
                }

		      	return (
		      		<ul key={"pod"+i} className="plan-list">
						<li className="title dp-title" ><a data-val={_this.props.plan.name}  onClick={_this.updateConfig.bind(_this,_this.props.plan,'name',1)} >{title}</a></li>
						<li className="pod-replica"><a href="javascript:;" data-val={Number(replicas)} onClick={_this.updateConfig.bind(_this,detail,'replicas',1)}>{Number(replicas)}</a></li>
						{
							pod.containers.map(function(container, j){
								//mysql, mysql-forwarder
								return (
									<ul key={"container"+j}>
									<li className="pod-container"></li>
									{
										container.attributes.map(function(attribute, k){
											//cpu_quota, mem_limit
											let value = "0";
											if (config != null) {
												value = config[container.selector][attribute.selector];
											}
											let times = 1000000;
											if(attribute.selector == "cpu_quota") {
												value = Math.floor(parseInt(value) / 10000)/ 100 ;
											} else if (attribute.selector == "mem_limit") {
												value = Math.floor(parseInt(value) / 1048576);
												times = 1048576;
											}
											return (
												<li className="pod-container-attribute" key={"attribute"+k}>
													<a href="javascript:;" data-val={value} onClick={_this.updateConfig.bind(_this,config[container.selector], attribute.selector,times)}>{value}</a>
												</li>
											)
										})
									}
									</ul>
								)
							})
						}
					</ul>
		      	)
		    })
		}

		if(typeof this.props.locations != "undefined" && typeof this.props.locations === "object"){
			locationItems = this.props.locations.map(function (location, i) {
				var checked = location.id == _this.props.plan.k8s_endpoint_id;
				if(_this.props.auto){
					if(_this.props.plan.SetConfigs && checked){
                        return  (<li key={i}><input name={_this.props.plan.id} value={location.id}  type="radio" defaultChecked={checked} disabled="disabled" /></li>);
					}else{
                        return (<li key={i}></li>);
					}

				}else{
					if(_this.props.plan.status != 'CREATED' && !(_this.props.plan.status == "COMPLETED" && !_this.props.plan.sla_result)){
						if(checked){
                            return  (<li key={i}><input name={_this.props.plan.plan_id} value={location.id} type="radio" defaultChecked={checked} disabled="disabled" /></li>);
                        }else{
                            return (<li key={i}></li>);
						}
					}else{
						return (<li key={i}><input name={_this.props.plan.plan_id} value={location.id} onClick={_this.updateLocation.bind(_this,location.id)} type="radio" defaultChecked={checked} disabled="" /></li>);
					}
				}
		    })
		}

		return (
			<div className="service-content">
				{podItems}
				<ul className="plan-list pod-location">
		      		<li className="title" dangerouslySetInnerHTML={{__html: title}} />
		      		{locationItems}
		      	</ul>
			</div>
		)
	}

	componentDidMount() {

	}
}

/**
* ManualPlanItem
**/
class ManualPlanItem extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);
		this.getGraphWidth = this.getGraphWidth.bind(this);
		this.runPlan = this.runPlan.bind(this);
		this.stopPlan = this.stopPlan.bind(this);
		this.state = {
			errMsg :'',
			showTip:false
		}
	}

	/*
	*
	* */
	runPlan(){
		this.props.manage.runPlan(this.props.plan["plan_id"]);
	}

	/*
	*
	* */
	stopPlan(){
        this.props.manage.stopPlan(this.props.plan["plan_id"]);
	}


    componentWillReceiveProps(nextProps){
		// if(nextProps.plan.error != this.state.errMsg){
		// 	if(!nextProps.plan.error || nextProps.plan.error.length() == 0){
		// 		this.setState({
         //            errMsg:''
		// 		})
		// 	}else{
         //        this.setState({
         //            errMsg:nextProps.plan.error,
		// 			showTip:true
         //        })
		// 		let _this = this;
		// 		setTimeout(function () {
		// 			_this.setState({
         //                showTip:false
		// 			});
         //        },1000);
		// 	}
		// }
	}

	/*
	*
	* */
	removePlan (idx, planid, e) {
		e.preventDefault();

        this.props.manage.deletePlan(idx);
	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		let tipStyle = '';
		let _this = this;
		let imageStyle = "margin:0px auto 20px; padding:0px;";
		let headerArea = "";
		let width = 0;
		let fun = null;
		let index = this.props.index;
		let isRunning = false;
		let menu = [];

		let stopItem = (<span className="menu-item" onClick={this.stopPlan}>Stop <a className="stop-icon"></a></span>);
		let restartItem = (<span className="menu-item" onClick={this.runPlan}>Restart <a className="restart-icon"></a></span>);
		let deleteItem = (<span className="menu-item" onClick={_this.removePlan.bind(_this, _this.props.index, _this.props.plan.id)} >Delete <a className="delete-icon"></a></span>);


		switch(this.props.plan.status){
			case 'ERROR':
                let message = this.props.plan.message ? this.props.plan.message : "" ;
                headerArea = `
						<div >
							<a class="btn-link tooltip">
								<span class="tooltiptext-inner error">
									<span class="title">Error</span>
									<span class="content">`+message+`</span>
								</span>
								<img class="icon" src="themes/openview/images/dryrun/dryrun-alert.png" height="44" width="43" style="`+imageStyle+`"  alt="Failed">
							</a>
						</div>` ;
                if(index != 0){
                    menu.push(deleteItem);
                }
                menu.push(restartItem);
                break;

			case 'COMPLETED':
				isRunning = false;
				if(this.props.costList[index] == -1 || this.props.latencyList[index] == -1 && this.props.plan.errorList[index] == -1){
					let message = this.props.plan.message ? this.props.plan.message : "" ;
                    headerArea = `
						<div >
							<a class="btn-link tooltip">
								<span class="tooltiptext-inner error">
									<span class="title">Error</span>
									<span class="content">`+message+`</span>
								</span>
								<img class="icon" src="themes/openview/images/dryrun/dryrun-alert.png" height="44" width="43" style="`+imageStyle+`"  alt="Failed">
							</a>
						</div>` ;
                    if(index != 0){
                        menu.push(deleteItem);
                    }
                    menu.push(restartItem);


                    fun = this.runPlan;
				}else{
                    var sla = this.props.sla;
                    var sla_r = this.props.plan.sla_result;
                    var costClass = sla.cost < sla_r.cost ? "violation" : "";
                    var latencyClass = sla.latency < sla_r.latency ? "violation" : "";
                    var errorClass = sla.error_rate < sla_r.error_rate ? "violation" : "";


					headerArea = `
							<div class="rotated-area">
								<ul class="switch-list">
									<li><a href="#" data-type="success" class="success active" style="width:`+this.getGraphWidth(this.props.sla.cost, this.props.plan.sla_result.cost)+`px"></a><span class="`+costClass+`" >`+this.props.sla.currency_display + this.props.plan.sla_result.cost.toString() +`</span></li>
									<li><a href="#" data-type="warning" class="warning" style="width:`+this.getGraphWidth(this.props.sla.latency, this.props.plan.sla_result.latency)+`px"></a><span class="`+latencyClass+`">`+this.props.plan.sla_result.latency+`ms</span></li>
									<li><a href="#" data-type="dangers" class="danger" style="width:`+this.getGraphWidth(this.props.sla.error_rate, this.props.plan.sla_result.error_rate)+`px"></a><span class="`+errorClass+`">`+this.props.plan.sla_result.error_rate+`%</span></li>
								</ul>
							</div>` ;
					if(index != 0){
                        menu.push(deleteItem);
                    }
				}

				break;

			case  'CREATED':
				isRunning = false;
                headerArea = `<div >
								<a  class="btn-link tooltip">
									<span class="tooltiptext-inner"> 
										<span class="title" > Ready </span>
									</span>
									<img src="themes/openview/images/dryrun/dryrun-start.png" height="44" width="43" style="`+imageStyle+`"  alt="Dry Run" >
								</a>
							</div>`;
				fun = this.runPlan;
                if(index != 0){
                    menu.push(deleteItem);
                }
                break;

            // case 'CREATED_LOCK':
            //     headerArea = `<div >
				// 				<a  class="btn-link tooltip">
				// 					<span class="tooltiptext-inner">
				// 						<span class="title" > Starting </span>
				// 					</span>
				// 					<img src="themes/openview/images/dryrun/dryrun-progress.gif" height="44" width="43" style="`+imageStyle+`"  alt="In Progress" >
				// 				</a>
				// 			</div>`;
            //     break;

			case 'STARTED':
			case 'IN_PROGRESS':
			case 'VALIDATING':
			case 'STARTING':
				isRunning = true;

				let tip = "In Progress";
				if(this.props.plan.status == 'VALIDATING'){
					tip = "Validating Bests";
				}else if(this.props.plan.status == 'IN_PROGRESS'){
                    tip = "Looking for Betters";
				}else if(this.props.plan.status == 'STARTING'){
                    tip = "Starting";
				}else if(this.props.plan.status == 'STARTED') {
        			tip = "Started";
				}

                headerArea = `<div >
								<a  class="btn-link tooltip">
									<span class="tooltiptext-inner"> 
										<span class="title" > `+tip+` </span>
									</span>
								
									<img src="themes/openview/images/dryrun/dryrun-progress.gif" height="44" width="43" style="`+imageStyle+`"  alt="In Progress" >
								</a>
							</div>`;
				menu.push(stopItem);
                break;

			case 'STOPPED':
                headerArea = `
						<div >
							<a class="btn-link tooltip">
								<span class="tooltiptext-inner"> 
									<span class="title" > Stopped </span>
								</span>
								<img class="icon" src="themes/openview/images/dryrun/dryrun-start.png" height="44" width="43" style="`+imageStyle+`"  alt="Failed">
							</a>
						</div>` ;
                 fun = this.runPlan;
                if(index != 0){
                    menu.push(deleteItem);
                }
                // menu.push(restartItem);
				break;
			default:
				console.log("error manual run status =========");
				break;
		}

		if(fun){
            return(
				<div id={this.props.plan.id} className="column dry-run dry-run-incomplete manual-plan" data-sort-run="1">
					<div className="area " onClick={fun}  dangerouslySetInnerHTML={{__html: headerArea}} />
					<ServicesData auto={false} manage={this.props.manage} title={this.props.title} pods={this.props.pods} plan={this.props.plan} locations={this.props.locations}/>
					<div className="menu-container">
                    {menu}
					</div>
					<span className="block-hover"></span>
				</div>
            )
		}else{
            return(
				<div id={this.props.plan.id} className="column dry-run dry-run-incomplete manual-plan" data-sort-run="1">
					<div className="area "  dangerouslySetInnerHTML={{__html: headerArea}} />
					<ServicesData auto={false} manage={this.props.manage} title={this.props.title} pods={this.props.pods} plan={this.props.plan} locations={this.props.locations}/>
					<div className="menu-container">
						{menu}
					</div>
					<span className="block-hover"></span>
				</div>
            )
		}

	}

	/**
	* getGraphWidth
	**/
	getGraphWidth(sla, val) {
		sla = parseFloat(sla);
		val = parseFloat(val);
		let num = Math.floor(val / sla * 80);
		if(num < 1) {
			num = 1;
		}else if(num > 100){
			num = 100;
		}
		return num;
	}

}

/**
* AutoPlanItem
**/
class AutoPlanItem extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);
		this.getGraphWidth = this.getGraphWidth.bind(this);
		this.runPlan = this.runPlan.bind(this);
		this.stopPlan = this.stopPlan.bind(this);
	}

	/*
	*
	* */
	runPlan(){
        this.props.manage.runPlan(this.props.plan["plan_id"]);
	}

	/*
	*
	* */
	stopPlan(){
        this.props.manage.stopPlan(this.props.plan["plan_id"]);
	}

	/**
	* componentDidMount
	**/
	componentDidMount() {
        if(Array.isArray(this.props.costList) &&  this.props.costList.length > 0){
            var elements = document.querySelectorAll('.openview_plans');
            for (var i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
		}

        let dataCost = this.props && Array.isArray(this.props.costList) &&  this.props.costList.length > 0 ? Math.min.apply(Math, this.props.costList) : 0;
        if(document.querySelector(".openview [data-cost='" + dataCost + "']")){
            document.querySelector(".openview [data-cost='" + dataCost + "']").style.display = 'block';
        }
	}

	/*
	*
	*
	* */
    componentDidUpdate(){
        if(Array.isArray(this.props.costList) &&  this.props.costList.length > 0){
            var elements = document.querySelectorAll('.openview_plans');
            for (var i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
        }
        let dataCost = this.props && Array.isArray(this.props.costList) &&  this.props.costList.length > 0 ? Math.min.apply(Math, this.props.costList) : 0;
        if(document.querySelector(".openview [data-cost='" + dataCost + "']")){
            document.querySelector(".openview [data-cost='" + dataCost + "']").style.display = 'block';
        }
	}


        /**
         * render
         * @return {ReactElement} markup
         */
        render() {
            let display = {
                display:'none'
            }

            let tipStyle = "color:#5bd2da;";
            let imageStyle = "margin:0px auto 20px";

            let headerArea = "";
            let fun = null;

            let menu = [];
			let stopItem = (<span className="menu-item" onClick={this.stopPlan.bind(this)}  >Stop <a className="stop-icon"></a> </span>);
            let restartItem = (<span className="menu-item" onClick={this.runPlan.bind(this)} >Restart <a className="restart-icon"></a> </span>);



            switch (this.props.plan.status){
                case 'CREATED':

                    headerArea = `<div >
					<span class="span"></span>
					<a class="btn-link tooltip">
						<span class="tooltiptext-inner"> 
							<span class="title" > Ready </span>
						</span>
						<img  src="themes/openview/images/dryrun/openview-start.png" height="44" width="44" style="`+imageStyle+`"  alt="Image Description">

					</a>
				</div>` ;
					fun = this.runPlan;
                    break;

                // case 'CREATED_LOCK':
                //     headerArea = `<div >
					// <span class="span"></span>
					// <a class="btn-link tooltip">
					// 	<span class="tooltiptext-inner">
					// 		<span class="title" > Starting </span>
					// 	</span>
					// 	<img  src="themes/openview/images/dryrun/openview-progress.gif" height="44" width="44" style="`+imageStyle+`"  alt="Image Description">
                //
					// </a>
					// </div>`;
                // 	break;
                case 'STARTING':
                case 'STARTED':
                case 'IN_PROGRESS':
                case 'VALIDATING':

                    let tip = "In Progress";
                    if(this.props.plan.status == 'VALIDATING'){
                        tip = "Validating";
                    }else if(this.props.plan.status == 'IN_PROGRESS'){
                        tip = "Optimizing";
                    }else if(this.props.plan.status == 'STARTING'){
                        tip = "Starting";
                    }else if(this.props.plan.status == 'STARTED') {
                        tip = "Searching";
                    }

                    if(this.props.plan.sla_result){
                        headerArea += `<div >
						<div class="rotated-area bar-plot-back ">
							<ul class="switch-list">
								<li><a href="javascript:void(0);"  data-type="success" class="success active" style="width:`+this.getGraphWidth(this.props.sla.cost,  this.props.plan.sla_result.cost)+`px"></a><span> `+this.props.sla.currency_display + this.props.plan.sla_result.cost.toString()+`</span></li>
								<li><a href="javascript:void(0);" data-type="warning" class="warning" style="width:`+this.getGraphWidth(this.props.sla.latency, this.props.plan.sla_result.latency)+`px"></a><span>`+this.props.plan.sla_result.latency+`ms</span></li>
								<li><a href="javascript:void(0);" data-type="dangers" class="danger" style="width:`+this.getGraphWidth(this.props.sla.error_rate, this.props.plan.sla_result.error_rate)+`px"></a><span>`+this.props.plan.sla_result.error_rate+`%</span></li>
							</ul>
						</div>
						</div>`;
                    }
                    headerArea += `
					<div class="front-progress">
						<span class="span"></span>
						<a class="btn-link ">
							<span class="tooltiptext-inner"> 
								<span class="title" >`+ tip+`  </span>
							</span>
							<img src="themes/openview/images/dryrun/openview-progress.gif" height="44" width="44" style="`+imageStyle+`" alt="Image Description">
						</a>
					</div>` ;

                    menu.push(stopItem);

                    break;

				case 'ERROR':
                    let message = this.props.plan.message ? this.props.plan.message : '' ;
                    headerArea = `
						<div >
							<span class="span"></span>
							<a class="btn-link tooltip">
								<span class="tooltiptext-inner error"> 
									<span class="title" >Error</span>
									<span class="content"> `+ message+`  </span>
								</span>
								
								<img src="themes/openview/images/dryrun/openview-alert.png" height="44" width="44" style="`+imageStyle+`" alt="start">
							</a>
						</div>`;
                    menu.push(restartItem);

					break;

                case 'COMPLETED':

                    if(this.props.costList.length == 0 && this.props.latencyList.length == 0 && this.props.errorList.length == 0){
                        // let tip = '';
                        // if(this.props.plan.status == 'STOPPED'){
                        //     tip = 'Stopped';
                        // }
                        // if(this.props.plan.sla_status == 'NO_DATA'){
                        //     tip = 'Check Demand Profile';
                        // } else{
                        //     tip = 'Check Application';
                        // }

                        let message = this.props.plan.message ? this.props.plan.message : '' ;
                        headerArea = `
						<div >
							<span class="span"></span>
							<a class="btn-link tooltip">
								<span class="tooltiptext-inner error"> 
									<span class="title" >Error</span>
									<span class="content"> `+ message+`  </span>
								</span>
								
								<img src="themes/openview/images/dryrun/openview-alert.png" height="44" width="44" style="`+imageStyle+`" alt="start">
							</a>
						</div>`;


                    }else{
                    	var sla = this.props.sla;
                    	var sla_r = this.props.plan.sla_result;
                    	var costClass = sla.cost < sla_r.cost ? "violation" : "";
                        var latencyClass = sla.latency < sla_r.latency ? "violation" : "";
                        var errorClass = sla.error_rate < sla_r.error_rate ? "violation" : "";

                        headerArea = `
						<div class="rotated-area">
							<ul class="switch-list">
								<li><a href="javascript:void(0);" data-type="success" class="success active" style="width:`+this.getGraphWidth(this.props.sla.cost,  this.props.plan.sla_result.cost)+`px"></a><span class="`+costClass+`"> `+this.props.sla.currency_display + this.props.plan.sla_result.cost.toString()+`</span></li>
								<li><a href="javascript:void(0);" data-type="warning" class="warning" style="width:`+this.getGraphWidth(this.props.sla.latency, this.props.plan.sla_result.latency)+`px"></a><span class="`+latencyClass+`">`+this.props.plan.sla_result.latency+`ms</span></li>
								<li><a href="javascript:void(0);" data-type="dangers" class="danger" style="width:`+this.getGraphWidth(this.props.sla.error_rate, this.props.plan.sla_result.error_rate)+`px"></a><span class=`+errorClass+`>`+this.props.plan.sla_result.error_rate+`%</span></li>
							</ul>
						</div>`;
                    }
                    menu.push(restartItem);
				break;

                case 'STOPPED':

                    headerArea = `
						<div >
							<span class="span"></span>
							<a class="btn-link tooltip">
								<span class="tooltiptext-inner"> 
									<span class="title" > Stopped </span>
								</span>
								
								<img src="themes/openview/images/dryrun/openview-start.png" height="44" width="44" style="`+imageStyle+`" alt="Image Description">
							</a>
						</div>`;
                    fun = this.runPlan;
                	break;

			default:
				console.log("error auto run status =======");
				break;

		}


		if(fun){
            return (
				<div id={this.props.plan.id} className="openview_plans" style={display}
					 data-cost={this.props.plan.sla_result && this.props.plan.sla_result.cost ? this.props.plan.sla_result.cost : 0}
					 data-latency={this.props.plan.sla_result && this.props.plan.sla_result.latency ? this.props.plan.sla_result.latency : 0}
					 data-error={this.props.plan.sla_result && this.props.plan.sla_result.error_rate ? this.props.plan.sla_result.error_rate : 0} >
					<div onClick={fun}  className="area " dangerouslySetInnerHTML={{__html: headerArea}} />
					<ServicesData auto={true} title={this.props.title} pods={this.props.pods} plan={this.props.plan} locations={this.props.locations}/>
					<div className="menu-container">
						{menu}
					</div>
					<span className="block-hover"></span>
				</div>
            )
		}else{
            return (
				<div id={this.props.plan.id} className="openview_plans" style={display}
					 data-cost={this.props.plan.sla_result && this.props.plan.sla_result.cost ? this.props.plan.sla_result.cost : 0}
					 data-latency={this.props.plan.sla_result && this.props.plan.sla_result.latency ? this.props.plan.sla_result.latency : 0}
					 data-error={this.props.plan.sla_result && this.props.plan.sla_result.error_rate ? this.props.plan.sla_result.error_rate : 0} >
					<div className="area " dangerouslySetInnerHTML={{__html: headerArea}} />
					<ServicesData auto={true} title={this.props.title} pods={this.props.pods} plan={this.props.plan} locations={this.props.locations}/>
					<div className="menu-container">
					{menu}
					</div>
					<span className="block-hover"></span>
				</div>
            )
		}


	}

	/**
	* getGraphWidth
	**/
    getGraphWidth(sla, val) {
        sla = parseFloat(sla);
        val = parseFloat(val);
        let num = Math.floor(val / sla * 80);
        if(num < 1) {
            num = 1;
        }else if(num > 100){
            num = 100;
        }
        return num;
    }
}

/**
* PrevButton
**/
class PrevButton extends React.Component {
    updateStep (event) {
        event.stopPropagation();
        event.preventDefault();
        if(this.props.onClick){
            this.props.onClick(event);
        }
    }
	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		return <button {...this.props} onClick={this.updateStep.bind(this)} >Prev</button>
	}
}

/**
* NextButton
**/
class NextButton extends React.Component {
    updateStep (event) {
        event.stopPropagation();
        event.preventDefault();
        if(this.props.onClick){
        	this.props.onClick(event);
		}
    }
	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
        let _self = this;
		return <button {...this.props}  onClick={this.updateStep.bind(this)}  >Next</button>

	}
}

/**
* Plans
**/
class Plans extends React.Component {
    constructor (props) {
        super(props);
    }

    componentDidMount () {
    }

    componentDidUpdate () {
    }


	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		let _this = this;
		const appSliderSettings = {
		    draggable: false,
			swipe: false,
			touchMove: true,
			accessibility: false,
			infinite: false,
			slidesToShow: 9,
			slidesToScroll: 1,
			speed: 0,
			centerPadding: '0px',
			nextArrow: <NextButton id="slick-next-arrow"/>,
      		prevArrow: <PrevButton id="slick-prev-arrow"/>,
			responsive: [
				{
					breakpoint: 1380,
					settings: { slidesToShow: 4 }
				},
				{
					breakpoint: 1520,
					settings: { slidesToShow: 5 }
				},
				{
					breakpoint: 1660,
					settings: { slidesToShow: 6 }
				},
				{
					breakpoint: 1800,
					settings: { slidesToShow: 7 }
				},
				{
					breakpoint: 1940,
					settings: { slidesToShow: 8 }
				},
				{
					breakpoint: 2180,
					settings: { slidesToShow: 9 }
				}
			]
    	};

		let autoPlanItems = "";
		let autoPlanLength = 0;
		if(typeof this.props.autoPlans != "undefined" && typeof this.props.autoPlans === "object"){
			autoPlanLength = this.props.autoPlans.length;
			autoPlanItems = this.props.autoPlans.map(function (autoPlan, i) {
		      	return (
		      		<AutoPlanItem sla={_this.props.data.sla} manage={_this.props.manage} index={i} key={"autoplan"+i} title="openview" plan={autoPlan} pods={_this.props.pods} locations={_this.props.locations} costList={_this.props.data.costList_a} latencyList={_this.props.data.latencyList_a} errorList={_this.props.data.errorList_a}/>
		      	);
		 	});
		}

		let  manualPlanItems = "";
		if(typeof this.props.manualPlans != "undefined" && typeof this.props.manualPlans === "object"){
			manualPlanItems = this.props.manualPlans.map(function (manualPlan, i) {
				let title = manualPlan.name;
				let key = i + autoPlanLength;
		      	return (
		      		<div key={"manual"+key}>
		      			<ManualPlanItem sla={_this.props.data.sla} manage={_this.props.manage} title={title} plan={manualPlan} pods={_this.props.pods} locations={_this.props.locations} costList={_this.props.data.costList_m} latencyList={_this.props.data.latencyList_m} errorList={_this.props.data.errorList_m} index={i} />
		      		</div>
		      	);
		    });
		}
		manualPlanItems.unshift((
			<div>
				<div className="column dry-run-incomplete openview" data-sort-run="1">
                    {autoPlanItems}
				</div>
			</div>
		));
		return (
		   	<Slider className="columns" ref="AppPlanSlider" {...appSliderSettings} >
		   		{manualPlanItems}
			</Slider>
		)
	}
}

/**
* Content
**/
class Content extends React.Component {

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {

		return (
			<div className="newapp-slide-content">
				<div className="demand-form">
					<div className="wrap-area with-margin alter">
						<div className="fixed-box">
							<div className="line-holder">
								<div className="box-left">
									<SectionAddPlan selectedDPId={this.props.plans.selectedDPId} addPlan={this.props.plans.deploymentManage.addPlan}  demandProfileList={this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.app_dmdProfile ? this.props.topologyView.rawData.app_dmdProfile : []} />
									<SectionPerformanceMetrics costList={this.props.plans.costList_a} latencyList={this.props.plans.latencyList_a} errorList={this.props.plans.errorList_a}/>
									<LeftTableData  pods={this.props.plans.pods} locations={this.props.plans.locations}/>
								</div>
							</div>
						</div>
						<div className="scrollable-section">
							<div className="mask">
								<Plans data={this.props.plans} manage={this.props.plans.deploymentManage}  pods={this.props.plans.pods} manualPlans={this.props.plans.manualPlans} autoPlans={this.props.plans.autoPlans} locations={this.props.plans.locations} />
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

/**
* DeploymentPlans
**/
export default class DeploymentPlans extends React.Component {

	constructor(props){
		super(props);
		this.state = {
            locations: [],
            pods: [],
            autoPlans: [],
            manualPlans: [],
			sla:{},
            deploymentManage:{
                addPlan:this.addDeploymentPlan.bind(this),
                deletePlan:this.deleteDeploymentPlan.bind(this),
                runPlan:this.runDeploymentPlan.bind(this),
                updatePlan:this.updateDeploymentPlan.bind(this),
				stopPlan:this.stopDeploymentPlan.bind(this)
            },
			confirmInfo:{
			},
            selectedDPId:-1
		}

		this.runingMap = {};
		this.updateLoop = null;
		this.stepChanged = this.stepChanged.bind(this);
		this.updateView = this.updateView.bind(this);

	}

	/*
	* update capacity plan
	* */
    updateView(){
        let _this = this;
        let appId = NewAppStore.getAppID();
        let dpId = NewAppStore.getSelectedDPId();
        this.setState({
            selectedDPId:dpId
		});
        HttpUtil.getAllPlansResult(appId,dpId,true).then(function(data){
        	_this.checkLoop([].concat( data.autoPlans).concat(data.manualPlans));
			_this.setState(
				data
			);
		});

	}

	/*
	*
	* */
	checkLoop(plans){
		let _this = this;
		if(plans.length > 0){
			plans.forEach(function(item){
				if(item.status != 'COMPLETED' && item.status != 'CREATED' && item.status != 'STOPPED' && item.status != 'ERROR'){
					_this.runingMap[item.plan_id] =  {};
				}
			})
		}

		this.props.capacityPlanUpdate(this.haveResult(plans));

		if(NewAppStore.selectedStepId != 4){
			return;
		}

		if(Object.keys(this.runingMap).length == 0 && this.updateLoop){
			clearInterval(this.updateLoop);
			this.updateLoop = null;
		}else if(Object.keys(this.runingMap).length != 0 && !this.updateLoop){
			this.updateLoop = setInterval(function(){
				_this.updatePlanResult();
			},10000);
		}
	}



	/*
	 *
	 * */
    addDeploymentPlan(){
        let _this = this;
        let item = this.state.manualPlans[this.state.manualPlans.length - 1];
        let tmpObj = this.resultToPlan(item);
        // tmpObj['name'] = 'plan_' + (+(new Date())).toString().substr(6);
		delete (tmpObj['name']);
        let appId = NewAppStore.getAppID();
        let dpId = NewAppStore.getSelectedDPId();
        HttpUtil.addCapacityPlan(appId,dpId,tmpObj).then(function(data){

            _this.state.manualPlans.push(_this.planToResult(data));
            _this.setState({'manualPlans':_this.state.manualPlans});
		});
    }

	/*
	 *resultToPlan
	 *
	 * */
    resultToPlan(result){
        let plan = {};
        plan['name'] = result['name'];
        plan['k8s_endpoint_id'] = result['k8s_endpoint_id'];
        plan['is_auto'] = result['is_auto'];
        plan['id'] = result['plan_id'];
        plan['SetConfigs'] = $.extend([],result['SetConfigs']);
        return plan;
    }

	/*
	 *
	 * */
    planToResult(plan){
        let result = $.extend({},plan);
        result.plan_id = result.id;
        return result;
    }

	/*
	 *
	 * */
    updateDeploymentPlan(plan){
        let _this = this;
        let data = this.resultToPlan(plan);
        data['is_auto'] = false;
        data['demand_profile_id'] = NewAppStore.getSelectedDPId();
        let appId = NewAppStore.getAppID();
        let dpId = NewAppStore.getSelectedDPId();
		let planId = plan['plan_id'];

		HttpUtil.updateCapacityPlan(appId,dpId,planId,data).then(function(data){
            let tmp =  _this.planToResult(data);
            let manual = _this.state.manualPlans;
            let index = -1;
            for (let i = 0; i < manual.length; i ++){
            	if(tmp.plan_id == manual[i].plan_id){
            		index = i;
            		break;
				}
			}
			if(index != -1){
                manual.splice(index,1,tmp);
                _this.setState({'manual':manual});
            }
		});

    }

	/*
	 *
	 * */
    runDeploymentPlan(plan_id){
		let appId = NewAppStore.getAppID();
		let dpId = NewAppStore.getSelectedDPId();
		let _this = this;
		let plans = this.state.autoPlans;
		let plan = null;
		plans.forEach(function (item) {
			if(item['plan_id'] ==  plan_id){
				plan = item;
			}
        })

		if(!plan){
			plans = this.state.manualPlans;
            plans.forEach(function (item) {
				if(item['plan_id'] == plan_id){
					plan = item;
				}
            })
		}


		let runFn = function () {
            plan.status = "STARTING";
            _this.setState(_this.state);
            _this.checkLoop(_this.state.autoPlans.concat(_this.state.manualPlans));
            HttpUtil.starPlan(appId,dpId,plan_id).then(function(data){
                _this.runingMap[plan_id] = {};
                _this.updatePlanResult();
            }).catch(function(){
                _this.runLock[plan_id] = false;
            });
        }
        if(plan.name == "openview"){
            let data = {
                title: "Confirm Run AutoRun Plan",
                bodyDesc: "It takes about 2-3 hours and $50 to finish the openview tuning. Do you really want to start?",
                saveBtn: "Yes",
                cancelBtn: 'No',
                saveChange: runFn.bind(this),
                hidInput:true
            }
            this.setState({confirmInfo:data});
            $("#confirm_box_modal").css("display", "block");
		}else{
        	runFn();
		}

    }

    /*
    *
    *
    * */
    updatePlanResult(){
    	let appId = NewAppStore.getAppID();
    	let dpId = NewAppStore.getSelectedDPId();
    	let _this = this;
    	HttpUtil.getAllPlansResult(appId,dpId,true).then(function(data){
    		_this.runingMap = {};
    		_this.checkLoop([].concat(data.autoPlans).concat(data.manualPlans));
            let state = $.extend({},data);
            _this.setState(
                state
            );
		});
	}




	/*
	 *
	 * */
    deleteDeploymentPlan(index){
    	let delFn = function(){
            let item = this.state.manualPlans[index];
            let appId  = NewAppStore.getAppID();
            let dpId = NewAppStore.getSelectedDPId();
            let _this = this;
            HttpUtil.deleteCapacityPlan(appId,dpId,item.plan_id).then(function(data){
                let manualPlans = _this.state.manualPlans;
                manualPlans.splice(index,1);
                _this.setState({'manualPlans':manualPlans});
            });
		}
		let data = {
            title: "Confirm Delete Plan",
            bodyDesc: "Do you really want to delete this plan?",
            saveBtn: "Yes",
            cancelBtn: 'No',
            saveChange: delFn.bind(this),
            hidInput:true
        }
        this.setState({confirmInfo:data});
        $("#confirm_box_modal").css("display", "block");
    }

    /*
    *
    *
    * */
    stopDeploymentPlan(planId){

    	let stopFn = function(){
            let _this = this;
            let appId = NewAppStore.getAppID();
            let dpId = NewAppStore.getSelectedDPId();
            HttpUtil.stopPlan(appId,dpId,planId).then(function(){
                if(_this.runingMap[planId]){
                    delete _this.runingMap[planId];
				}
                _this.updatePlanResult();
            })
		}

        let data = {
            title: "Confirm Stop Plan",
            bodyDesc: "Do you really want to stop this plan?",
            saveBtn: "Yes",
            cancelBtn: 'No',
            saveChange: stopFn.bind(this),
            hidInput:true
        }
        this.setState({confirmInfo:data});
        $("#confirm_box_modal").css("display", "block");
	}

	/*
	*
	*
	* */
	haveResult(data){
        for(let i = 0; i < data.length; i ++){
        	let item = data[i];
        	if(item.sla_result){
        		return true;
			}
		}
		return false;
	}

	/*
	*
	* */
	stepChanged(){
		if(NewAppStore.selectedStepId == 4){
            NewAppStore.on('profile_changed',this.updateView);
            if(this.props.topologyView.rawData.app_dmdProfile.length > 0){
				let plan = this.props.topologyView.rawData.app_dmdProfile[0];
				NewAppStore.setSelectedDPId(plan.id);
			}
		}else{
            NewAppStore.removeListener('profile_changed',this.updateView);

            // NewAppStore.setHasDryRunResult(false);
            this.props.capacityPlanUpdate(false);
            if(this.updateLoop != null){
            	clearInterval(this.updateLoop);
            	this.updateLoop = null;
            }
		}

	}

    /*
    *
    * */
	componentWillMount(){
        NewAppStore.on('chang_step',this.stepChanged);

	}

	/**
	* componentDidMount
	**/
	componentDidMount() {
		var tabs = document.querySelectorAll(".deployment-plans ["+DATATAB.defaults.attrb+"]");
		DATATAB.event.init(tabs,'select');
	}

	/*
	*
	* */
    componentWillUnmount(){
		NewAppStore.removeListener('chang_step',this.stepChanged);
	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
    	return (
    		<div className="application-data full-width-step deployment-plans">
	        	<ButtonArea icon="icon-layers-new" title="Deployment Plans" titleClass="new-application" />
	        	<Content plans={this.state} topologyView={this.props.topologyView} />
				<ModalPopup eleId="confirm_box_modal"
							title={this.state.confirmInfo.title}
							bodyDesc={this.state.confirmInfo.bodyDesc}
							saveBtn={this.state.confirmInfo.saveBtn}
							hidInput={true}
							cancelBtn={this.state.confirmInfo.cancelBtn}
							saveChange={this.state.confirmInfo.saveChange} />
	        </div>
    	)
  	}
}
