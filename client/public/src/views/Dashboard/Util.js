import React from 'react'
import { Link } from 'react-router'
//import { persistenceData } from '../../constants/ConfigConstants'

import './dashboard.css'
//import '../../libs/vis.min.js'
import DashboardStore from '../../stores/DashboardStore'

/**
* LetfSideBar
*/
export class LeftSideBar extends React.Component {
    constructor (props) {
        super(props);
    }
    componentWillMount() {
        let url_params = utils.getUrlParams();
        let selected_app = !$.isEmptyObject(url_params) && typeof(url_params.app) === "string" ? url_params.app : "";
        DashboardStore.setAppID(selected_app);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        var app_name = DashboardStore.getAppID();

        return (
            <aside id="sidebar">
                <section className="widget">
                    <div className="carousel">
                        <div className="mask">
                            <div className="slideset"></div>
                        </div>
                        <div className="paging-and-btns">
                            <div className="paging"></div>
                            <a href="javascript:;" className="btn-prev"><span>Previous</span></a>
                            <a href="javascript:;" className="btn-next"><span>Next</span></a>
                        </div>
                    </div>
                    <span className="btn-holder">
                        <Link to="home" className="btn-back">Back</Link>
                    </span>
                </section>
                <nav className="sidenav">
                    <span className="heading">Main Menu</span>
                    <ul className="accordion">
                        <li className={this.props.pageName === 'dashboard' ? 'active' : ''}>
                            <Link to={"dashboard?app="+app_name} className="dashboard">Dashboard</Link>
                        </li>
                        <li className={this.props.pageName === 'performance_metrics' ? 'active' : ''}>
                            <Link to={"performance_metrics?app="+app_name} className="performance_metrics">Performance Metrics</Link>
                        </li>
                        <li className={this.props.pageName === 'topology' ? 'active' : ''}>
                            <Link to={"topology?app="+app_name} className="app-topology opener">Application Topology</Link>
                        </li>
                        <li className={this.props.pageName === 'net_topology' ? 'active' : ''}>
                            <Link to={"net_topology?app="+app_name} className="net-topology opener">Network Topology</Link>
                        </li>
                        <li className={this.props.pageName === 'distribution' ? 'active' : ''}>
                            <Link to={"distribution?app="+app_name} className="container-dist opener">Pod Distribution</Link>
                        </li>
                        <li className={this.props.pageName === 'cloud_config' ? 'active' : ''}>
                            <Link to={"cloud_config?app="+app_name} className="cloud-config opener">Cloud Configurations</Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        )
    }
    componentDidMount() {
        let selected_app = DashboardStore.getAppID();
        let appFound = false;
        let appTemplate = "";
        let appCount = 0;

        $.getJSON("/api/openview/api/v1/apps/" + selected_app, (app) => {
            if(app.status && app.status.phase == "launched" && app.id == selected_app) {
                DashboardStore.setAppList([app]);
                var active_app = "active";
                appFound = true;
                var slideHeading = "";
                if(typeof app.logo != "undefined" || $.trim(app.logo)!="") {
                    var imageStyle = "width:184px";
                    slideHeading = "<img src='"+$.trim(app.logo)+"' style='"+imageStyle+"' />"
                } else {
                    slideHeading = '<span class="slide-heading">'+app.name+'</span>';
                }

                appTemplate = `<div class="slide `+active_app+`" app="`+app.name+`">
                                    <div class="chart-holder app"></div>
                                    <div class="text-detail">
                                        `+slideHeading+`
                                        <p>LAST 30 MIN AVG RESPONSE TIME - <span class="live_point">N/A</span></p>
                                        <span class="indicator good">good</span>
                                    </div>
                               </div>`;

                document.getElementById("sidebar").getElementsByClassName("slideset")[0].innerHTML = appTemplate;
            }
            if (appFound) {
                initCarousel();
                DashboardStore.setAppList([app]);
            } else {
                window.location.hash = 'home';
            }
        });


            // $("#sidebar section.widget .carousel .paging-and-btns>a").click(function(e){
            //     var slidePos = $(this).parent().find(".paging ul li.active a").text();
            //     var appLink = $(this).parents(".carousel").find(".slideset .slide:nth-child("+slidePos+")").attr("app");
            //     window.location.href = '?app='+appLink;
            // })

            // $("#sidebar section.widget .carousel .paging-and-btns ul li").click(function(e){
            //     var slidePos = $(this).find("a").text();
            //     var appLink = $(this).parents(".carousel").find(".slideset .slide:nth-child("+slidePos+")").attr("app");
            //     window.location.href = '?app='+appLink;
            // })
    }
}
