import React from 'react'
import { render } from 'react-dom'

import { Router, Route, IndexRoute, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'

import MainLayout, { ContentWithHeader, ContentWithSideBar } from './Layouts'
import Home from '../views/Home/Home'
import Signin from '../views/Signin/Signin'
import Network from '../views/Network/Network'
import NewApp from '../views/NewApp/NewApp'
import Dashboard from '../views/Dashboard/Dashboard'
import Topology from '../views/Dashboard/Topology'
import NetTopology from '../views/Dashboard/NetTopology'
import Distribution from '../views/Dashboard/Distribution'
import CloudConfig from '../views/Dashboard/CloudConfig'
import PerformanceMetrics from '../views/Dashboard/PerformanceMetrics'
import NotFound from '../views/NotFound/NotFound'


/**
* history
**/
const history = useRouterHistory(createHashHistory)({ queryKey: false })

/**
* App
**/
export default class App extends React.Component {

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		return (
			<Router history={history}>
				<Route path='/' component={MainLayout}>
					<IndexRoute component={Signin} />
					<Route component={ContentWithSideBar}>
				    	<Route path='newapp' component={NewApp} />
				    	<Route path='dashboard' component={Dashboard}/>
				    	<Route path='performance_metrics' component={PerformanceMetrics}/>
						<Route path='topology' component={Topology}/>
						<Route path='distribution' component={Distribution}/>
						<Route path='net_topology' component={NetTopology}/>
						<Route path='cloud_config' component={CloudConfig}/>
				  	</Route>
					<Route component={ContentWithHeader}>
				    	<Route path='home' component={Home}/>
						<Route path='network' component={Network}/>
						<Route path='*' component={NotFound} />
				  	</Route>
			  	</Route>
			</Router>
		)
	}
}
