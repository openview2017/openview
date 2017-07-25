import React from 'react'
import { ButtonArea, HintField } from './Util'
import NewAppStore from '../../stores/NewAppStore'
import HttpUtil from '../../utils/http'

/**
* Demand profile
**/
class DemandProfile extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);

		this.state = {
			selection: NewAppStore.getSelectedDPId()

		}

	    this.handleChange = this.onChange.bind(this);
		this.profiles = [];
		this.result = {}
	}

	/**
	*onchange event
	**/
	onChange(ev) {
		NewAppStore.isMatrixEmpty = true;
		NewAppStore.initDone = false;
		this.setState({ selection: parseInt(ev.target.value) });
		this.props.loadProfile(ev.target.value);
		this.props.updateSeletedConfigurationDetail();
	}

	componentWillUpdate () {
		var step = NewAppStore.getSelectedStep();
		if (step.id<5){
			this.isLoaded = false;
			return;
		}
		let newTopologyViewData = NewAppStore.getTopologyViewData();
		if (this.isLoaded || newTopologyViewData==undefined || newTopologyViewData.rawData==undefined || newTopologyViewData.rawData.app_dmdProfile==undefined) {
			return;
		}
		this.isLoaded = true;
		this.profiles = newTopologyViewData.rawData.app_dmdProfile;
		this.setState({selection: NewAppStore.getSelectedDPId()});
	}
	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {

		return (
			<div className="wrap-area with-margin select-demand-profile">
				<div className="title-box">
					<label className="offset-label">1. Select Demand Profile</label>
				</div>
				<div className="form-post row profileList" data-radio-tab="true">
					{

						this.profiles.map ( function (profile, idx) {
							//console.log("selection="+(this.state.selection)+ " profile.id="+profile.id+" cc=" +(profile.id === this.state.selection)+" "+isNaN(this.state.selection)+" "+isNaN(profile.id))
							let id = "profile_"+profile.id
							//console.log("id="+profile.id +" "+(profile.id === this.state.selection))
	                        return (
	                        	<div className="line">
        							<input type="radio" value={profile.id} id={id} name="options" checked={profile.id === this.state.selection} onChange={this.handleChange} data-tab="#profile-tab-1" />
        							<label className="font-small" htmlFor="summit">{profile.name}</label>
        							<div className="holder-cols alter d_plans">
        								<div className="dp_duration_region">
        									<span className="dp_title">Duration:</span><span>{profile.load_duration}</span>&nbsp;
        									<span className="dp_title">Regions:</span><span>2</span>
        								</div>
        								<div>
        									<span style={{fontStyle:"italic"}}>{profile.description}</span>
        								</div>
        							</div>
        						</div>
	                            )
	                    }, this)
					}
					<HintField
						name="Demand Profiles"
						message="Demand Profile is designed to load test functional behavior and measure performance."
					/>
				</div>
			</div>
		)
	}
}

/**
* Runs
**/
class Runs extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);

		this.state = {
			selectionRun: "run-3"
		}

		this.isSelected = false;
	    this.handleChangeRun = this.onChangeRun.bind(this);
		this.getGraphWidth = this.getGraphWidth.bind(this);
		NewAppStore.isMatrixEmpty = true;
	}

	/**
	* onchangeRun event
	**/
	onChangeRun(ev) {
		this.isSelected = true;
		NewAppStore.selectedConfig = NewAppStore.configMap[ev.target.value];
		this.props.updateSeletedConfigurationDetail();

	}

	/**
	* getGraphWidth
	**/
    getGraphWidth(sla, val, maxWidth) {
        sla = parseFloat(sla);
        val = parseFloat(val);
        let num = Math.floor((val /  maxWidth)*100);
        if(num < 1) {
            num = 0;
        }else if(num > 80){
            num = 80;
        }
        return num;
    }

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		let self = this;
		let  autoPlanItems = "";
		let autoPlanLength = 0;
		let col1Width = 90;
		var mw = $("#profile-tab-auto").width()-col1Width;

		if(typeof self.props.autoPlans != "undefined" && typeof self.props.autoPlans === "object"){
			autoPlanLength = self.props.autoPlans.length;
			autoPlanItems = self.props.autoPlans.map(function (plan, key) {

				if(plan.sla_result !== undefined) {
					let id = "price" + (key+1);
					let tab = "#detail-tab-" + (key + 1);
					let val = "run-"+ (key+1);
					let display = {display:"none"};
					let color = {color:"#5bd2da"};

					if (NewAppStore.isMatrixEmpty) {
						NewAppStore.selectedConfig = plan;
						self.state.selectionRun = val;
						self.autoSelected = true;
					}
					if (NewAppStore.configMap==undefined) {
						NewAppStore.configMap = {};
						NewAppStore.isMatrixEmpty = true;

					}
					NewAppStore.configMap[val] = plan;


			      	return (
			      		<div key={key} style={display} className="auto-plans two-cols" data-cost={plan.sla_result.cost} data-latency={plan.sla_result.latency} data-error={plan.sla_result.error_rate}>
							<div className="col" style={{width:col1Width}}>
								<input type="radio" id={val+"_radio"} name="prices" onChange={self.handleChangeRun} data-tab={tab} value={val} />
								<label className="font-large" htmlFor={id}>{self.props.sla.currency_display}{plan.sla_result.cost}<span className="description">est. / mo</span> </label>
							</div>
							<div className="col col2">
								<div className="bar">
									<strong className="strong" style={color}>openview</strong>
								</div>
								<div className="progress-line">
									<span className="progress-bar green" style={{maxWidth:self.getGraphWidth(self.props.sla.cost,plan.sla_result.cost, mw) + "%"}}></span>
									<span className="properties">{self.props.sla.currency_display}{plan.sla_result.cost} / mo</span>
								</div>
								<div className="progress-line">
									<span className="progress-bar orange" style={{maxWidth:self.getGraphWidth(self.props.sla.latency,plan.sla_result.latency, mw) + "%"}}></span>
									<span className="properties">{plan.sla_result.latency} ms</span>
								</div>
								<div className="progress-line">
									<span className="progress-bar red" style={{maxWidth:self.getGraphWidth(self.props.sla.error_rate,plan.sla_result.error_rate, mw) + "%"}}></span>
									<span className="properties">{plan.sla_result.error_rate}%</span>
								</div>
							</div>
						</div>
			      	)
		      	} else {
		      		return false;
		      	}

		    })

		}

		let  manualPlanItems = "";
		if(typeof self.props.manualPlans != "undefined" && typeof self.props.manualPlans === "object"){
			autoPlanLength++;
			manualPlanItems = self.props.manualPlans.map(function (plan, key) {

				if(plan.sla_result !== undefined) {

					let id = "price" + (key + autoPlanLength);
					let tab = "#detail-tab-" + (key + autoPlanLength);
					let val = "run-"+ (key + autoPlanLength);

					if (NewAppStore.isMatrixEmpty) {
						NewAppStore.selectedConfig = plan;
						self.state.selectionRun = val;
					}

					if (NewAppStore.configMap==undefined) {
						NewAppStore.configMap = {};
						NewAppStore.isMatrixEmpty = true;

					}
					NewAppStore.configMap[val] = plan;

			      	return (
			      		<div className="manual-plans two-cols" key={key + autoPlanLength} data-cost={plan.sla_result.cost} data-latency={plan.sla_result.latency} data-error={plan.sla_result.error_rate}>
							<div className="col">
								<input type="radio" id={val+"_radio"} name="prices" onChange={self.handleChangeRun} data-tab={tab} value={val} />
								<label className="font-large" htmlFor={id}>{self.props.sla.currency_display}{plan.sla_result.cost} <span className="description">est. / mo</span> </label>
							</div>
							<div className="col col2">
								<div className="bar">
									<strong className="strong">{plan.name}</strong>
								</div>
								<div className="progress-line">
									<span className="progress-bar green" style={{maxWidth:self.getGraphWidth(self.props.sla.cost,plan.sla_result.cost, mw) + "%"}}></span>
									<span className="properties">{self.props.sla.currency_display}{plan.sla_result.cost} / mo</span>
								</div>
								<div className="progress-line">
									<span className="progress-bar orange" style={{maxWidth:self.getGraphWidth(self.props.sla.latency,plan.sla_result.latency, mw) + "%"}}></span>
									<span className="properties">{plan.sla_result.latency} ms</span>
								</div>
								<div className="progress-line">
									<span className="progress-bar red" style={{maxWidth:self.getGraphWidth(self.props.sla.error_rate,plan.sla_result.error_rate, mw) + "%"}}></span>
									<span className="properties">{plan.sla_result.error_rate}%</span>
								</div>
							</div>
						</div>
			      	)
		      	} else {
		      		return false;
		      	}

		    })
		}


		return(
			<div className="line" data-tab-holder data-radio-tab="true">
				<div id="profile-tab-auto" className="auto-plans-metrics">
					{autoPlanItems}
				</div>
				<div id="profile-tab-manual" className="manual-plans-metrics">
					{manualPlanItems}
				</div>
			</div>
		)
	}

	/**
	* componentDidUpdate
	**/
	componentDidUpdate() {
		var step = NewAppStore.getSelectedStep();
		if (step.id<5){
			return;
		}

        let element = document.querySelector(".auto-plans-metrics [data-cost='" + Math.min.apply(Math, this.props.costList) + "']");
		if (element) element.style.display = 'block';

	    var tabs = document.querySelectorAll(".cloud-configuration ["+DATATAB.defaults.attrb+"]");
	    this.props.callSort("profile-tab-auto", "auto-plans", this.props.costList_a, this.props.latencyList_a, this.props.errorList_a);
	    this.props.callSort("profile-tab-manual", "auto-manual", this.props.costList_m, this.props.latencyList_m, this.props.errorList_m);
		//??DATATAB.event.init(tabs)
	    if (!self.autoSelected && this.isSelected===false) {
	    	let $r = $("#"+this.state.selectionRun+"_radio");
	    	if ($r.length>0) {
	    		$r.attr('checked',true);
		    	let val = $r.attr("value")
		    	NewAppStore.selectedConfig = NewAppStore.configMap[val];
	    	}

	    }
	}
	componentDidMount() {
	    this.props.onRef(this)
	}
	componentWillUnmount() {
		this.props.onRef(undefined)
	}

}

/**
* DryPerformanceMetricSort
**/
class DryPerformanceMetricSort extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);

		this.state = {
			value: '1'
		}
	    this.handleChangePerformance = this.onChangePerformance.bind(this);
	    this.doSort = this.doSort.bind(this);
	    this.doSortExported = function(elID, dc, costList, latencyList, errorList) {
			this.doSort(this.state.value, elID, dc, costList, latencyList, errorList)
		}
	}

	/**
	* onChangePerformance event
	**/
	onChangePerformance(ev) {
		NewAppStore.isMatrixEmpty = true;
		this.setState({ value: ev.target.value });

		if(typeof this.props.autoPlans != "undefined" && typeof this.props.autoPlans === "object"){
			this.doSort(ev.target.value, "profile-tab-auto", "auto-plans", this.props.costList_a, this.props.latencyList_a, this.props.errorList_a);

		}
		if(typeof this.props.manualPlans != "undefined" && typeof this.props.manualPlans === "object"){
			this.doSort(ev.target.value, "profile-tab-manual", "manual-plans", this.props.costList_m, this.props.latencyList_m, this.props.errorList_m);
		}
		this.props.updateSeletedConfigurationDetail();
	}



	/**
	* doSort
	**/
	doSort(id, elID, dc, costList, latencyList, errorList) {
		//console.log(this.props);

		var elements = document.getElementById(elID).querySelectorAll('.'+dc);
		if (elID=="profile-tab-manual") {

		} else {
			for (var i = 0; i < elements.length; i++){

		        elements[i].style.display = 'none';
		    }
		}

		var divs = [];
		if (elID=="profile-tab-manual") {
			var elems = document.getElementById(elID).querySelectorAll('.manual-plans');
			for(var i = 0; i < elems.length; i++) {
				divs.push(elems[i]);
				elems[i].parentNode.removeChild(elems[i]);
			}
		}

		switch(parseInt(id)) {
			case 1:
				//console.log(">> sorting lowest cost");
				if (elID=="profile-tab-auto") {
					let elm = document.querySelector("."+dc+"[data-cost='" + Math.min.apply(Math, costList) + "']");
					if (elm!=null) {
						elm.style.display = 'block';
					}

				} else {
					divs.sort(function(a, b) {
				        //return a.dataset.cost.localeCompare(b.dataset.cost);
				        return +a.dataset.cost - +b.dataset.cost;
				    });
				}



				break;
			case 2:
				//console.log(">> sorting lowest latency");
				if (elID=="profile-tab-auto") {
					let elm = document.querySelector("."+dc+"[data-latency='" + Math.min.apply(Math, latencyList) + "']");
					if (elm!=null) {
						elm.style.display = 'block';
					}
				} else {
					divs.sort(function(a, b) {
				        //return a.dataset.latency.localeCompare(b.dataset.latency);
				        return +a.dataset.latency - +b.dataset.latency;
				    });
				}




				break;
			case 3:
				//console.log(">> sorting lowest error rate");
				if (elID=="profile-tab-auto") {
					let elm = document.querySelector("."+dc+"[data-error='" + Math.min.apply(Math, errorList) + "']");
					if (elm!=null) {
						elm.style.display = 'block';
					}
				} else {
					divs.sort(function(a, b) {
				        //return a.dataset.error.localeCompare(b.dataset.error);
				        return +a.dataset.error - +b.dataset.error;
				    });
				}




				break;
		}
		if (elID=="profile-tab-manual") {
			divs.forEach(function(el) {
		        document.getElementById(elID).appendChild(el);
		    });
		}


	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {

		var performanceMetricList = ['Lowest Cost', 'Lowest Latency', 'Lowest Error Rate'].map(function(metric, index){
			var val = parseInt(index) + 1;
			return <option key={index} value={val}>{metric}</option>
		})

		return(
			<select name="price" id="dry-run-performance-metrics" onChange={this.handleChangePerformance} value={this.state.value}>
				{ performanceMetricList }
			</select>
		)
	}


	componentWillUpdate() {
		var step = NewAppStore.getSelectedStep();
		if (step.id<5 || NewAppStore.initDone){
			this.initDone = false;
			return;
		}
		NewAppStore.initDone = true;
		if(typeof this.props.autoPlans != "undefined" && typeof this.props.autoPlans === "object"){
			this.doSort(1, "profile-tab-auto", "auto-plans", this.props.costList_a, this.props.latencyList_a, this.props.errorList_a);

		}
		if(typeof this.props.manualPlans != "undefined" && typeof this.props.manualPlans === "object"){
			this.doSort(1, "profile-tab-manual", "manual-plans", this.props.costList_m, this.props.latencyList_m, this.props.errorList_m);
		}
	}
	componentDidMount() {
	    this.props.onRef(this)
	}
	componentWillUnmount() {
		this.props.onRef(undefined)
	}
}

/**
* DryPerformanceMetrics
**/
class DryPerformanceMetrics extends React.Component {
	/**
	* constructor
	**/
	constructor(props) {
		super(props);

	    this.callSort = this.callSort.bind(this);
	}
	callSort(elID, dc, costList, latencyList, errorList) {
		if (this.dryPerformanceMetricSort==undefined){
			return;
		}
		this.dryPerformanceMetricSort.doSortExported(elID, dc, costList, latencyList, errorList);
	}

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		var self = this;
		return (
			<div className="wrap-area with-margin compare-performance-metrics">
				<div className="title-box">
					<label className="alter">2. Compare Dry Run Performance Metrics</label>
					<DryPerformanceMetricSort updateSeletedConfigurationDetail={this.props.updateSeletedConfigurationDetail} onRef={ref => (self.dryPerformanceMetricSort = ref)} manualPlans={this.props.manualPlans} autoPlans={this.props.autoPlans}  costList_a={this.props.costList_a} latencyList_a={this.props.latencyList_a} errorList_a={this.props.errorList_a} costList_m={this.props.costList_m} latencyList_m={this.props.latencyList_m} errorList_m={this.props.errorList_m}  sla={this.props.sla}/>
				</div>
				<div className="form-post row">
					<Runs onRef={ref => (self.run = ref)} callSort={self.callSort} updateSeletedConfigurationDetail={this.props.updateSeletedConfigurationDetail} manualPlans={this.props.manualPlans} autoPlans={this.props.autoPlans} costList_a={this.props.costList_a} latencyList_a={this.props.latencyList_a} errorList_a={this.props.errorList_a} costList_m={this.props.costList_m} latencyList_m={this.props.latencyList_m} errorList_m={this.props.errorList_m}  sla={this.props.sla}/>
					<HintField
						name="Dry Run Performance"
						message="Sort and compare your dry runs. By default, dry runs will be sorted by price."
					/>
				</div>
			</div>
		)
	}
}

/**
* SelectedConfigurationDetail
**/
class SeletedConfigurationDetail extends React.Component {
	/**
	* constructor
	**/
	constructor(props) {
		super(props);

		this.state = {
			selection: NewAppStore.selectedConfig

		}

	}
	refresh() {
		this.setState({selection: NewAppStore.selectedConfig});
	}

	reset() {
		NewAppStore.resetConfig = true;
	}

	componentDidMount() {
	    this.props.onRef(this)
	}
	componentWillUnmount() {
		this.props.onRef(undefined)
		NewAppStore.selectedConfig = null;
	}



	render() {
		if (NewAppStore.resetConfig!==undefined) {
			NewAppStore.resetConfig = undefined;
			return false;
		}
		let config = NewAppStore.selectedConfig;
		if (config==undefined) {
			return false;
		}
		let mem_limit = 0;
		let cpu_quota = 0;
		let pods = 0;
		let containers = 0;
		var cs = config.SetConfigs;
		for (var i=0; i<cs.length; i++) {
			var cf=cs[i];
			var cc = cf.podConfig.containersConfig;
			pods += cf.replicas;
			containers += Object.keys(cc).length*cf.replicas;

			var cpu = 0;
			var mem = 0;
			for (var c in cc) {
				var ccc =cc[c];

				mem += Math.round(parseInt(ccc.mem_limit)/1048576);
				cpu += parseInt(ccc.cpu_quota);
			}
			cpu_quota += cpu*cf.replicas;
			mem_limit += mem*cf.replicas;
		}
		return (
			<div className="wrap-area with-margin">
				<div className="title-box">
					<label className="offset-label">3. Configuration Summary</label>
				</div>
				<div data-tab-holder>
					<div id="detail-tab-1">
						<div className="col-area">
							<div className="col">
								<strong className="title">{pods}</strong>
								<p>Pods</p>
							</div>
							<div className="col">
								<strong className="title">{containers}</strong>
								<p>Containers</p>
							</div>
							<div className="col">
								<strong className="title">{parseFloat(cpu_quota/1000000).toFixed(2)}</strong>
								<p>CPU (cores)</p>
							</div>
							<div className="col">
								<strong className="title">{Math.round(mem_limit)}</strong>
								<p>Memory (MB)</p>
							</div>

							<div className="col">
								<strong className="title">{this.props.sla.currency_display}{parseFloat(NewAppStore.selectedConfig.sla_result.cost).toFixed(2)}</strong>
								<p>Monthly Cost</p>
							</div>
						</div>
						<div className="row">
							<div id="CSContainer" className="line">
								{
									cs.map ( function (cf, idx) {
										var cc = cf.podConfig.containersConfig;
										var list = [];
										for (var ii in cc) {
											list.push([cc[ii], cf.replicas]);
										}
										return (
											<div className="csItem">
												<span>Name: <strong className="title"> {cf.name}</strong></span> <span>Replicas: <strong className="title">{cf.replicas} </strong></span>
												<table className="main-table configuration-detail align-left text-center full-width margin">
												<tbody>
													<tr>
														<th>Container Name</th>
														<th>CPU (cores)</th>
														<th>Memory (MB)</th>
													</tr>
													{
														list.map ( function (c, idx) {
															let cc = c[0];
															let replicas = c[1];
															return (
																<tr>
																	<td>{cf.name}</td>
																	<td>{parseFloat(replicas*cc.cpu_quota/1000000).toFixed(2)}</td>
																	<td>{Math.round(replicas*cc.mem_limit/1048576)}</td>
																</tr>
														    )
														})
													}
												</tbody>
												</table>
												<hr/><br/>
											</div>
									    )
									})
								}
							</div>

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
class Content extends React.Component {
	/**
	* constructor
	**/
	constructor(props) {
		super(props);
		var self = this;
		this.updateSeletedConfigurationDetail = function () {
			self.seletedConfigurationDetail.refresh();
		}
		this.reset = function() {
			self.seletedConfigurationDetail.reset();
		}

	}



	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		var self = this;
		return (
			<div className="newapp-slide-content">
				<div className="demand-form">
					<DemandProfile updateSeletedConfigurationDetail={this.updateSeletedConfigurationDetail} plans={this.props.plans} loadProfile={this.props.loadProfile}/>
					<DryPerformanceMetrics updateSeletedConfigurationDetail={this.updateSeletedConfigurationDetail} manualPlans={this.props.plans.manualPlans} autoPlans={this.props.plans.autoPlans} costList_a={this.props.plans.costList_a} latencyList_a={this.props.plans.latencyList_a} errorList_a={this.props.plans.errorList_a} costList_m={this.props.plans.costList_m} latencyList_m={this.props.plans.latencyList_m} errorList_m={this.props.plans.errorList_m} sla={this.props.plans.sla}/>
					<SeletedConfigurationDetail onRef={ref => (self.seletedConfigurationDetail = ref)} sla={this.props.plans.sla}/>
				</div>
			</div>
		)
	}

	componentDidMount() {
	    this.props.onRef(this)
	}
	componentWillUnmount() {
		this.props.onRef(undefined)
	}
}

/**
* DeploymentConfiguration
**/
export default class DeploymentConfigurations extends React.Component {

	/**
	* constructor
	**/
	constructor(props) {
		super(props);
		var self = this;

		this.state = {
				plans: this.props.plans

		}

		this.loadProfile = function(id) {
			//self.props.parent.loadProfile(id, function(_plans) {
			//	self.setState({plans:_plans});
			//})

			//console.log("appId="+NewAppStore.getAppID()+" getSelectedDPId()="+id)
			if (NewAppStore.getAppID()===undefined) {
				return;
			}

			if(id == -1 && this.props.topologyView.rawData.app_dmdProfile.length > 0){
                let plan = this.props.topologyView.rawData.app_dmdProfile[0];
				NewAppStore.setSelectedDPId(plan.id);
				id = plan.id;
			}

			HttpUtil.getAllPlansResult(NewAppStore.getAppID(),id).then(function(data){
				if (data.profileState<2) {
					self.content.reset();
				}
				self.setState({plans:data});
			});

		}
	}

	componentWillUpdate() {
		var step = NewAppStore.getSelectedStep();
		if (step.id<5){
			this.isLoaded = false;
			return;
		}
		if (NewAppStore.getSelectedDPId()==0 || this.isLoaded) {
			return;
		}
		this.isLoaded = true;
		this.loadProfile(NewAppStore.getSelectedDPId())
	}
	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		var self = this;
		if (this.state) {
			return (
		    		<div className="application-data cloud-configuration">
			        	<ButtonArea title="Deloyment Configurations" icon="icon-cloud"/>
			        	<Content plans={self.state.plans} loadProfile={this.loadProfile} onRef={ref => (self.content = ref)}/>
			        </div>
		    	)
		} else {
			return false;
		}

  	}
}
