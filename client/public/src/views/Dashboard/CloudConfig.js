import React from 'react'
import {Link} from 'react-router'
import {LeftSideBar} from './Util'

/**
* CloudConfig
*/
export default class CloudConfig extends React.Component {

	/**
    * render
    * @return {ReactElement} markup
    */
	render() {
    	return (
    		<div>
                <LeftSideBar pageName='cloud_config'/>
                <CloudConfigContent />
            </div>
    	)
  	}
}


/**
* CloudConfigContent
*/
export class CloudConfigContent extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let hintFieldStyle = {
            display:'block', 
            top: '122px',
            right: '40px', 
            left: 'auto'
        }

        return (
            <div id="content">
                <div className="application-data cloud-configuration">
                    <div className="top-panel">
                        <a href="#" className="btn-default next button-next">Edit Operation Requirements (SLA)</a>
                        <div className="btn-area"> 
                            <strong className="title icon-cloud">Cloud Configurations</strong>
                            <div className="additional-btns"> 
                                <Link to="" className="btn-default">+ Add Instance</Link>
                            </div>
                        </div>
                    </div>
                    <div className="configuration-tabs">
                        <div className="tab-content"> 
                            <h2>Configuration Detail</h2>
                            <div id="tab1"> 
                                <div className="configuration-data"> 
                                    <ul className="main-values">
                                        <li> 
                                            <div id="after_clickfix_instance_ct">3</div>
                                            <span>Intances</span>
                                        </li>
                                        <li> 
                                            <div id="after_clickfix_cpu">10</div>
                                            <span>CPU</span>
                                        </li>
                                        <li> 
                                            <div id="after_clickfix_memory">12.5 <sub>GB</sub></div> 
                                            <span>Memory</span>
                                        </li>
                                        <li> 
                                            <div id="after_clickfix_storage">61 <sub>GB</sub></div>
                                            <span>Storage</span>
                                        </li>
                                        <li> 
                                            <div id="after_clickfix_budget">$132</div>
                                            <span>Estimated Monthly Cost</span>
                                        </li>
                                    </ul>
                                    <div className="table-holder">  
                                        <strong className="table-heading">US West (Oregon) - AWS </strong>
                                        <table>
                                            <thead> 
                                                <tr> 
                                                    <th>Qty</th>
                                                    <th>Service</th>
                                                    <th>Memory</th>
                                                    <th>Storage</th>
                                                    <th>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr> 
                                                    <td>1</td>
                                                    <td>Nginx</td>
                                                    <td>512 MB</td>
                                                    <td>1 GB</td>
                                                    <td>$0.052 / hr</td>
                                                </tr>
                                                <tr> 
                                                    <td id="after_clickfix_instance_ct_table">1</td>
                                                    <td>Acmeair</td>
                                                    <td>4 GB</td>
                                                    <td>20 GB</td>
                                                    <td>$0.072 / hr</td>
                                                </tr>
                                                <tr> 
                                                    <td>1</td>
                                                    <td>MySQL</td>
                                                    <td>8 GB</td>
                                                    <td>40 GB</td>
                                                    <td>$0.069 / hr</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="hint-field" style={hintFieldStyle}> 
                                        <strong className="hint-title">Wnat to Find the Optimal Configuration?</strong>
                                        <p>We match your operation requirements (SLA) with performance data we collect from test deployments to find the optimal configuration options.</p><br/>
                                        <a href="#" className="btn-default next button-next"><span className="icon-arrow-right">Run Test Deployment</span></a><br/><br/>
                                        <a id="deleteApp" href="#" className="btn-default next button-next"><span className="icon-arrow-right">Delete Application</span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>  
            </div>
        )
    }
}
