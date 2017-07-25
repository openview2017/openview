import { EventEmitter } from 'events';
import PerformanceMetricsDispatcher from '../dispatcher/PerformanceMetricsDispatcher'
import { PerformanceMetricsConstants } from '../constants/PerformanceMetricsConstants'

const CHANGE_EVENT = 'change';

/**
* Performance metrics Store default data
**/
let _performanceMetricsStore = {
    data:[
    	{id:"metric1", title:"Memory", summary:"124", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric2", title:"CPU", summary:"32%", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric3", title:"Network", summary:"1,242 kb/s", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric4", title:"Disk I/O", summary:"124", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric5", title:"Projected Cost Per Month", summary:"124", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric6", title:"Projected Cost Per Month", summary:"124", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric7", title:"Projected Cost Per Month", summary:"124", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]},
    	{id:"metric8", title:"Projected Cost Per Month", summary:"124", graph:[2, 2, 2, 2, 2.5, 2, 2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2]}
    ],
    searchFilters: [
    	{id:"keyword_search",name:"Keyword Search",type:"input",default:""},
    	{id:"target_namespace",name:"Target Namespace",type:"input",default:"acmeair"},
    	{id:"target_pod",name:"Target Pod",type:"select",default:"web-rc"},
    	{id:"target_container",name:"Target Container",type:"select",default:"web"},
    	{id:"measurement_type",name:"Measurement Type",type:"select",default:"Memory"},
    	{id:"function_type",name:"Function Type",type:"select",default:"max"}
    ],
    searchItems:[
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"},
    	{namespace:"acmeair/web-rc/web",name:"mem_total_inactive_file_max"}
    ],
    expandedData: [],
    expandedView: false,
    editing: false
}

// Define the public event listeners and getters that
// the views will use to listen for changes and retrieve
// the store
class PerformanceMetricsStoreClass extends EventEmitter {

	addChangeListener(cb) {
		this.on(CHANGE_EVENT, cb);
	}

	removeChangeListener(cb) {
		this.removeListener(CHANGE_EVENT, cb);
	}

    getPerformanceMetricsData() {
        return _performanceMetricsStore;
    }

}

// Initialize the singleton to register with the
// dispatcher and export for React components
const PerformanceMetricsStore = new PerformanceMetricsStoreClass();


// Register each of the actions with the dispatcher
// by changing the store's data and emitting a
// change
PerformanceMetricsDispatcher.register((payload) => {
	const action = payload.action;

	switch(action.actionType) {
		case PerformanceMetricsConstants.FINISH_EDIT:
			_performanceMetricsStore.editing = false;
			PerformanceMetricsStore.emit(CHANGE_EVENT);
		break;
		case PerformanceMetricsConstants.EDIT_METRIC:
			_performanceMetricsStore.editing = true;
			PerformanceMetricsStore.emit(CHANGE_EVENT);
		break;
		case PerformanceMetricsConstants.SAVE_METRIC:
			_performanceMetricsStore.data.push(action.item);
			PerformanceMetricsStore.emit(CHANGE_EVENT);
		break;
		case PerformanceMetricsConstants.REMOVE_METRIC:
			_performanceMetricsStore.data = _performanceMetricsStore.data.filter((item,index) => {
				return index !== action.index;
			});
			PerformanceMetricsStore.emit(CHANGE_EVENT);
		break;
		case PerformanceMetricsConstants.EXPANDED_VIEW:
			_performanceMetricsStore.expandedData = action.data
			_performanceMetricsStore.expandedView = action.type
			PerformanceMetricsStore.emit(CHANGE_EVENT);
		break;
		default:
			return true;
	}

})

export default PerformanceMetricsStore;