import React from 'react'
import { render } from 'react-dom'
import App from './components/Router'

import './utils/mapbox.js'
//import './libs/utils.js'

import './main.css'
import './select.css'
//import './libs/mapbox/mapbox.css'

/**
* render
* @return {ReactElement} markup
*/
render(<App />,document.getElementById('wrapper'));
