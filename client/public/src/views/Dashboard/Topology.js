import React from 'react'
import {Link} from 'react-router'
import {LeftSideBar} from './Util'

/**
* Network
*/
export default class Topology extends React.Component {

	/**
    * render
    * @return {ReactElement} markup
    */
	render() { 
        return (
            <div>
                <LeftSideBar  pageName='topology'/>
                <TopologyContent />
            </div>
        )
    }
}

/**
* TopologyContent
*/
export class TopologyContent extends React.Component {

    /**
    * constructor
    **/
    constructor(props) {
        super(props);

        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.showSide = this.showSide.bind(this);
    }

    showSide(ev) {
        var text = ev.target.innerText || ev.target.textContent;
        var selectedStack = ""; 

        document.querySelector(".aside span.aside-head").innerHTML = text;
        document.querySelector(".aside span.aside-block-head:first-child").innerHTML = "Container: Prod_"+text+"_1";
        
        if(text!=selectedStack) {
            document.body.className += " nav-active";
        }

        selectedStack = text;
    }

    /**
    * handleDocumentClick
    **/
    handleDocumentClick(evt) {

        if (evt.target.className != "text") {
            document.querySelector('body').classList.remove('nav-active');
        }
    }

    /**
    * componentWillMount
    **/
    componentWillMount() {
        document.addEventListener('click', this.handleDocumentClick);
    }

    /**
    * componentWillUnmount
    **/
    componentWillUnmount() {
        console.log("unmaount");
        document.removeEventListener('click', this.handleDocumentClick);
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div id="content" className="metric_dashboard">
                <div className="top-panel">  
                    <strong className="legend icon-layers icon">Services: 3</strong>
                    <strong className="legend icon-cube icon">Containers: 3</strong>    
                    <div className="btn-area">
                        <Link to="/topology" className="btn-default">Edit Operation Requirements (SLA)</Link>
                    </div>
                </div>
                <div className="stack-containers">
                    <div className="block add1 ngnix">
                        <a href="javascript:;" onClick={this.showSide}>
                            <span className="text">Ngnix</span>
                        </a>
                        <div className="bottom-text">
                            <span className="btm-detail">
                                Containers: 1
                            </span>
                            <div className="status green"></div>
                        </div>
                    </div>
                    <div className="v-line"></div>
                    <div className="block add1 acmeair">
                        <a href="javascript:;" onClick={this.showSide}>
                            <span className="text">Acmeair</span>
                        </a>
                        <div className="bottom-text">
                            <span className="btm-detail">
                            Containers: 1
                            </span>
                            <div className="status green"></div>
                        </div>
                    </div>
                    <div className="v-line"></div>
                    <div className="block add1 mysql">
                        <a href="javascript:;" onClick={this.showSide}>
                            <span className="text">MySQL</span>
                        </a>
                        <div className="bottom-text">
                            <span className="btm-detail">
                                Containers: 1
                            </span>
                            <div className="status green"></div>
                        </div>
                    </div>
                </div>
                <aside className="aside">
                    <span className="nav-close"></span>
                    <span className="aside-head normal">Ngnix</span>
                    <div className="aside-btn-holder">
                        <a href="javascript:;" className="btn-normal">Download Container Logs</a>
                    </div>
                    <div className="aside-block">
                        <span className="aside-block-head">Container: Prod_Nginx_1</span>
                        <dl className="server-status">
                            <dt>status:</dt>
                            <dd>good</dd>
                            <dt>local ip:</dt>
                            <dd>10.42.91.43</dd>
                            <dt>memory limit:</dt>
                            <dd>1000 MB</dd>
                            <dt>started on:</dt>
                            <dd>Oct 8, 2015 2:26 PM</dd>
                        </dl>
                        <span className="aside-block-head second">Host Info</span>
                        <dl className="server-status">
                            <dt>ip address:</dt>
                            <dd>68.42.125.64</dd>
                            <dt>cpu:</dt>
                            <dd>8 cores, 2.4 GHz</dd>
                            <dt>memory:</dt>
                            <dd>16 GB</dd>
                            <dt>storage:</dt>
                            <dd>500 GB (SSD)</dd>
                        </dl>
                        <span className="aside-block-head second">Operation Requirements</span>
                        <dl className="server-status">
                            <dt>geo restrict:</dt>
                            <dd>US only</dd>
                        </dl>
                    </div>
                </aside>
            </div>
        )
    }
}
