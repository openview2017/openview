import React from 'react'
import { Link } from 'react-router'
import { LeftSideBar } from './Util'
import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines'
import PerformanceMetricsStore from '../../stores/PerformanceMetricsStore'
import { finishEdit, editMetric, saveMetric, removeMetric, expandedView } from '../../actions/PerformanceMetricsActions'
import { PerformanceMetricsConstants } from '../../constants/PerformanceMetricsConstants'

/**
* PerformanceMetrics
*/
export default class PerformanceMetrics extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this._onChange = this._onChange.bind(this);
        this.state = PerformanceMetricsStore.getPerformanceMetricsData();
    }

    /**
    * _onChange
    * get store data upon store change
    */
    _onChange() {
        this.setState(PerformanceMetricsStore.getPerformanceMetricsData());
    }

	/**
    * render
    * @return {ReactElement} markup
    */
	render() {

        let rows = [];
        rows.push(<LeftSideBar key={-1} pageName='performance_metrics'/>);
        rows.push(<PerformanceMetricsContent key={-2} />);

        if(this.state.editing) {
            rows.push(<FindMetricsModal key={-3}/>);
        }

    	return (
    		<div>
                { rows }
            </div>
    	)
  	}

    /**
    * componentDidMount
    * add store change listener 
    */
    componentDidMount() {
        PerformanceMetricsStore.addChangeListener(this._onChange);
    }

    /**
    * componentWillUnmount
    * remove store change listener
    */
    componentWillUnmount() {
        PerformanceMetricsStore.removeChangeListener(this._onChange);
    }
}

/**
* MetricSearchFilters
* search metric filters
*/
export class MetricSearchFilters extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this.state = PerformanceMetricsStore.getPerformanceMetricsData();

        this._searchMetric = this._searchMetric.bind(this);
        this._saveMetric = this._saveMetric.bind(this);
    }

    /**
    * _searchMetric
    * search new metric
    */
    _searchMetric(e) {
        e.preventDefault();
        /**
        * TODO: search metrics functionality
        **/
        document.getElementById("find-metrics-modal").style.display = "none";
    }

    /**
    * _saveMetric
    * add new metric
    */
    _saveMetric(e) {
        e.preventDefault();

        var el = document.querySelectorAll('.metric_list_result input[type="checkbox"]:checked');
        for(var i = 0; i < el.length; i++) {
            saveMetric(PerformanceMetricsConstants.SAMPLE_METRIC_ITEM);
        }
        document.getElementById("find-metrics-modal").style.display = "none";
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let rows = [];

        if(this.state) {
            this.state.searchFilters.map((item, index) => {
                let inputType = [];
                if(item.type === "input") {
                    inputType.push(<input type="text" key={item.id} id={item.id}/>);
                } else if (item.type === "select") {
                    inputType.push(
                        <select key={item.id} id={item.id}>
                            <option>{item.default}</option>
                        </select>
                    );
                }
                rows.push(
                    <div key={index}>
                        <div className="filter">
                            <label htmlFor={item.id}>{item.name}</label>
                            {inputType}
                        </div>
                        <div className="separator"></div>
                    </div>
                );
            });
        }

        return (
            <div className="search_filter">
                {rows}
                <div className="filter">
                    <a href="javascript:;" className="search btn-default" onClick={this._searchMetric}>Search</a> &nbsp;
                    <a href="javascript:;" className="save btn-default" onClick={this._saveMetric}>Save</a>
                </div>
            </div>
        )
    }
}

/**
* MetricSearchResultList
* metric search result list
*/
export class MetricSearchResultList extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this.state = PerformanceMetricsStore.getPerformanceMetricsData();
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let rows = [];
        let count = 0;
        if(this.state) {
            count = this.state.searchItems.length;
            {
                this.state.searchItems.map((item, index) => {
                    rows.push(<tr key={index}>
                        <td className="display"><input type="checkbox" className="metric_item_chk"/></td>
                        <td>{item.namespace}</td>
                        <td>{item.name}</td>
                    </tr>);
                });
            }
        }
        return (
            <div className="metric_list_result">
                <div className="result_count">
                    <span>Results: </span><span>{count}</span>
                </div>
                <div className="results">
                    <table>
                        <thead>
                            <tr>
                                <th className="display">Display</th>
                                <th className="namespace">Namespace/Pod/Container</th>
                                <th>Metric Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            { rows }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

/**
* FindMetricsModal
* find metrics modal dialog
*/
export class FindMetricsModal extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this._closeModal = this._closeModal.bind(this);
    }

    /**
    * _closeModal
    * close modal dialog
    */
    _closeModal() {
        this.refs.findMetricsModal.style.display = "none";
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div id="find-metrics-modal" ref="findMetricsModal" className="modal">
                <div className="modal-content medium">
                    <div className="modal-header">
                        <span className="close" onClick={this._closeModal}>×</span>
                        <strong style={{fontSize:"14px",fontWeight:"normal"}}>Find Metrics</strong>
                    </div>
                    <div className="modal-body">
                        <MetricSearchFilters />
                        <MetricSearchResultList />
                    </div>
                </div>
            </div>
        )
    }
}

/**
* AddNewMetricBlock
* show add new metric block
*/
export class AddNewMetricBlock extends React.Component {

    /**
    * _showSearchMetricModal
    * show search metrics modal
    */
    _showSearchMetricModal() {
        var elModal = document.getElementById("find-metrics-modal");
        elModal.style.display = "block";
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <li className="add_new_metric" ref="add_new_metric">
                <div className="box_container">
                    <div className="box">
                        <span>+</span>
                        <span>Add Metric</span>
                    </div>
                </div>
            </li>
        )
    }

    /**
    * componentDidMount
    * add click event listener
    */
    componentDidMount() {
        this.refs.add_new_metric.addEventListener("click",this._showSearchMetricModal);
    }   

    /**
    * componentWillUnmount
    * remove click event listener
    */
    componentWillUnmount() {
        this.refs.add_new_metric.removeEventListener("click",this._showSearchMetricModal)
    }
}

/**
* MetricGraph
* metric graph
*/
export class MetricGraph extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this._delete = this._delete.bind(this);
        //this._expand = this._expand.bind(this);
    }

    /**
    * _delete
    * remove metric
    */
    _delete(ev) {

        ev.stopPropagation();

        removeMetric(this.props.index);
    }

    /**
    * _expand
    * show expanded view when clicking a metric
    */
    _expand(data,ev) {
        expandedView(true,data);
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let deleteButton = (this.props.editing) ? <a href="javascript:;" className="close" onClick={this._delete}>X</a> : "";
        return (
            <li id={this.props.id}>
                <div className="box_container">
                    <div className="box" onClick={this._expand.bind(this,this.props)}>
                        <h5>{this.props.title}</h5>
                        {deleteButton}
                        <div className="data_summary">{this.props.summary}</div>
                        <div className="data_graph">
                            <Sparklines data={this.props.data} height={110} min={0.5}>
                                <SparklinesLine style={{ stroke: "#59CED7", fill: "#475961", fillOpacity: "1" }} />
                            </Sparklines>
                        </div>
                    </div>
                </div>
            </li>
        )
    }
}

/**
* PerformanceMetricsContent
*/
export class PerformanceMetricsContent extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);
        this._onChange = this._onChange.bind(this);
        this._editMetric = this._editMetric.bind(this);
        this._expand = this._expand.bind(this);
        this.state = PerformanceMetricsStore.getPerformanceMetricsData();
    }

    /**
    * _onChange
    * get new store data upon store change
    */
    _onChange() {
        this.setState(PerformanceMetricsStore.getPerformanceMetricsData());
    }

    /**
    * _editMetric
    * enable edit metric view by setting store to editing
    */
    _editMetric() {
        if (!this.state.editing) {
            editMetric();
        } else {
            finishEdit();
        }
    }

    /**
    * _expand
    * metric expanded view
    */
    _expand() {
        expandedView(false);
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let rows = [];
        let content = [];
        let editButtonStyle = "";

        if (this.state.data) {

            if(!this.state.expandedView){

                if (this.state.editing) {
                    editButtonStyle = "edit";
                    rows.push(<AddNewMetricBlock key={-1} />);
                }

                this.state.data.map((item, index) => {
                    rows.push(<MetricGraph
                        key={index} 
                        index = {index}
                        editing = {this.state.editing}
                        id={item.id}
                        title={item.title} 
                        summary={item.summary}
                        data={item.graph}
                    />);
                });

                content.push(
                    <div key={-1}>
                        <div className="top-panel">  
                            <strong className="title">Performance Metrics</strong>  
                            <div className="btn-area">
                                <select>
                                    <option>Last 24 Hours</option>
                                </select>
                                <a href="javascript:;" className={"btn-default "+editButtonStyle} onClick={this._editMetric}>Edit Metrics</a>
                            </div>
                        </div>
                        <div className="graph_container">
                            <ul>{ rows }</ul>
                        </div>
                    </div>
                );
            } else {
                console.log(this.state);
                content.push(
                    <div key={-1}>
                        <div className="top-panel expanded-view">  
                            <a href="javascript:;" className="btn-default" onClick={this._expand}>Back</a>
                            <div className="graph-title">
                                <h5>CPU UTILIZATION MAX</h5>
                                <span className="summary">24.74%</span>
                                <small>Anomaly Detected: None</small>
                            </div>
                            <div className="btn-area">
                                <div>
                                    <select>
                                        <option>Last 24 Hours</option>
                                    </select>
                                </div>
                                <div>
                                    <a href="javascript:;" className="btn-default add-metric">+ Add Metrics</a>
                                </div>
                            </div>
                        </div>
                        <div className="graph_container">
                            <div className="graph">
                                <Sparklines data={[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]} height={110} min={0.5}>
                                    <SparklinesLine style={{ stroke: "#59CED7", fill: "#475961", fillOpacity: "0.8" }} />
                                </Sparklines>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div id="content" className="performance_metric_dashboard">
                { content }
            </div>
        )
    }

    /**
    * componentDidMount
    * add store change listener
    */
    componentDidMount() {
        PerformanceMetricsStore.addChangeListener(this._onChange);
    }

    /**
    * componentWillUnmount
    * remove store change listener
    */
    componentWillUnmount() {
        PerformanceMetricsStore.removeChangeListener(this._onChange);
    }

}
