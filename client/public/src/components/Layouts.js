import React from 'react'
import Header from './Header'

/**
* Content with header
*/
export class ContentWithHeader extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return (
			<div>
				<Header />
		    	<Content>
		    		{this.props.children}
		    	</Content>
			</div>
		)
	}
}

/**
* Content without header
*/
export class Content extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return (
	    	<div id="content">
	    		{this.props.children}
	    	</div>
		)
	}
}

/**
* Right content
*/
export class RightContent extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return (
    	<div id="right-content">
    		{this.props.children}
    	</div>
		)
	}
}

/**
* Sidebar
*/
export class SideBar extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return(
			<div id="sidebar">
				{this.props.children}
			</div>
		)
	}
}

/**
* Sidebar top section
*/
export class SideBarTopSection extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return(
			<section className="widget">
				{this.props.children}
			</section>
		)
	}
}

/**
* Sidebar navigation section
*/
export class SideBarNavSection extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return(
			<div className="sidenav-area">
				<div className="sidenav">
					{this.props.children}
				</div>
			</div>
		)
	}
}

/**
* Content with sidebar
*/
export class ContentWithSideBar extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return (
			<div>
				<Header />
		    	<div id="main" role="main">
		    		{this.props.children}
		    	</div>
			</div>
		)
	}
}

/**
* Main layout
*/
export default class MainLayout extends React.Component{

	/**
    * render
    * @return {ReactElement} markup
    */
	render(){
		return (
			<div id="app">
				{this.props.children}
      		</div>
		)
	}
}