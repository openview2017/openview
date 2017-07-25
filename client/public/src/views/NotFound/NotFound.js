import React from 'react'

/**
* NotFound
**/
export default class NotFound extends React.Component {

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {

		let styles = {
			color: '#FFFFFF',
			padding: '10px'
		};

		return (
			<h2 style={styles}>Error 404. Page not found..</h2>
		)
	}
}
