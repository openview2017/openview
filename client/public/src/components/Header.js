import React from 'react'
import { Link } from 'react-router'

/**
* notificationContent
*/
let notificationContent = `<div id="notification">
    <div class="main-container">
        <header class="notification-header">
            <span>Alerts & Recommendations</span>
            <div class="close"></div>
        </header>
        <div class="notification-content">
            <div class="map-timeline-wrapper"></div>
            <div class="notification-list">
                <form action="#" class="alerts-holder">
                    <div class="form-elements">
                        <div class="select-area">
                            <select class="inner2">
                                <option>All Applications</option>
                                <option>Lexis Systems</option>
                                <option>ACMEAIR</option>
                                <option>Scratch.io</option>
                                <option>BusyBox</option>
                                <option>Study Pool</option>
                                <option>La Mienne</option>
                                <option>MailFin</option>
                                <option>Tool Locker</option>
                            </select>
                        </div>
                        <span class="label-choice">for</span>
                        <div class="select-area second">
                            <select class="inner2">
                                <option>Last 1 Month</option>
                                <option>Last 2 Months</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>
                        <div class="checkbox-area">
                            <input type="checkbox" id="history" checked="checked">
                            <label for="history">Include History</label>
                        </div>
                    </div>
                    <ul class="accordion"></ul>
                </form>
            </div>
        </div>
    </div>
</div>`;

/**
* Header navigation links
*/
class HeaderNavLink extends React.Component{

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        let isActive = this.context.router.isActive(this.props.to, true),
            className = isActive ? "active" : "";

        return (
            <li className={className}>
                <Link {...this.props}>
                    {this.props.children}
                </Link>
            </li>
        );
    }
}

/**
* Set header navigation link context type
*/
HeaderNavLink.contextTypes = {
    router: React.PropTypes.object.isRequired
};

/**
* Header logo
*/
class HeaderLogo extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div className="logo">
                <Link to="home"> <img src="./themes/openview/images/logo444.png" height="29" width="123" alt="Huawei" /> </Link>
            </div>
        )
    }
}

/**
* Header navigation
*/
class HeaderNav extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <nav id="nav">
                <ul>
                    <HeaderNavLink to="home">APPLICATIONS</HeaderNavLink>
                    {/*<HeaderNavLink to="network">NETWORK</HeaderNavLink>*/}
                </ul>
            </nav>
        )
    }
}

/**
* Header notification
*/
class HeaderNotification extends React.Component {

    /**
    * componentDidMount
    * @return notification markup
    */
    componentDidMount() {
        jQuery(notificationContent).insertAfter('#app');

        var timelineHasLoaded = false;

        // initialize slideout
        var slideout = new Slideout({
            'panel': document.getElementById('app'),
            'menu': document.getElementById('notification'),
            'side': 'right',
            'padding': $('#app').width() - 60,
            'tolerance': 70
        });
        slideout.on('open', function () {
            // map timeline
            if (!timelineHasLoaded) {
                timelineHasLoaded = true;
                $('.map-timeline-wrapper').timeline();
                $('#notification .notification-list').jScrollPane();
            }
        });

        $('#app .notification').click(function () {
          console.log("notification");
            slideout.toggle();
        });

        $('#notification .close').click(function () {
            slideout.close();
        });

        $(window).resize(function () {
            slideout.close();
        });
    }

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div className="notification">
                <a className="ico"><span className="notif-count"></span></a>
                <div className="message">Needs Attention!</div>
            </div>
        )
    }
}

/**
* Header profile
*/
class HeaderProfile extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div className="profile">
                <a href="#">
                    <div className="img-holder">
                        <img src="themes/openview/images/photo32.png" alt="image description" />
                    </div>
                    <div className="name icon-angle-down">
                        Bowen Zhang
                    </div>
                </a>

                <div className="drop-down">
                    <nav className="drop">
                        <ul>
                            <li><Link to="/">Account Settings</Link></li>
                            <li><Link to="/">Logout</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        )
    }
}

/**
* Header
*/
export default class Header extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <header id="header">
                <div className="header-holder">
                    <HeaderLogo />
                    <HeaderNav />
                </div>
                <div className="profile-block">
                    <HeaderNotification />
                    <HeaderProfile />
                </div>
            </header>
        )
    }
}
