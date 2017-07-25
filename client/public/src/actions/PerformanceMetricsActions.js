import PerformanceMetricsDispatcher from '../dispatcher/PerformanceMetricsDispatcher'
import { PerformanceMetricsConstants } from '../constants/PerformanceMetricsConstants'

// Performance metrics actions

/**
* finishEdit
*/
export function finishEdit() {
	PerformanceMetricsDispatcher.handleViewAction({
		actionType: PerformanceMetricsConstants.FINISH_EDIT
	});
}

/**
* editMetric
*/
export function editMetric() {
	PerformanceMetricsDispatcher.handleViewAction({
		actionType: PerformanceMetricsConstants.EDIT_METRIC
	});
}

/**
* saveMetric
*/
export function saveMetric(item) {
	PerformanceMetricsDispatcher.handleViewAction({
		actionType: PerformanceMetricsConstants.SAVE_METRIC,
		item: item
	});
}

/**
* removeMetric
*/
export function removeMetric(index) {
	PerformanceMetricsDispatcher.handleViewAction({
		actionType: PerformanceMetricsConstants.REMOVE_METRIC,
		index:index
	});
}

/**
* expandedView
*/
export function expandedView(type,data) {
	PerformanceMetricsDispatcher.handleViewAction({
		actionType: PerformanceMetricsConstants.EXPANDED_VIEW,
		type:type,
		data:data
	});
}