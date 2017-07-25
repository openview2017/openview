import { Dispatcher } from 'flux';

/**
* PerformanceMetricsDispatcherClass
* performance metrics dispatcher with actions responding to view
*/
class PerformanceMetricsDispatcherClass extends Dispatcher {

	handleViewAction(action) {
		this.dispatch({
			source: 'VIEW_ACTION',
			action: action
		})
	}

}

const PerformanceMetricsDispatcher = new PerformanceMetricsDispatcherClass();

export default PerformanceMetricsDispatcher;