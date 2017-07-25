import DashboardDispatcher from '../dispatcher/DashboardDispatcher'
import { DashboardConstants } from '../constants/DashboardConstants'

// Performance metrics actions

/**
* getLearnMoreLive
*/
export function getLearnMoreLive(data) {
	DashboardDispatcher.handleViewAction({
		actionType: DashboardConstants.GET_LEARN_MORE_LIVE,
		data:data
	});
}

/**
* getLearnMoreHistorical
*/
export function getLearnMoreHistorical(data) {
	DashboardDispatcher.handleViewAction({
		actionType: DashboardConstants.GET_LEARN_MORE_HISTORICAL,
		data:data
	});
}

/**
* getLearnMoreLive
*/
export function setDataLive(type) {
	DashboardDispatcher.handleViewAction({
		actionType: DashboardConstants.SET_DATA_LIVE,
		type:type
	});
}