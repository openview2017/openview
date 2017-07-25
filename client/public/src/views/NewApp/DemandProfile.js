import React from 'react'
import { HintField, ButtonArea } from './Util'
import { mapbox } from '../../constants/config'
import update from 'immutability-helper'
import NewAppStore from '../../stores/NewAppStore'
import './range.css'

var tvotPlot;
var aMapMarkers = [];
var map;
var aTrafficCoord = [
    [23.1166700, 113.2500000], // Guangzhou
    [39.9075000, 116.3972300], // Beijing
    [22.5549176, 113.7736861], // Shenzhen
    [1.2896700, 103.8500700], // Singapore
    [37.5537600, -77.4602600], // N. Virginia
    [45.5234500, -122.6762100], // Oregon
    [53.3330600, -6.2488900], // Ireland
];

/**
* showTrafficSourcesmap
**/
var showTrafficSourcesMap = function() {

    // Mapbox
    if(map) {
        map.remove();
    }

    L.mapbox.accessToken = mapbox.accessToken;
    map = L.mapbox.map('traffic-sources-map-box', mapbox.userKey, {
        zoomControl : false,
        legendControl : {
            position : 'topleft'
        }
    }).setView([21.943602, 24.498259], 2);

    map.scrollWheelZoom.disable();

    // add zoom control bottom right
    new L.Control.Zoom({
        position : 'bottomright'
    }).addTo(map);

};

/**
* addMarker
**/
var addMarker = function(lat, lng, index) {

    index = index || 0;

    var markerName = '_' + index;

    aMapMarkers[markerName] = L.marker([lat, lng], {
        icon : L.divIcon({
            iconSize : [22, 22],
            iconAnchor : [15, 15],
            popupAnchor : [10, 0],
            shadowSize : [0, 0],
            className : '',
            html : '<div class="icon-outer-good-3"><div class="icon-outer-good-2"><div class="icon-outer-good-1"><div class="icon-core"></div></div></div></div>'
        })
    }).addTo(map);
};

/**
* removeMarker
**/
var removeMarker = function(index) {

    var markerName = '_' + index;
    map.removeLayer(aMapMarkers[markerName]);
};

/**
* showJqPlot
**/
var showJqplot = function(storedData,xNumTicks) {

    storedData = storedData || [[0, 5], [60000, 5], [120000, 25], [180000, 25], [240000, 5], [300000, 5]];
    xNumTicks = xNumTicks || 6;

    $.jqplot.config.enablePlugins = true;

    if (tvotPlot) {
        tvotPlot.destroy();
    }

    tvotPlot = $.jqplot('chart1', [storedData], {
        title : '',
        grid : {
            backgroundColor : "#494B55",
            //fillAlpha: 0.2,
            gridLineColor : '#50535E',
            gridLineWidth : 1
        },
        axes : {
            xaxis : {
                color : "#FFFFFF",
                renderer : $.jqplot.DateAxisRenderer,
                rendererOptions : {
                    shapeRenderer : {
                        strokeStyle : "#000000"
                    }
                },
                //labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                tickOptions : {
                    showGridline : false,
                    formatString : '%M'
                    //formatString: '%#m/%#d/%y'
                    //formatString: '%b %#d, %Y'
                },
                numberTicks : xNumTicks
            },
            yaxis : {
                min : 0,
                tickOptions : {
                    showGridline : false,
                    formatString : '%d'
                },
                labelOptions : {
                    textColor : '#FFFFFF'
                },
                numberTicks : 4
            }
        },

        highlighter : {
            sizeAdjust : 10,
            tooltipLocation : 'n',
            tooltipAxes : 'y',
            tooltipFormatString : '<b><i><span style="color:red;"></span></i></b> %d',
            useAxesFormatters : false
        },
        cursor : {
            show : true
        },
        seriesDefaults : {
            color : '#A4F1F5',
            //fill: true,
            fillAndStroke : true,
            fillColor : '#4B5D67',
            fillAlpha : 0.8,
            markerOptions : {
                style : 'filledCircle',
                color : '#FFFFFF',
            },
            trendline : {
                show : false
            }
        }
    });

    jqDrag();

};

/**
* msToTime
**/
var msToTime = function(duration) {

    var seconds = parseInt((duration / 1000) % 60), minutes = parseInt((duration / (1000 * 60)) % 60), hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
};

/**
* jqDrag
**/
var jqDrag = function(){
    $('#chart1').unbind('jqplotDragStop').bind('jqplotDragStop', function(seriesIndex, pointIndex, pixelposition, data) {
        var aEvent = ['A', 'B', 'C', 'D', 'E', 'F'];
        var tableData = "<tr><th>Event</th><th>Users</th><th>Time</th></tr>";
        var aTableData = [];

        // get table data
        $.each($("#radio-tab-3").find("table.main-table tbody tr"), function(key, val) {
            if ($(this).find("td:nth-child(2)").text() != "") {
                aTableData[key] = parseInt($(this).find("td:nth-child(2)").text());
            }
        });

        var aTableData = aTableData.filter(function(element) {
            return !!element;
        });

        var chngIndex = 0;

        $.each(tvotPlot.series[0].data, function(key, val) {
            if (aTableData[key] != Math.round(val[1]))
                chngIndex = key;
            tableData += "<tr><td>" + aEvent[key] + "</td><td>" + Math.round(val[1]) + "</td><td>" + msToTime(val[0]) + "</td></tr>";
        });

        $("#radio-tab-3").find("table.main-table tbody").html(tableData);

        chngIndex += 2;
        $("#radio-tab-3").find("table.main-table tbody tr:nth-child(" + (chngIndex) + ")").addClass("tableHigh");
        setTimeout(function() {
            $("#radio-tab-3").find("table.main-table tbody tr:nth-child(" + (chngIndex) + ")").removeClass("tableHigh");
        }, 1000);
    });
};

/**
* Section name
*/
class SectionName extends React.Component {
    constructor (props) {
        super(props);
        this.state = {dpid: this.props.demandProfileID, name: this.props.name, desc: this.props.desc, namePlaceholder : "name for your demand profile", descPlaceholder : "description for your demand profile"};
    }
    onFocus (field) {
        if (field === 'name')
            this.setState({namePlaceholder : ""});
        else
            this.setState({descPlaceholder : ""});
    }
    onBlur (field) {
        if (field === 'name')
            this.setState({namePlaceholder : "name for your demand profile"});
        else
            this.setState({descPlaceholder : "description for your demand profile"});
    }
    componentWillReceiveProps(nextProps) {
        this.setState({dpid: nextProps.demandProfileID});
        this.setState({name: nextProps.name});
        this.setState({desc: nextProps.desc});
    }
    handleChangeName(event) {
        clearTimeout(this.nametimeout);
        let value = event.target.value;
        this.setState({name: value});
        this.nametimeout = setTimeout(() => {
            this.props.setDemandProfile("name", value);
        }, 500);
    }
    handleChangeDesc(event) {
        clearTimeout(this.desctimeout);
        let value = event.target.value;
        this.setState({desc: value});
        this.desctimeout = setTimeout(() => {
            this.props.setDemandProfile("desc", value);
        }, 500);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let styleTop = {
            top: '20px'
        }

        return (
            <div>
                <div className="form-post row abs-row">
                    <span className="label-holder" style={styleTop}>
                        <label htmlFor="name">Name</label>
                    </span>
                    <div className="col validate-item validate-row">
                        <div className="input-holder">
                            <input className="required" type="text" id="name" onFocus={this.onFocus.bind(this, "name")} onBlur={this.onBlur.bind(this, "name")} placeholder={this.state.namePlaceholder} value={this.state.name} onChange={this.handleChangeName.bind(this)}/>
                        </div>
                    </div>
                    <HintField
                        title="Name"
                        message="Name your demand profile so you can easily identify what you're testing against."
                    />
                </div>
                <div className="form-post row abs-row" style={{ padding: "0 27px 0 24px", border: "none"}}>
                    <span style={{display: "block"}} className="label-holder">
                        <label htmlFor="description">Description <span className="optional">(Optional)</span></label></span>
                    <div className="col validate-item validate-row">
                        <div className="input-holder">
                            <textarea id="description" onFocus={this.onFocus.bind(this, "desc")} onBlur={this.onBlur.bind(this, "desc")} placeholder={this.state.descPlaceholder} value={this.state.desc} onChange={this.handleChangeDesc.bind(this)}/>
                        </div>
                    </div>
                    <HintField
                        title="Description"
                        message="Name your demand profile so you can easily identify what you're testing against."
                    />
                </div>
            </div>
        )
    }
}

/**
* Section duration for demand
**/
class SectionDurationForDemand extends React.Component {

    changeTrafficVolume() {
        var duration = document.getElementById("duration").value;
        var maxValue = document.getElementById("concurrent-users").value;
        var time = [];
        var cntr = 5;
        var minValue = 5;
        var ms = 60000;

        var maxMs = (ms * parseInt(duration))/cntr;
        time.push(0);
        for(var j=1;j<=cntr;j++) {
            time.push(maxMs*j);
        }

        var storedData = [];
        for(var i=0;i<6;i++){
            if(i==2 || i==3) {
                storedData.push([time[i],parseInt(maxValue)]);
            } else {
                storedData.push([time[i],parseInt(minValue)]);
            }
        }

        showJqplot(storedData);

        // update data table
        var aEvent = ['A', 'B', 'C', 'D', 'E', 'F'];
        var tableData = [];
        tableData.push("<tr><th>Event</th><th>Users</th><th>Time</th></tr>");

        tvotPlot.series[0].data.map(function(val, key){
            tableData.push("<tr><td>" + aEvent[key] + "</td><td>" + Math.round(val[1]) + "</td><td>" + msToTime(val[0]) + "</td></tr>");
        });

        document.querySelector('#radio-tab-3 table.main-table tbody').innerHTML = tableData.join("");
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        this.changeTrafficVolume.bind(this);
        return (
            <div className="form-post row with-border">
                <div className="line last">
                    <label className="offset-label validate-row" htmlFor="duration">1. Duration For Demand Test of
                        <input className="small-width required" id="duration" type="text" onChange={this.changeTrafficVolume.bind(this)} defaultValue="5"/>
                        min. with
                    </label>
                    <label htmlFor="traffic" className="validate-row">Estimated Peak Traffic Volume of
                        <input className="small-width required" id="concurrent-users" onChange={this.changeTrafficVolume.bind(this)} type="text" defaultValue="25"/>
                    </label> concurrent users
                </div>
                <HintField
                    title="Duration For Demand Test"
                    message="Here you will be able to set a duration for your test (min) and note a specific peak traffic volume."
                />
            </div>
        )
    }
}

/**
* Section trafiic pattern
**/
class SectionTrafficPattern extends React.Component {

    /**
    * constructor
    */
    constructor(props) {
        super(props);

        this.state = {
            selection: "upDown"
        }
        this.handleChange = this.onChange.bind(this);
    }

    /**
    * onChange
    */
    onChange(ev) {
        this.setState({ selection: ev.target.value });
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        var that = this;

        var radios = [
                        {id:'flat',label:'Flat',tab:'#radio-tab-1',image:'themes/openview/images/schedule1.png'},
                        {id:'scale',label:'Scale Up',tab:'#radio-tab-2',image:'themes/openview/images/schedule2.png'},
                        {id:'upDown',label:'Up & Down',tab:'#radio-tab-3',image:'themes/openview/images/schedule3.png'},
                        {id:'cycle',label:'Cycle',tab:'#radio-tab-4',image:'themes/openview/images/schedule4.png'}
                    ]

        var radioList = radios.map(function(radio, index){
                            return (
                                <div key={index} className="col">
                                    <input type="radio" id={radio.id} name="opt" checked={radio.id === that.state.selection} onChange={that.handleChange} data-tab={radio.tab} value={radio.id}/>
                                    <label htmlFor={radio.id}>{radio.label}</label>
                                    <div className="img-holder">
                                        <img src={radio.image} alt="Image Description"/>
                                    </div>
                                </div>
                            )
                        })

        return (
            <div className="form-post row with-border">
                <div className="column-wrap" data-radio-tab="true">
                    { radioList }
                </div>
                <HintField
                    title="Select Traffic Pattern"
                    message="Simulate user behavior over a time doamin for load performance."
                />
            </div>
        )
    }
}

/**
* Section traffic volume
**/
class SectionTrafficVolume extends React.Component {

    /**
    * componentDidMount
    */
    componentDidMount() {

        setTimeout( function() {

            var width = parseInt(document.getElementById("jqPlotHolder").offsetWidth)-30;
            document.getElementById("chart1").style.width = width+"px";

            showJqplot();

        }, 100);

    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let chartStyles = {
            height:'250px'
        }

        return (
            <div className="form-post row with-border">
                <div className="line">
                    <label className="offset-label">3. Adjust Your Traffic Volume Over Time</label>
                </div>
                <div className="line last">
                    <div className="align-holder" data-tab-holder>
                        <div id="radio-tab-1">
                            <div className="chart-col">
                                <img src="themes/openview/images/schedule5.png" alt="Image Description" />
                            </div>
                            <div className="chart-col">
                                <table className="main-table align-left text-center min-width">
                                    <tbody>
                                        <tr><th>Event</th><th>Users</th><th>Time</th></tr>
                                        <tr><td>A</td><td>1,200</td><td>00:00:00</td></tr>
                                        <tr><td>D</td><td>1,200</td><td>00:05:00</td></tr>
                                        <tr><td>C</td><td>3,200</td><td>00:10:00</td></tr>
                                        <tr><td>D</td><td>3,200</td><td>00:15:00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div id="radio-tab-2">
                            <div className="chart-col">
                                <img src="themes/openview/images/schedule5.png" alt="Image Description" />
                            </div>
                            <div className="chart-col">
                                <table className="main-table align-left text-center min-width">
                                    <tbody>
                                        <tr><th>Event</th><th>Users</th><th>Time</th></tr>
                                        <tr><td>A</td><td>5,200</td><td>00:00:00</td></tr>
                                        <tr><td>D</td><td>5,200</td><td>00:05:00</td></tr>
                                        <tr><td>C</td><td>5,200</td><td>00:10:00</td></tr>
                                        <tr><td>D</td><td>3,200</td><td>00:15:00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div id="radio-tab-3">
                            <div id="jqPlotHolder" className="chart-col">
                                <div id="chart1" style={chartStyles}></div>
                            </div>
                            <div className="chart-col">
                                <table className="main-table align-left text-center min-width">
                                    <tbody>
                                        <tr><th>Event</th><th>Users</th><th>Time</th></tr>
                                        <tr><td>A</td><td>5</td><td>00:00:00</td></tr>
                                        <tr><td>B</td><td>5</td><td>00:01:00</td></tr>
                                        <tr><td>C</td><td>25</td><td>00:02:00</td></tr>
                                        <tr><td>D</td><td>25</td><td>00:03:00</td></tr>
                                        <tr><td>E</td><td>5</td><td>00:04:00</td></tr>
                                        <tr><td>F</td><td>5</td><td>00:05:00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div id="radio-tab-4">
                            <div className="chart-col">
                                <img src="themes/openview/images/schedule5.png" alt="Image Description" />
                            </div>
                            <div className="chart-col">
                                <table className="main-table align-left text-center min-width">
                                    <tbody>
                                        <tr><th>Event</th><th>Users</th><th>Time</th></tr>
                                        <tr><td>A</td><td>1,200</td><td>00:00:00</td></tr>
                                        <tr><td>D</td><td>1,200</td><td>00:05:00</td></tr>
                                        <tr><td>C</td><td>1,200</td><td>00:10:00</td></tr>
                                        <tr><td>D</td><td>1,200</td><td>00:15:00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <HintField
                    title="Adjust Your Traffic Volume Over Time"
                    message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                />
            </div>
        )
    }
}

class SectionCustomizeRequestPattern extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div className="form-post row with-border">
                <div className="line">
                    <label className="offset-label">4. Select And Customize Request Pattern</label>
                </div>
                <div className="line required-checkbox validate-row">
                    <input type="checkbox" id="nextRequest" />
                    <label htmlFor="nextRequest">Submit the next request after receiving response from the server</label>
                </div>
                <div className="line last">
                    <label htmlFor="userRequest" className="validate-item validate-row">Simulate user requests in
                        <input className="small-width required" type="text" />ms
                    </label>
                </div>
                <HintField
                    title="Select And Customize Request Pattern"
                    message="You can further customize your request pattern to ensure your test is as accurate as possible."
                />
            </div>
        )
    }
}

class SectionTestingURLs extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    // render() {
    //     return (
    //         <div className="form-post row with-border">
    //             <div className="line">
    //                 <label className="offset-label">5. Specify Testing URL’s</label>
    //                 <a href="#" className="btn-default">+ Imports URL's</a>
    //             </div>
    //             <div className="line last">
    //                 <table className="main-table full-width">
    //                     <tbody>
    //                         <tr>
    //                             <th className="textalign-left">URL</th>
    //                             <th className="textalign-right">Percentage (%)</th>
    //                         </tr>
    //                         <tr>
    //                             <td className="textalign-left"><a href="#">https://www.flightbox.com/signin/forgot-password</a></td>
    //                             <td className="textalign-right">50%</td>
    //                         </tr>
    //                         <tr>
    //                             <td className="textalign-left"><a href="#">https://www.flightbox.com/board</a></td>
    //                             <td className="textalign-right">50%</td>
    //                         </tr>
    //                     </tbody>
    //                 </table>
    //             </div>
    //             <HintField
    //                 title="Specify Testing URL’s"
    //                 message="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    //             />
    //         </div>
    //     )
    // }
}

/**
* Region check box
*/
class RegionCheckbox extends React.Component {

    /**
    * constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.checked || false
        }
        this.handleChange = this.onChange.bind(this);
    }

    /**
    * onChange
    */
    onChange(ev) {

        this.setState({ checked: ev.target.checked });

        if(ev.target.checked) {
            var coords = aTrafficCoord[this.props.data];
            addMarker(coords[0], coords[1], this.props.data);
        } else {
            removeMarker(this.props.data);
            $(ev.target).closest("tr").find("td:last-child").text('');
        }

        var counter = $("#tbl-traffic-regions input[type=checkbox]:checked").length;;
        var percentage = 100 / counter;
        $.each($("#tbl-traffic-regions input[type=checkbox]:checked"), function() {
            $(this).closest("tr").find("td:last-child").text(percentage.toFixed(1) + "%");
        });

    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (

            <input type="checkbox"
                className={this.props.className}
                data-region={this.props.data}
                checked={this.state.checked}
                onChange={this.handleChange}
                id={this.props.id}
            />
        )
    }
}

/**
* Section traffic sources
**/
class SectionTrafficSources extends React.Component {

    /**
    * component did mount
    **/
    componentDidMount() {

        // show traffic source map
        showTrafficSourcesMap();

        // add default markers
        addMarker(39.9075000, 116.3972300, 1);
        // addMarker(-33.8678500, 151.2073200, 4);
        // addMarker(45.5234500, -122.6762100, 8);
        // addMarker(1.2896700, 103.8500700, 2);
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {

        let mapBoxContainerStyles = {
            background: '#3b3f4d',
            height: '400px',
            width: '100%',
            zIndex: '1000'
        }

        return (
            <div className="form-post row with-border">
                <div className="line">
                    <label className="offset-label">Set Traffic Sources</label>
                </div>
                <div className="line" style={{paddingLeft:0, paddingRight: 0}}>
                    <div id="traffic-sources-map-box" style={mapBoxContainerStyles}></div>
                </div>
                <div className="line last" style={{paddingLeft:0, paddingRight: 0}}>
                    <table id="tbl-traffic-regions" className="main-table full-width">
                        <tbody className="validate-row required-checkbox">
                            <tr>
                                <th className="textalign-left">Select Region(s)</th>
                                <th className="textalign-right">Percent</th>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data="0" checked={true} id="guangzhou" />
                                <label htmlFor="guangzhou">Asia Pacific (Huawei South)</label></td>
                                <td className="textalign-right">50%</td>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data="1" checked={true} id="beijing" />
                                <label htmlFor="beijing">Asia Pacific (Huawie North)</label></td>
                                <td className="textalign-right">50%</td>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data="2" id="guangzhou" />
                                <label htmlFor="guangzhou">Asia Pacific (Shenzhen) - Aliyun</label></td>
                                <td className="textalign-right"></td>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data="3" id="singapore"/>
                                <label htmlFor="singapore">Asia Pacific (Singapore) - AWS</label></td>
                                <td className="textalign-right"></td>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data='4' id="virginia"/>
                                <label htmlFor="virginia">US East (N. Virginia) - AWS</label></td>
                                <td className="textalign-right"></td>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data='5' id="oregon"/>
                                <label htmlFor="Oregon">US West (Oregon) - AWS</label></td>
                                <td className="textalign-right"></td>
                            </tr>
                            <tr>
                                <td className="textalign-left">
                                <RegionCheckbox data='6' id="ireland"/>
                                <label htmlFor="ireland">EU (Ireland) - AWS</label></td>
                                <td className="textalign-right"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{fontSize: "12px", margin: "30px auto 5px", width: "300px", color: "#acacb0"}}>*User load will be multiplied for every region you select</div>
                <HintField
                    title="Set Traffic Sources"
                    message="To accurately simulate web traffic, please select traffic sources from the list below."
                />
            </div>
        )
    }
}

class ConfigFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {generateLoad: Number(this.props.duration), filename: this.props.filename };
        this.durationtimeout = null;
    }
    handleFileSelect(evt) {
        let _self = this;
        let dp_id = this.props.demandProfileID;
        if (!dp_id) {
            this.resetFormInput();
            return;
        }
        var files = evt.target.files; // FileList object
        let f = files[0];
        $("#config-file-name").val(f.name);
        var reader = new FileReader();
        if (!f.name.match('\.yaml') && !f.name.match('\.json') && !f.name.match('\.yml')) {
            console.log("not support");
            _self.resetFormInput();
            return;
        }
        reader.onload = (function(e) {
            this.uploadConfigFile(f.name, reader.result, 'config');
            $('#file-upload').val('').attr('type','').attr('type','file');
        }).bind(this);
        reader.readAsText(f);
    }
    resetFormInput () {
        $('#config-file-name').val('');
        $('#file-upload').val('').attr('type','').attr('type','file');
    }
    uploadConfigFile (fname, content, type) {
        let appid = NewAppStore.getAppID();
        let dpid = this.props.demandProfileID;
        if (appid == '' || dpid == 0 || this.props.dmdProfile.length == 0) {
            console.log("Can not save Demand Config Profile!");
        } else {
            let name = $("#name", ".application-data.demand-profile").val();
            name = name == '' ? 'new demand profile' : name;
            let desc = $("#description", ".application-data.demand-profile").val();
            let dura = $("input[type=range].flex-col").val();
            let _self = this;
            let data = {"name": name, "description": desc, "config_filename": fname, "config": content, "load_duration": dura};
            $.ajax({ url: "/api/openview/api/v1/app/" + appid + "/demand-profiles/" + dpid,
                     method: 'PUT',
                     contentType: "application/json",
                     data: JSON.stringify(data),
                     dataType: "json",
                     complete: function(e, xhr, settings) {
                         if (e.status === 200){
                             console.log("update Demand Config Profile:[" + dpid + "] success.");
                             NewAppStore.setDPID(dpid);
                             NewAppStore.getDemandProfile();
                             _self.props.setDemandProfile("yaml", content);
                             _self.props.setDemandProfile("filename", fname);
                         } else {
                             console.log("update Demand Config Profile : [" + dpid + "] failed (" + e.status + ") : ");
                             let errorline = e.responseText.match(/line \d*/);
                             let errorLine = Array.isArray(errorline) ? errorline[0].replace('line ', '') : '0';
                             _self.props.updateEditCodeContent(content, type, true, e.responseText, errorLine);
                         }
                     }
            });
        }
    }
    changeLoad (e) {
        $('.generate-load').text(e.target.value);
        this.setState({generateLoad: e.target.value});
        let value = e.target.value;
        clearTimeout(this.durationtimeout);
        this.durationtimeout = setTimeout(() => {
            this.props.setDemandProfile("duration", Number(value));
        }, 500);
    }
    componentDidMount() {
        document.getElementById('file-upload').addEventListener('change', this.handleFileSelect.bind(this), false);
    }
    componentWillReceiveProps (nextProps) {
        let dps = nextProps.dmdProfile;
        let dpid = nextProps.demandProfileID;
        if (dpid != 0) {
            dps.some((dp) => {
                if (dp.id == dpid && jQuery.isNumeric(dp.load_duration)) {
                    this.setState({generateLoad: dp.load_duration});
                    this.setState({filename: dp.config_filename ? dp.config_filename : ""});
                    this.props.setDemandProfile("duration", dp.load_duration);
                    this.props.setDemandProfile("filename", dp.config_filename ? dp.config_filename : "");
                }
            });
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return typeof nextProps.entryPoint !== 'undefined';
    }
    render() {
        let portslist = [];
        if (this.props.entryPoint && this.props.entryPoint.NodePorts) {
            portslist = this.props.entryPoint.NodePorts.map((port) => {
                return '' + port + ' ';
            });
        }
        let entryPointName = this.props.entryPoint && this.props.entryPoint.name ? this.props.entryPoint.name : '';
        return (
            <div className="form-post row with-border">
                <div style={{ background: "#44474f", textAlign: "center", padding: "47px 0", lineHeight: "19px", fontSize: "12px"}}>
                    <span className="dp-alerts"></span>
                    <label style={{fontSize: "14px", color:"#FFFFFF"}}>IMPORTANT</label>
                    <span style={{display: "block",marginTop:"15px"}}>To properly test, make sure your load config file includes the proper entry point listed below:</span>
                    <span style={{color: "#5fdae0"}}>Entry Point:</span> <span>{entryPointName} / port {portslist}</span>
                </div>
                <span style={{display: "block", marginTop: "15px"}} className="label-holder">
                    <label htmlFor="name">Upload Kubeconfig File</label>
                </span>
                <div className="col validate-item validate-row">
                    <div className="input-holder" style={{position:"relative"}}>
                        <input className="required" type="text" id="config-file-name" placeholder="please upload your config yaml file." style={{width: "82%"}}  disabled value={this.state.filename}/>
                        <div className="select-kubeconfig-file">
                            <label htmlFor="file-upload" className="import-yaml-file">
                               <span className="icon-plus"></span> Upload Config
                            </label>
                            <input type="file" id="file-upload" className="input-file" />
                        </div>
                    </div>
                </div>
                <div className="alert-input validate-item">
                    <label className="alert-input-label" htmlFor="load-[2-1]" style={{float: "left", position: "relative", top: "7px", marginRight: "15px", width: "195px"}}>Generate load for up to <span className="generate-load">{Number(this.state.generateLoad) / 60}</span> minutes.</label>
                    <div className="alert-input-holder">
                        <input className="flex-col" type="range" value={this.state.generateLoad} min="300" max="1200" step="60" onChange={this.changeLoad.bind(this)}/>
                        <div className="range-scale scale">
                            <div style={{marginLeft:'6px'}}>
                                <div></div>
                                <div>|</div>
                                <div>|</div>
                                <div>|</div>
                                <div>|</div>
                            </div>
                            <div style={{position:"relative",left:"-5px"}}>
                                <div></div>
                                <div>|</div>
                                <div>|</div>
                                <div>|</div>
                                <div>|</div>
                            </div>
                            <div style={{marginRight:'6px',position:"relative",right:"8px"}}>
                                <div></div>
                                <div>|</div>
                                <div>|</div>
                                <div>|</div>
                                <div>|</div>
                            </div>
                        </div>
                        <div className="range-scale">
                            <div style={{marginLeft:'6px'}}>5</div>
                            <div>
                                <span style={{float:"left",marginLeft:"-8px"}}>10</span><span style={{float:"right",marginRight:"-3px"}}>15</span>
                            </div>
                            <div style={{marginRight:'6px'}}>
                                <span style={{float:"right"}}>20</span>
                            </div>
                        </div>
                    </div>
                </div>
                <HintField
                    title="Load Config and Duration"
                    message="Please upload your Kubeconfig file and select a maximum duration for dry run testing."
                />
            </div>
        )
    }
}

/**
* Section button submit
**/
class SectionButtonSubmit extends React.Component {
    constructor (props) {
        super(props);
    }
    saveDemandProfile (event) {
        event.preventDefault();
        this.props.saveDemandProfile();
    }
    deleteDemandProfile (event) {
        event.preventDefault();
        this.props.deleteDemandProfile();
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let display = this.props.demandProfileCount <= 1 ? 'none' : '';
        return (
            <div className="row">
                <input type="submit" className="btn-default" defaultValue="Save" onClick={this.saveDemandProfile.bind(this)}/>
                <input style={{"display": display}}type="submit" className="btn-default" defaultValue="Delete" onClick={this.deleteDemandProfile.bind(this)}/>
            </div>
        )
    }
}

/**
* Content
**/
class Content extends React.Component {
    constructor (props) {
        super(props);
        this.state = {id: NewAppStore.getDPID(), name: '', desc: '', duration: 300, yaml: '', filename: ''};
        this.addDemandProfile = this.addDemandProfile.bind(this);
    }
    setDemandProfile (key, value) {
        this.state[key] = value;
    }
    saveDemandProfile () {
        let name = this.state.name;
        let desc = this.state.desc;
        let dura = this.state.duration;
        let dpid = this.state.id;
        let yaml = this.state.yaml;
        let filename = this.state.filename;
        let appid = this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.app_id ? this.props.topologyView.rawData.app_id : '';
        if (appid == '' || name == '' || dpid == 0) {
            console.log("Can not save Demand Profile!");
        } else {
            let data = {"name": name, "description": desc, "load_duration": dura, "config": yaml, "config_filename": filename};
            $.ajax({ url: "/api/openview/api/v1/app/" + appid + "/demand-profiles/" + dpid,
                     method: 'PUT',
                     contentType: "application/json",
                     data: JSON.stringify(data),
                     dataType: "json",
                     complete: function(e, xhr, settings) {
                         if (e.status === 200){
                             console.log("update Demand Profile:[" + dpid + "] success.");
                             NewAppStore.setDPID(dpid);
                             NewAppStore.getDemandProfile();
                         } else {
                             console.log("update Demand Profile : [" + dpid + "] failed (" + e.status + ").")
                         }
                     }
            });
        }
    }
    componentWillReceiveProps (nextProps) {
        this.state.id = NewAppStore.getDPID();

        let app_dmdProfile = nextProps.topologyView && nextProps.topologyView.rawData && nextProps.topologyView.rawData.app_dmdProfile ? nextProps.topologyView.rawData.app_dmdProfile : [];
        let dp = {};
        if (this.state.id == 0 && app_dmdProfile.length != 0) {
            //already have at least one demand profile
            dp = app_dmdProfile[0];
        }
        if (this.state.id > 0 && app_dmdProfile.length > 0) {
            app_dmdProfile.some((d) => {
                if (d.id == this.state.id) {
                    dp = d;
                }
            });
        }
        if (Object.keys(dp).length > 0) {
            NewAppStore.setDPID(dp.id);
            this.setState({id: dp.id});
            this.setState({name: dp.name});
            this.setState({desc: dp.description});
            this.setState({duration: dp.load_duration});
            this.setState({yaml: dp.config ? dp.config : ""});
            this.setState({filename: dp.config_filename ? dp.config_filename : ""});
        }

    }
    deleteDemandProfile () {
        let dpid = this.state.id;
        let appid = this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.app_id ? this.props.topologyView.rawData.app_id : '';
        if (appid == '' || dpid == 0) {
            console.log("Can not delete Demand Profile!");
        } else {
            $.ajax({ url: "/api/openview/api/v1/app/" + appid + "/demand-profiles/" + dpid,
                     method: 'DELETE',
                     contentType: "application/json",
                     complete: function(e, xhr, settings) {
                         if (e.status === 200){
                             console.log("Delete Demand Profile:[" + dpid + "] success.");
                             NewAppStore.getDemandProfile();
                             NewAppStore.setDPID(0);
                         } else {
                             console.log("Delete Demand Profile : [" + dpid + "] failed (" + e.status + ").")
                         }
                     }
            });
        }
    }
    addDemandProfile () {
        let appid = this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.app_id ? this.props.topologyView.rawData.app_id : '';
        if (appid == '') {
            console.log("Can not add new Demand Profile!");
        } else {
            let _self = this;
            let data = {"name": 'new demand profile', "description": '', "load_duration": 300, "config_filename": ""};
            $.ajax({ url: "/api/openview/api/v1/app/" + appid + "/demand-profiles",
                     method: 'POST',
                     contentType: "application/json",
                     data: JSON.stringify(data),
                     dataType: "json",
                     complete: function(e, xhr, settings) {
                         if (e.status === 201){
                             let dpid = JSON.parse(e.responseText).id;
                             console.log("add Demand Profile:[" + dpid + "] success.");
                             NewAppStore.setDPID(dpid);
                             NewAppStore.getDemandProfile();
                             _self.setState({filename: ""});
                             $('#file-upload').val('').attr('type','').attr('type','file');
                         } else {
                             console.log("add Demand Profile failed (" + e.status + ").")
                         }
                     }
            });
        }
    }
    componentDidMount () {
        $("#addNewDemandProfile").on('click', this.addDemandProfile);
    }
    componentWillUnmount () {
        $("#addNewDemandProfile").off('click', this.addDemandProfile);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div className="newapp-slide-content">
                <div className="wrap-area">
                    <div className="demand-form">
                        <SectionName name={this.state.name} desc={this.state.desc} setDemandProfile={this.setDemandProfile.bind(this)} demandProfileID={this.state.id}/>
                        {/*<SectionDurationForDemand />
                        <SectionTrafficPattern />
                        <SectionTrafficVolume />
                        <SectionCustomizeRequestPattern />
                        <SectionTestingURLs />
                        <SectionTrafficSources />*/}
                        <ConfigFile updateEditCodeContent={this.props.updateEditCodeContent.bind(this)}
                        entryPoint={this.props.topologyView && this.props.topologyView.entryPoint ? this.props.topologyView.entryPoint : {}}
                        setDemandProfile={this.setDemandProfile.bind(this)} dmdProfile={this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.app_dmdProfile ? this.props.topologyView.rawData.app_dmdProfile : []} duration={this.state.duration} demandProfileID={this.state.id} filename={this.state.filename} />
                        <SectionButtonSubmit saveDemandProfile={this.saveDemandProfile.bind(this)} deleteDemandProfile={this.deleteDemandProfile.bind(this)} demandProfileCount={this.props.topologyView && this.props.topologyView.rawData && this.props.topologyView.rawData.app_dmdProfile ? this.props.topologyView.rawData.app_dmdProfile.length : 0}/>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* Demand profile
**/
export default class DemandProfile extends React.Component {
    constructor (props) {
        super(props);
    }
    /**
    * component did mount
    **/
    componentDidMount() {
        var tabs = document.querySelectorAll(".demand-profile ["+DATATAB.defaults.attrb+"]");
        DATATAB.event.init(tabs);
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
            return (
            <div className="application-data demand-profile">
                <ButtonArea icon="icon-switch-new" title="Demand Profile" titleClass="new-application" additionalButtons={[{title:"+ Add New",className:"btn-default",id:"addNewDemandProfile",position:"left"}]}/>
                <Content updateEditCodeContent={this.props.updateEditCodeContent.bind(this)} topologyView={this.props.topologyView} />
            </div>
            )
      }
}
