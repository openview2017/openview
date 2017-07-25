import { Dispatcher } from 'flux';

/**
* DashboardDispatcherClass
* dashboard dispatcher with actions responding to view
*/
class DashboardDispatcherClass extends Dispatcher {

	handleViewAction(action) {
		this.dispatch({
			source: 'VIEW_ACTION',
			action: action
		})
	}

}

const DashboardDispatcher = new DashboardDispatcherClass();

export default DashboardDispatcher;