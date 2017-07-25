import React from 'react'
import {Link} from 'react-router'
import {LeftSideBar} from './Util'
import {mapbox} from '../../constants/ConfigConstants'

class DistributionMap extends React.Component {
    
    /**
    * constructor
    **/
    constructor(props) {
        super(props);

        this.onWindowResize = this.onWindowResize.bind(this);
    }

    /**
    * onWindowResize
    * event on window resize 
    **/
    onWindowResize() {
        var el = document.getElementById("distributionMap");
        el.setAttribute("style","height:"+window.innerHeight+"px");
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        return <div ref="mapDisplay" id="distributionMap" style={{background: '#3b3f4d'}}></div>;
    }

    /**
    * componentWillMount
    **/
    componentWillMount() {
        window.addEventListener('resize', this.onWindowResize, false);
    }

    /**
    * componentWillUnmount
    **/
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize, false);
    }

    /**
    * componentWillMount
    **/
    componentDidMount() {

        var el = document.getElementById("distributionMap");
        el.setAttribute("style","height:"+window.innerHeight+"px");

        L.mapbox.accessToken = mapbox.accessToken;
        var map = L.mapbox.map(this.refs.mapDisplay, mapbox.userKey, {
            zoomControl : false,
            legendControl : {
                position : 'topleft'
            }
        }).setView([43.950577, 2.166389], 2);
        map.scrollWheelZoom.disable();
        
        // add zoom control bottom right
        new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

        map.on('click', function(e){
            
            if(e.originalEvent.originalTarget.className != "marker-core"){
                if(document.body.classList.contains('nav-active')){
                    document.querySelector('body').classList.remove('nav-active');
                }                   
            }else{
                var selected_inst_ct = $(e.originalEvent.originalTarget).html();
                if(selected_inst_ct == 2) {
                    document.getElementById("beforefix").style.display = "none";
                    document.getElementById("afterfix").style.display = "block";
                } else {
                    document.getElementById("beforefix").style.display = "block";
                    document.getElementById("afterfix").style.display = "none";
                }

                if(document.body.classList.contains('nav-active')) {
                    document.querySelector('body').classList.remove('nav-active');
                } else {
                    document.body.className += " nav-active";
                }
            }
        });

        
    }

}

/**
* DistributionContent
*/
export class DistributionContent extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let mainStyle = {
            padding:0,
            margin:0
        }

        let background = {
            background: '#3b3f4d'
        }

        return (
            <div id="content" className="container-distribution" style={mainStyle}>
                <DistributionMap />
                <aside className="aside">
                    <span className="nav-close"></span>
                    <div id="beforefix">
                        <span className="aside-head normal">Nginx</span>
                        <div className="aside-block">
                            <span className="aside-block-head">Container: Prod_Nginx_1</span>
                            <dl className="server-status">
                                <dt>status:</dt>
                                <dd>up</dd>
                                <dt>local ip:</dt>
                                <dd>192.168.1.14</dd>
                                <dt>started on:</dt>
                                <dd>Oct 8, 2015 2:26 PM</dd>
                            </dl>
                            <span className="aside-block-head second">Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>68.42.125.64</dd>
                                <dt>cpu speed:</dt>
                                <dd>2.4 GHz</dd>
                                <dt>memory:</dt>
                                <dd>512 MB</dd>
                                <dt>storage:</dt>
                                <dd>40 GB (SSD)</dd>
                            </dl>
                            <span className="aside-block-head second">Data Center Info</span>
                            <dl className="server-status">
                                <dt>service provider:</dt>
                                <dd>Deutsche Telekom</dd>
                                <dt>region name:</dt>
                                <dd>US West</dd>
                            </dl>
                        </div>
                        <br/>
                        <span className="aside-head normal">ACMEAIR</span>
                        <div className="aside-block">
                            <span className="aside-block-head">Container: Prod_AcmeAir</span>
                            <dl className="server-status">
                                <dt>status:</dt>
                                <dd>up</dd>
                                <dt>local ip:</dt>
                                <dd>192.168.1.76</dd>
                                <dt>started on:</dt>
                                <dd>Oct 2, 2015 4:36 PM</dd>
                            </dl>
                            <span className="aside-block-head second">Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>68.42.125.64</dd>
                                <dt>cpu speed:</dt>
                                <dd>2.1 GHz</dd>
                                <dt>memory:</dt>
                                <dd>256 MB</dd>
                                <dt>storage:</dt>
                                <dd>20 GB (SSD)</dd>
                            </dl>
                            <span className="aside-block-head second">Data Center Info</span>
                            <dl className="server-status">
                                <dt>service provider:</dt>
                                <dd>Deutsche Telekom</dd>
                                <dt>region name:</dt>
                                <dd>US West</dd>
                            </dl>
                        </div>
                        <br/>
                        <span className="aside-head normal">MySQL</span>
                        <div className="aside-block">
                            <span className="aside-block-head">Container: Prod_mySQL</span>
                            <dl className="server-status">
                                <dt>status:</dt>
                                <dd>up</dd>
                                <dt>local ip:</dt>
                                <dd>192.168.1.153</dd>
                                <dt>started on:</dt>
                                <dd>Oct 2, 2015 4:36 PM</dd>
                            </dl>
                            <span className="aside-block-head second">Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>68.42.125.64</dd>
                                <dt>cpu speed:</dt>
                                <dd>2.1 GHz</dd>
                                <dt>memory:</dt>
                                <dd>256 MB</dd>
                                <dt>storage:</dt>
                                <dd>20 GB (SSD)</dd>
                            </dl>
                            <span className="aside-block-head second">Data Center Info</span>
                            <dl className="server-status">
                                <dt>service provider:</dt>
                                <dd>Deutsche Telekom</dd>
                                <dt>region name:</dt>
                                <dd>US West</dd>
                            </dl>
                        </div>
                    </div>
                    <div id="afterfix">
                        <span className="aside-head normal">ACMEAIR</span>
                        <div className="aside-block">
                            <span className="aside-block-head">Container: Prod_AcmeAir</span>
                            <dl className="server-status">
                                <dt>status:</dt>
                                <dd>up</dd>
                                <dt>local ip:</dt>
                                <dd>192.168.1.76</dd>
                                <dt>started on:</dt>
                                <dd>Jan 17, 2016 4:36 PM</dd>
                            </dl>
                            <span className="aside-block-head second">Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>68.42.34.112</dd>
                                <dt>cpu speed:</dt>
                                <dd>2.1 GHz</dd>
                                <dt>memory:</dt>
                                <dd>256 MB</dd>
                                <dt>storage:</dt>
                                <dd>20 GB (SSD)</dd>
                            </dl>
                            <span className="aside-block-head second">Data Center Info</span>
                            <dl className="server-status">
                                <dt>service provider:</dt>
                                <dd>Deutsche Telekom</dd>
                                <dt>region name:</dt>
                                <dd>US Central</dd>
                            </dl>
                        </div>
                        <br/>
                        <span className="aside-head normal">ACMEAIR</span>
                        <div className="aside-block">
                            <span className="aside-block-head">Container: Prod_AcmeAir</span>
                            <dl className="server-status">
                                <dt>status:</dt>
                                <dd>up</dd>
                                <dt>local ip:</dt>
                                <dd>192.168.24.56</dd>
                                <dt>started on:</dt>
                                <dd>Jan 17, 2016 4:36 PM</dd>
                            </dl>
                            <span className="aside-block-head second">Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>68.42.34.112</dd>
                                <dt>cpu speed:</dt>
                                <dd>2.1 GHz</dd>
                                <dt>memory:</dt>
                                <dd>256 MB</dd>
                                <dt>storage:</dt>
                                <dd>20 GB (SSD)</dd>
                            </dl>
                            <span className="aside-block-head second">Data Center Info</span>
                            <dl className="server-status">
                                <dt>service provider:</dt>
                                <dd>Deutsche Telekom</dd>
                                <dt>region name:</dt>
                                <dd>US Central</dd>
                            </dl>
                        </div>
                    </div>
                </aside>
            </div>
        )
    }
}

/**
* Distribution
*/
export default class Distribution extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() { 
        return (
            <div>
                <LeftSideBar  pageName='distribution'/>
                <DistributionContent />
            </div>
        )
    }
}


