import React from 'react'
import NewAppStore from '../../stores/NewAppStore'
import { HintField, ButtonArea } from './Util'

class TopologyView extends React.Component {

    /**
    * constructor
    **/
    constructor(props) {
        super(props);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.fillContent = this.fillContent.bind(this);
        this.draw = this.draw.bind(this);
        this.state = {"topologyView": props.topologyView};
        this.resizeTimer;
        this.unHighLitedCellBind = null;
    }


    /**
    * onWindowResize
    * event on window resize
    **/
    onWindowResize() {
        $(window).on('resize', function(e) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(function() {
                $("#mynetworkApp").css("height", "" + (window.innerHeight + 140) +"px");
            }, 250);
        });
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return <div ref="networkAppDisplay" id="mynetworkApp"></div>;
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
        if (this.unHighLitedCellBind) {
            $("#newapp_aside").off('click', '.nav-close', this.unHighLitedCellBind);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState((prevState, props) => {
          return {topologyView: props.topologyView};
        });
    }

    componentDidUpdate(prevProps, prevState) {
        this.draw(document.getElementById('mynetworkApp'));
    }

    fillContent (componentid) {
        let componentId = componentid.split('-');
        let componentConfig = this.state.topologyView.configsById[componentId[0]];

        let types = {"Service":"Service","ReplicationController":"Replication Controller","pod":"Pod","StatefulSet":"Stateful Set","Deployment":"Deployment"};
        let replicas = "";
        let configureDetailLists = "";
        let componentType = componentConfig.kind;
        //override type for RC Pod
        if (componentId[1]) {
            componentType = "pod";
        }
        let componenetName = `<span class="heading">Name:</span><span class="component-name">` + componentConfig.name + `</span>`;
        switch (componentType) {
            case "Service":
                if (componentConfig.entry_point) configureDetailLists = "<div class=\"entry-point\">Set as Entry Point</div>";
                break;
            case "pod":
                let podConfigsKeys = componentConfig.podConfig && componentConfig.podConfig.containersConfig ? Object.keys(componentConfig.podConfig.containersConfig) : {};
                podConfigsKeys.forEach(function(podConfigKey) {
                    let rscTypes = Object.keys(componentConfig.podConfig.containersConfig[podConfigKey]);
                    let output = '';
                    rscTypes.forEach((rscType) => {
                        let hwTypes = Object.keys(componentConfig.podConfig.containersConfig[podConfigKey][rscType]);
                        hwTypes.forEach((hw) => {
                            output += "<div class=\"replicas capitalize\">" + hw + " " + rscType + "</span></div><div class=\"replicas-count\">" + componentConfig.podConfig.containersConfig[podConfigKey][rscType][hw] + "</div>";
                        });
                    });
                    configureDetailLists += `<div class="container-config"><span class="heading">Container Name:</span><span class="component-name">`+ podConfigKey + `</span>` + output + `</div>`;
                });
                componenetName = "";
                break;
            case "ReplicationController", "Deployment":
            default:
                //show replicas
                if (componentConfig.replicas || componentType === 'Deployment') {
                    replicas = `<div class="replicas">Replicas</div><div class="replicas-count">` + (componentConfig.replicas ? componentConfig.replicas : 1) + `</div>`;
                }
                break;
        }
        var el = document.getElementById("newapp_aside_content");
        el.innerHTML = `<div class="detail-header-box"><span class="aside-head initiate ` + componentType + `">` + types[componentType] + `</span><br />`
             + componenetName + replicas + `</div>
                <div class="aside-block">` + configureDetailLists + `</div>`;
    }

    unHighLitedCell(graph, preCell) {
        if (preCell) {
            graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'gray', [preCell]);
        }
    }

    draw (container) {
        var _self = this;
        $("#mynetworkApp").empty();
        if (!this.state.topologyView || Object.keys(this.state.topologyView).length === 0 || this.state.topologyView.services.length===0 || this.state.topologyView.configsById.length === 0) {
            return;
        }

        let services = this.state.topologyView.services;
        let configsById = jQuery.extend({}, this.state.topologyView.configsById);

        var CELL_WIDTH = 129;
        var CELL_HEIGHT = 110;
        var icon_folder = "themes/openview/images/networkicons/";

        // Checks if browser is supported
        if (!mxClient.isBrowserSupported()){
            // Displays an error message if the browser is not supported.
            mxUtils.error('Browser is not supported!', 200, false);
        }
        else{
            // Disables built-in context menu
            mxEvent.disableContextMenu(container);

            // Creates the graph inside the given container
            var graph = new mxGraph(container);

            // Disables basic selection and cell handling
            graph.setEnabled(false);

            // Highlights the vertices when the mouse enters
            new mxCellTracker(graph, '#ffffff');

            // Changes the default vertex style in-place
            var style = graph.getStylesheet().getDefaultVertexStyle();

            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ROUNDED;
            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
            style[mxConstants.STYLE_STROKECOLOR] = 'gray';
            style[mxConstants.STYLE_ROUNDED] = false;
            style[mxConstants.STYLE_FILLCOLOR] = '#494E56';
            style[mxConstants.STYLE_GRADIENTCOLOR] = '#494E56';
            style[mxConstants.STYLE_FONTCOLOR] = '#D2D4D6';
            style[mxConstants.STYLE_PERIMETER_SPACING] = 1;
            style[mxConstants.STYLE_SHADOW] = false;
            style[mxConstants.STYLE_SPACING_LEFT] = 1;
            style[mxConstants.STYLE_INDICATOR_WIDTH] = 1;

            style = graph.getStylesheet().getDefaultEdgeStyle();
            style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
            style[mxConstants.STYLE_ROUNDED] = false;
            style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;

            graph.alternateEdgeStyle = 'elbow=vertical';

            graph.isHtmlLabel = function(cell){
                return true;
            };

            // Load cells and layouts the graph
            graph.getModel().beginUpdate();
            try {
                var parent = graph.getDefaultParent();
                var boxs = [];
                var boxsVisual = {};
                var rows = 0;
                services.forEach((service) => {
                    let entryPoint = "";
                    if (service.entry_point) {
                        entryPoint = "background-image:url(/" + icon_folder + "entrypoint.png);background-repeat:no-repeat;background-size:20px 20px;background-position:10px 20px;";
                    }
                    let content = `<div data='{"id":"`+service.id+`"}' style="height:114px;padding:25px 0 3px 0;`+entryPoint+`"><img src="`+icon_folder+`service.png" style="display:inline-block" width="40" height="40"/><p style="font-weight:bold;margin:0;padding:10px 0 5px 0;font-size:12px;width:129px;">`+service.name+`</p></div>`;
                    boxs.push(content);
                });
                boxs.forEach((box, index) => {
                    let xpos = 0;
                    boxsVisual[index] = [];
                    boxsVisual[index].push(graph.insertVertex(parent, null, box, 20 + 200*(xpos), 20 + 140*(index), CELL_WIDTH, CELL_HEIGHT));
                    xpos ++;
                    let rcs = services[index].targets;
                    rcs.forEach((reTarget, idx) => {
                        let xxpos = 0;
                        let rc = `<div data='{"id":"`+reTarget.reference_id+`"}' style="padding:13px 0 3px 0;"><img src="`+icon_folder+`replicationcontroller.png" style="display:inline-block" width="40" height="40" /><p style="font-weight:bold;margin:0;padding:10px 0 5px 0;font-size:12px">`+configsById[reTarget.reference_id].name+`</p><div style="background:#3A3B45;width:`+(CELL_WIDTH-1)+`px;text-align:left;height:29px;"><img src="`+icon_folder+`replicas.png" style="display:inline-block; margin:7px 5px 0 5px;" width="20" height="20" /><span style="padding: 10px 0 0 5px;display:inline-block">Replicas: `+configsById[reTarget.reference_id].replicas+`</span></div></div>`;
                        boxsVisual[index].push(graph.insertVertex(parent, null, rc, 20 + 200*(xpos + xxpos), 20 + 140*(index+idx), CELL_WIDTH, CELL_HEIGHT));
                        xxpos ++;
                        let podConfigs = configsById[reTarget.reference_id].podConfig.containersConfig;
                        let podConfigsKeys = Object.keys(podConfigs);
                        let pod = `<div data='{"id":"`+reTarget.reference_id+`-1"}' style="padding:13px 0 3px 0;"><img src="`+icon_folder+`pod.png" style="display:inline-block" width="40" height="40" /><p style="font-weight:bold;margin:0;padding:10px 0 5px 0;font-size:12px">Pod</p><div style="background:#3A3B45;width:`+(CELL_WIDTH-1)+`px;text-align:left;height:29px;"><img src="`+icon_folder+`container.png" style="display:inline-block; margin:7px 5px 0 5px;" width="20" height="20" /><span style="padding: 10px 0 0 5px;display:inline-block">Containers: `+podConfigsKeys.length+`</span></div></div>`;
                        boxsVisual[index].push(graph.insertVertex(parent, null, pod, 20 + 200*(xpos + xxpos), 20 + 140*(index+idx), CELL_WIDTH, CELL_HEIGHT));
                        graph.insertEdge(parent, null, '', boxsVisual[index][0], boxsVisual[index][1 + idx*2]);
                        graph.insertEdge(parent, null, '', boxsVisual[index][1 + idx*2], boxsVisual[index][2 + idx*2]);
                        delete configsById[reTarget.reference_id];
                        rows = index + idx;
                    });
                });
                Object.keys(configsById).forEach((id) => {
                    let singlePodConfig = configsById[id];
                    //replication controller + pod
                    if (singlePodConfig.kind === "ReplicationController" || singlePodConfig.kind === "Deployment") {
                        rows += 1;
                        let rcComponent;
                        let containerComponent;
                        let rc = `<div data='{"id":"`+singlePodConfig.id+`"}' style="padding:13px 0 3px 0;"><img src="`+icon_folder+`replicationcontroller.png" style="display:inline-block" width="40" height="40" /><p style="font-weight:bold;margin:0;padding:10px 0 5px 0;font-size:12px">`+singlePodConfig.name+`</p><div style="background:#3A3B45;width:`+(CELL_WIDTH-1)+`px;text-align:left;height:29px;"><img src="`+icon_folder+`replicas.png" style="display:inline-block; margin:7px 5px 0 5px;" width="20" height="20" /><span style="padding: 10px 0 0 5px;display:inline-block">Replicas: `+ (singlePodConfig.replicas ? singlePodConfig.replicas : '1') +`</span></div></div>`;
                        rcComponent = graph.insertVertex(parent, null, rc, 20 + 200, 20 + 140*rows, CELL_WIDTH, CELL_HEIGHT);
                        let podConfigs = singlePodConfig.podConfig && singlePodConfig.podConfig.containersConfig ? singlePodConfig.podConfig.containersConfig : {};
                        let podConfigsKeys = Object.keys(podConfigs);
                        if (podConfigsKeys.length > 0) {
                            let pod = `<div data='{"id":"`+singlePodConfig.id+`-1"}' style="padding:13px 0 3px 0;"><img src="`+icon_folder+`pod.png" style="display:inline-block" width="40" height="40" /><p style="font-weight:bold;margin:0;padding:10px 0 5px 0;font-size:12px">Pod</p><div style="background:#3A3B45;width:`+(CELL_WIDTH-1)+`px;text-align:left;height:29px;"><img src="`+icon_folder+`container.png" style="display:inline-block; margin:7px 5px 0 5px;" width="20" height="20" /><span style="padding: 10px 0 0 5px;display:inline-block">Containers: `+ (podConfigsKeys.length === 0 ? 1 : podConfigsKeys.length) +`</span></div></div>`;
                            containerComponent = graph.insertVertex(parent, null, pod, 20 + 400, 20 + 140*rows, CELL_WIDTH, CELL_HEIGHT);
                            graph.insertEdge(parent, null, '', rcComponent, containerComponent);
                        }
                    }
                    //pod only
                    if (singlePodConfig.kind === "pod") {
                        rows += 1;
                        let pod = `<div data='{"id":"`+singlePodConfig.id+`"}' style="padding:13px 0 3px 0;"><img src="`+icon_folder+`pod.png" style="display:inline-block" width="40" height="40" /><p style="font-weight:bold;margin:0;padding:10px 0 5px 0;font-size:12px">`+singlePodConfig.name+`</p><div style="background:#3A3B45;width:`+(CELL_WIDTH-1)+`px;text-align:left;height:29px;"><img src="`+icon_folder+`container.png" style="display:inline-block; margin:7px 5px 0 5px;" width="20" height="20" /><span style="padding: 10px 0 0 5px;display:inline-block">Containers: `+Object.keys(singlePodConfig.podConfig.containersConfig).length+`</span></div></div>`;
                        graph.insertVertex(parent, null, pod, 20 + 400, 20 + 140*rows, CELL_WIDTH, CELL_HEIGHT);
                    }
                });
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
            }

            var elx = document.getElementById('node_content_error');
            let bodyElement = $(document.body);
            //var el = document.getElementById('node_content');

            // Register cell click event
            let preCell = null;
            graph.addListener(mxEvent.CLICK, function(sender, evt) {
                if (_self.unHighLitedCellBind) {
                    $("#newapp_aside").off('click', ".nav-close", _self.unHighLitedCellBind);
                }
                if (preCell) {
                    graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'gray', [preCell]);
                }
                var cell = evt.getProperty('cell');
                if (cell != null) {
                    if(cell.value != "") {
                        preCell = cell;
                        _self.unHighLitedCellBind = _self.unHighLitedCell.bind(_self, graph, preCell);
                        $("#newapp_aside").on('click', ".nav-close", _self.unHighLitedCellBind);
                        graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#5fdae0', [cell]);
                        var parser = new DOMParser();
                        var el = parser.parseFromString(cell.value, "text/xml");
                        var data = JSON.parse(el.firstChild.getAttribute('data'));
                        var count = Object.keys(data).length;

                        if(count>0) {
                            //if(!document.body.classList.contains('nav-active')) {

                                elx.style.removeProperty('position');
                                elx.style.removeProperty('right');
                                bodyElement.addClass("nav-active");
                                _self.fillContent(data.id);
                            //}
                        } else {
                            bodyElement.removeClass("nav-active");
                            elx.style.position = "absolute";
                            elx.style.right = "-80px";
                        }

                    } else {
                        bodyElement.removeClass("nav-active");
                        elx.style.position = "absolute";
                        elx.style.right = "-80px";
                    }
                } else {
                    graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'gray', [preCell]);
                    bodyElement.removeClass("nav-active");
                    elx.style.removeProperty('position');
                    elx.style.removeProperty('right');
                }
            });
            container.setAttribute("style","height:"+(window.innerHeight + 140)+"px");
        }
    };

    /**
    * componentWillMount
    **/
    componentDidMount() {
        // Initiate graph
        this.draw(document.getElementById('mynetworkApp'));
    }

}

/**
* Content
*/
class Content extends React.Component{
    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        return(
            <div style={{padding:0,margin:0,position:'relative'}}>
                <TopologyView topologyView = {this.props.topologyView} />
                <aside id="node_content_error" className="aside" style={{paddingTop:'20px',background:'transparent',boxShadow:'none'}}>
                    <span className="aside-head-error" style={{color:'#F6575A',fontWeight:'bold',fontSize:'12px'}}>Entry Point Not Set</span>
                    <div className="aside-block-error" style={{color:'#E9E9EA',fontWeight:'normal',fontSize:'12px',marginTop:'10px'}}>
                        Please select an entry point before continuing.
                    </div>
                </aside>
            </div>
        )
    }
}

/**
* Application service component
*/
export default class ApplicationService extends React.Component {
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let appStatus = this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.status ?
                        this.props.topologyView.rawData.status : {};
        let servicesCount = '' + (appStatus.service_count ? appStatus.service_count : 0);
        let podsCount = '' + (appStatus.pod_count ? appStatus.pod_count : 0);
        let containersCount = '' + (appStatus.container_count ? appStatus.container_count : 0);

        let buttons = [{title:"Edit Code",id:"edit-code",className:"btn-default pull-right",to:""}]
        let headerText = [
            {className:"app-new service-icon",content:"Service(s) : " + servicesCount},
            {className:"app-new pod-icon",content:"Pod(s) : " + podsCount},
            {className:"app-new container-icon",content:"Container(s) : " + containersCount}
        ]

        return (
            <div className="application-form application-topology-step application-data application-service">
                <ButtonArea icon="icon-layers-new" title="Application Topology" titleClass="new-application" additionalButtons={buttons} headerText={headerText}/>
                <Content topologyView = {this.props.topologyView} />
            </div>
        );
    }

    /**
    * componentDidMount
    */
    componentDidMount() {
        var el = document.getElementById("edit-code");

        el.addEventListener("click", function(e){
            e.preventDefault();

            var modalEl = document.getElementById("edit-code-modal");
            modalEl.style.display = "block";

            // var d = document.getElementsByClassName("ace_active-line")[0];
            // d.className += " ace_active-error-line";
        });
    }
}
