import React from 'react'
import {Link} from 'react-router'
import {LeftSideBar} from './Util'

/**
* NetTopology
*/
export default class NetTopology extends React.Component {

  /**
    * render
    * @return {ReactElement} markup
    */
  render() { 
        return (
            <div>
                <LeftSideBar  pageName='net_topology'/> 
                <NetTopologyContent />
            </div>
        )
    }
}


class VisNetwork extends React.Component {
    
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
        var el = document.getElementById("mynetwork");
        el.setAttribute("style","height:"+window.innerHeight+"px");
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        return <div ref="networkDisplay" id="mynetwork" style={{background: '#3b3f4d'}}></div>;
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

        var el = document.getElementById("mynetwork");
        el.setAttribute("style","height:"+window.innerHeight+"px");

        var nodes = null;
        var edges = null;
        var network = null;
        var LENGTH_MAIN = 350,
        LENGTH_SERVER = 150,
        LENGTH_SUB = 50,
        WIDTH_SCALE = 4,
        RED = '#C5000B';

        // Create a data table with nodes.
        nodes = [];

        // Create a data table with links.
        edges = [];

        // Public Traffic
        nodes.push({id: 0, label: 'App Traffic', ip: 'App Traffic', value: 10, group: 'internet'});
        edges.push({from: 0, to: 1, length: LENGTH_MAIN, width: WIDTH_SCALE * 3, traffic: '0.79 Mbps'});

        // Physical Host
        nodes.push({id: 1, label: 'AWS', ip: '68.42.125.64', value: 10, group: 'physicalhost'});

        // Virtual Host
        nodes.push({id: 101, ip: '10.10.1.1', label: 'vHost1', value: 10, group: 'virtualhost'});
        nodes.push({id: 102, ip: '10.10.1.3', label: 'vHost2', value: 10, group: 'virtualhost'});
        nodes.push({id: 103, ip: '10.10.1.10', label: 'vHost3', value: 10, group: 'virtualhost'});
        edges.push({from: 1, to: 101, length: LENGTH_SUB, width: WIDTH_SCALE, traffic: '0.43 Mbps'});
        edges.push({from: 1, to: 102, length: LENGTH_SUB, width: WIDTH_SCALE, traffic: '0.23 Mbps'});
        edges.push({from: 1, to: 103, length: LENGTH_SUB, width: WIDTH_SCALE, traffic: '0.13 Mbps'});

        // Container
        nodes.push({id: 201, ip: '192.168.1.14', label: 'Ngnix', value: 10, title: 'Ngnix', group: 'container'});
        nodes.push({id: 202, ip: '192.168.1.76', label: 'Acmeair', value: 10, title: 'Acmeair', group: 'container'});
        nodes.push({id: 203, ip: '192.168.1.153', label: 'MySQL', value: 10, title: 'MySQL', group: 'container'});
        edges.push({from: 101, to: 201, length: LENGTH_SUB, width: WIDTH_SCALE, traffic: '0.43 Mbps'});
        edges.push({from: 102, to: 202, length: LENGTH_SUB, width: WIDTH_SCALE, traffic: '0.23 Mbps'});
        edges.push({from: 103, to: 203, length: LENGTH_SUB, width: WIDTH_SCALE, traffic: '0.13 Mbps'});

        var data = {
            nodes: nodes,
            edges: edges
        };

        var options = {
            nodes: {
                shape: 'dot',
                borderWidth: 3,
                borderWidthSelected: 3,
                color: {
                    border: '#ffffff',
                    background: '#5e5e5e',
                    highlight: {
                        background: '#5e5e5e',
                        border: '#4fd2db'
                    }
                },
                font: {
                    color: '#ffffff',
                    size: 12,
                    face: 'arial',
                    background: 'none',
                    strokeWidth: 0
                },
                scaling: {
                    min: 24,
                    max: 24
                }
            },
            edges: {
                color: {
                    color: '#5e5e5e',
                    highlight: '#4fd2db'
                },
                font: {
                    color: '#ffffff',
                    size: 12,
                    face: 'arial',
                    background: 'none',
                    strokeWidth: 0
                },
                smooth: {
                    type:'cubicBezier',
                    forceDirection: 'horizontal',
                    roundness: 0.4
                }
            },
            groups: {
                internet: {
                    shape: 'circularImage',
                    image: 'themes/openview/images/networkicons/internet.png'
                },
                physicalhost: {
                    shape: 'circularImage',
                    image: 'themes/openview/images/networkicons/phost.png'
                },
                virtualhost: {
                    shape: 'circularImage',
                    image: 'themes/openview/images/networkicons/vhost.png'
                },
                container: {
                    shape: 'circularImage',
                    image: 'themes/openview/images/networkicons/container.png'
                }
            },
            layout: {
                hierarchical:{
                    enabled: true,
                    direction: 'LR',
                    sortMethod: 'directed'
                }
            }
        };

        var network = new vis.Network(this.refs.networkDisplay, data, options);

        network.on("selectNode", function (params) {

            var inboundConn = document.querySelector("#connection_inbound_info dl");
            var outboundConn = document.querySelector("#connection_outbound_info dl");
            inboundConn.innerHTML = "";
            outboundConn.innerHTML = "";

            for(var i=0; i<params.edges.length; i++){
                var edge_info = $.grep(edges, function(e){ return e.id == params.edges[i]; }); 

                var from_node_info = $.grep(nodes, function(e){ return e.id == $(edge_info).attr('from'); });
                var to_node_info = $.grep(nodes, function(e){ return e.id == $(edge_info).attr('to'); }); 

                inboundConn.innerHTML = inboundConn.innerHTML + "<dt>"+from_node_info[0].ip+"</dt><dd>"+edge_info[0].traffic+"</dd>";
                outboundConn.innerHTML = outboundConn.innerHTML + "<dt>"+to_node_info[0].ip+"</dt><dd>"+edge_info[0].traffic+"</dd>";
            }

            var selected_node = $.grep(nodes, function(e){ return e.id == params.nodes[0]; });
            var selected_layer = selected_node[0].group;
            var selected_node_title = (selected_node[0].title) ? selected_node[0].title : 'Node_'+selected_node[0].id;

            switch(selected_layer){
                case 'container':
                    document.getElementById("container_info").style.display = 'block';
                    document.getElementById("vhost_info").style.display = 'block';
                    document.getElementById("phost_info").style.display = 'block';
                    document.querySelector("#container_info span.aside-block-head:first-child").innerHTML = "Container: Prod_"+selected_node_title+"_1";
                    break;
                case 'virtualhost':
                    document.getElementById("container_info").style.display = 'none';
                    document.getElementById("vhost_info").style.display = 'block';
                    document.getElementById("phost_info").style.display = 'block';
                    document.getElementById("vhost_info").getElementsByClassName("aside-block-head")[0].innerHTML = "Virtual Host: Prod_"+selected_node_title+"_1";
                    break;
                case 'physicalhost':
                    document.getElementById("container_info").style.display = 'none';
                    document.getElementById("vhost_info").style.display = 'block';
                    document.getElementById("phost_info").style.display = 'block';
                    document.getElementById("phost_info").getElementsByClassName("aside-block-head")[0].innerHTML = "Physical Host: Prod_"+selected_node_title+"_1";
                    break;
            }

            if(!document.body.classList.contains('nav-active')) {
                document.body.className += " nav-active";
            }

            // No side panel if it's internet node
            if(selected_layer == "internet") {
                document.querySelector('body').classList.remove('nav-active');
            }

            document.querySelector(".aside span.aside-head").innerHTML = selected_node_title;
        });

        network.on("deselectNode", function (params) {
            if(document.body.classList.contains('nav-active')){
                document.querySelector('body').classList.remove('nav-active');
            }
        });
    }

}

/**
* CloudConfigContent
*/
export class NetTopologyContent extends React.Component {

    closeAside() {
        if(document.body.classList.contains('nav-active')){
            console.log("remove class body");
            document.querySelector('body').classList.remove('nav-active');
        }
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        return (
            <div id="content" className="container-distribution" style={{padding:0,margin:0}}>
                <VisNetwork />
                <aside className="aside">
                    <span className="nav-close" onClick={this.closeAside.bind(this)}></span>
                    <span className="aside-head normal">Ngnix</span>
                    <div className="aside-btn-holder">
                        <a href="#" className="btn-normal">Download Logs</a>
                    </div>
                    <div className="aside-block">
                        <div id="container_info">
                            <span className="aside-block-head">Container: Prod_Nginx_1</span>
                            <dl className="server-status">
                                <dt>status:</dt>
                                <dd>good</dd>
                                <dt>local ip:</dt>
                                <dd className="ip_address">10.42.91.43</dd>
                                <dt>memory limit:</dt>
                                <dd>512 MB</dd>
                                <dt>started on:</dt>
                                <dd>May 17, 16 2:26 PM</dd>
                            </dl>
                        </div>
                        <div id="vhost_info">
                            <span className="aside-block-head second">Virtual Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>10.10.1.3</dd>
                                <dt>cpu:</dt>
                                <dd>4 cores, 2.4 GHz</dd>
                                <dt>memory:</dt>
                                <dd>8 GB</dd>
                                <dt>storage:</dt>
                                <dd>80 GB (SSD)</dd>
                            </dl>
                        </div>
                        <div id="phost_info">
                            <span className="aside-block-head second">Physical Host Info</span>
                            <dl className="server-status">
                                <dt>ip address:</dt>
                                <dd>66.42.125.64</dd>
                                <dt>cpu:</dt>
                                <dd>8 cores, 2.4 GHz</dd>
                                <dt>memory:</dt>
                                <dd>16 GB</dd>
                                <dt>storage:</dt>
                                <dd>500 GB (SSD)</dd>
                            </dl>
                        </div>
                        <div id="connection_inbound_info">
                            <span className="aside-block-head second">Inbound Traffic Info</span>
                            <dl></dl>
                        </div>
                        <div id="connection_outbound_info">
                            <span className="aside-block-head second">Outbound Traffic Info</span>
                            <dl></dl>
                        </div>
                    </div>
                </aside>
            </div>
        )
    }
}
