/*! timeline - v0.0.1 */
;( function($) {

		$.fn.timeline = function(options) {
			
			// global variables
			var map,  
			aMapMarkers = [], 
			aDataPoints = [],
			aMarkers = [],
			aBarGraphData = [], // graph data
			aExcludedMarker = [],
			aMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // months
			barGraphWidth = 0, // bar width in graph
			barGraphSpacing = 1, // bar spacing
			pointer = 0,
			sliderTimer,
			sliderMultiplier = 25,
			resetSliderPlayback = false,
			_1DAY = 86400, // seconds in a day
			timelineToday = Math.round(+new Date()/1000); // today's unix timestamp
			
			var settings = $.extend({
				basePath: null,
				mapZoom : 2,
				mapMarkerIconSize : 25,
				mapBoxId : "chersh87.c6f33883",
				mapToken : "pk.eyJ1IjoiY2hlcnNoODciLCJhIjoiY2lndndqNnNmMHJ2ZXc3bTU3YTMxZmIxMiJ9.TGBGfYTwYWiD-HRqLSm_rA",
				mapLatitude: 21.943602,
				mapLongitude: 24.498259,
				data: {
					'start': timelineToday-(30*_1DAY),
					'end': timelineToday,
					'duration' : 60, // playback duration in seconds
					'events': [
						 {'lat': 42.423559, 'lng': -122.105213, 'timestamp' : timelineToday-(29*_1DAY), 'type' : 'performance'},
						 {'lat': 29.842077, 'lng': -98.553262, 'timestamp' : timelineToday-(28.5*_1DAY), 'type' : 'optimization'},
						 {'lat': 40.581236, 'lng': 140.877157, 'timestamp' : timelineToday-(28*_1DAY), 'type' : 'security'},
						 {'lat': 38.725910, 'lng': 116.139740, 'timestamp' : timelineToday-(28*_1DAY), 'type' : 'performance'},  
						 {'lat': 42.223559, 'lng': -121.105213, 'timestamp' : timelineToday-(27.5*_1DAY), 'type' : 'fault'},
						 {'lat': 29.842077, 'lng': -99.553262, 'timestamp' : timelineToday-(27*_1DAY), 'type' : 'security'},
						 {'lat': 41.542687, 'lng': 86.731402, 'timestamp' : timelineToday-(27*_1DAY), 'type' : 'performance'},
						 {'lat': 31.690634, 'lng': 121.125204, 'timestamp' : timelineToday-(26.5*_1DAY), 'type' : 'security'},
						 {'lat': 42.423559, 'lng': -123.105213, 'timestamp' : timelineToday-(25*_1DAY), 'type' : 'optimization'},
						 {'lat': -29.242139, 'lng': 148.418310, 'timestamp' : timelineToday-(24.5*_1DAY), 'type' : 'fault'},
						 {'lat': 42.923559, 'lng': -122.105213, 'timestamp' : timelineToday-(23.5*_1DAY), 'type' : 'optimization'},
						 {'lat': 31.190634, 'lng': 121.125204, 'timestamp' : timelineToday-(23.5*_1DAY), 'type' : 'performance'},
						 {'lat': 40.825910, 'lng': 114.439740, 'timestamp' : timelineToday-(23*_1DAY), 'type' : 'security'},
						 {'lat': 38.225910, 'lng': 116.239740, 'timestamp' : timelineToday-(22.5*_1DAY), 'type' : 'fault'},
						 {'lat': 31.290634, 'lng': 121.125204, 'timestamp' : timelineToday-(22*_1DAY), 'type' : 'optimization'},
						 {'lat': 31.190634, 'lng': 122.125204, 'timestamp' : timelineToday-(22*_1DAY), 'type' : 'performance'},
						 {'lat': -29.242139, 'lng': 148.918310, 'timestamp' : timelineToday-(21.5*_1DAY), 'type' : 'performance'},
						 {'lat': 40.581308, 'lng': -79.571162, 'timestamp' : timelineToday-(21*_1DAY), 'type' : 'security'},
						 {'lat': 37.125910, 'lng': 139.852281, 'timestamp' : timelineToday-(20.5*_1DAY), 'type' : 'performance'},
						 {'lat': 41.423559, 'lng': -122.805213, 'timestamp' : timelineToday-(20.5*_1DAY), 'type' : 'security'},
						 {'lat': 29.642077, 'lng': -98.553262, 'timestamp' : timelineToday-(19.5*_1DAY), 'type' : 'performance'},
						 {'lat': 31.220634, 'lng': 122.125204, 'timestamp' : timelineToday-(19*_1DAY), 'type' : 'security'},
						 {'lat': 40.181308, 'lng': -78.571162, 'timestamp' : timelineToday-(18*_1DAY), 'type' : 'optimization'},
						 {'lat': 31.390634, 'lng': 121.725204, 'timestamp' : timelineToday-(17.5*_1DAY), 'type' : 'optimization'}, 
						 {'lat': 40.825910, 'lng': 114.339740, 'timestamp' :timelineToday-(16*_1DAY), 'type' : 'optimization'},
						 {'lat': 40.825910, 'lng': 114.139740, 'timestamp' :timelineToday-(16.1*_1DAY), 'type' : 'fault'},
						 {'lat': 40.825910, 'lng': 114.439740, 'timestamp' : timelineToday-(16.2*_1DAY), 'type' : 'fault'}, 
						 {'lat': 37.925910, 'lng': 139.852281, 'timestamp' : timelineToday-(16.3*_1DAY), 'type' : 'performance'},
						 {'lat': 38.225910, 'lng': 116.139740, 'timestamp' : timelineToday-(15.5*_1DAY), 'type' : 'optimization'}, 
						 {'lat': -29.542139, 'lng': 148.418310, 'timestamp' : timelineToday-(15.5*_1DAY), 'type' : 'security'},
						 {'lat': 29.542077, 'lng': -98.253262, 'timestamp' : timelineToday-(15.5*_1DAY), 'type' : 'performance'},
						 {'lat': 40.881308, 'lng': -79.571162, 'timestamp' : timelineToday-(15*_1DAY), 'type' : 'optimization'},
						 {'lat': 36.925910, 'lng': 116.339740, 'timestamp' : timelineToday-(15*_1DAY), 'type' : 'security'},
						 {'lat': 38.225910, 'lng': 116.119740, 'timestamp' : timelineToday-(14.5*_1DAY), 'type' : 'security'}, 
						 {'lat': 40.925910, 'lng': 116.339740, 'timestamp' : timelineToday-(14.5*_1DAY), 'type' : 'performance'},   
						 {'lat': 37.882749, 'lng': 139.852281, 'timestamp' : timelineToday-(14.5*_1DAY), 'type' : 'security'},
						 {'lat': 27.842077, 'lng': -98.553262, 'timestamp' : timelineToday-(14.5*_1DAY), 'type' : 'fault'},
						 {'lat': 41.542687, 'lng': 86.231402, 'timestamp' : timelineToday-(14*_1DAY), 'type' : 'optimization'},
						 {'lat': 41.542687, 'lng': 86.931402, 'timestamp' : timelineToday-(14*_1DAY), 'type' : 'security'},
						 {'lat': -29.742139, 'lng': 148.118310, 'timestamp' : timelineToday-(13.5*_1DAY), 'type' : 'performance'},
						 {'lat': 40.181308, 'lng': -79.471162, 'timestamp' : timelineToday-(12.5*_1DAY), 'type' : 'security'},
						 {'lat': 37.345910, 'lng': 139.622281, 'timestamp' : timelineToday-(12*_1DAY), 'type' : 'fault'},
						 {'lat': 23.603103, 'lng': 113.989285, 'timestamp' : timelineToday-(11.5*_1DAY), 'type' : 'optimization'}, 
						 {'lat': 28.842077, 'lng': -98.553262, 'timestamp' : timelineToday-(10*_1DAY), 'type' : 'performance'}, 
						 {'lat': 36.882749, 'lng': 139.852281, 'timestamp' : timelineToday-(9*_1DAY), 'type' : 'security'},
						 {'lat': 29.842077, 'lng': -98.553262, 'timestamp' : timelineToday-(8.5*_1DAY), 'type' : 'security'},
						 {'lat': 21.603103, 'lng': 113.989285, 'timestamp' : timelineToday-(8.5*_1DAY), 'type' : 'fault'},
						 {'lat': 40.425910, 'lng': 116.339740, 'timestamp' : timelineToday-(7*_1DAY), 'type' : 'performance'},
						 {'lat': 40.925910, 'lng': 116.539740, 'timestamp' : timelineToday-(6.5*_1DAY), 'type' : 'security'}, 
						 {'lat': 22.603103, 'lng': 113.989285, 'timestamp' : timelineToday-(6*_1DAY), 'type' : 'performance'},
						 {'lat': 41.542687, 'lng': 86.131402, 'timestamp' : timelineToday-(6*_1DAY), 'type' : 'fault'},
						 {'lat': 29.342077, 'lng': -98.053262, 'timestamp' : timelineToday-(4.5*_1DAY), 'type' : 'optimization'}, 
						 {'lat': 41.342687, 'lng': 86.931402, 'timestamp' : timelineToday-(4*_1DAY), 'type' : 'security'}, 
						 {'lat': -29.942139, 'lng': 148.418310, 'timestamp' : timelineToday-(3*_1DAY), 'type' : 'performance'}, 
						 {'lat': 40.981308, 'lng': -79.571162, 'timestamp' : timelineToday-(3*_1DAY), 'type' : 'security'},
						 {'lat': 41.542687, 'lng': 86.331402, 'timestamp' : timelineToday-(2.5*_1DAY), 'type' : 'optimization'},
						 {'lat': 40.525910, 'lng': 116.339740, 'timestamp' : timelineToday-(1.5*_1DAY), 'type' : 'optimization'}
					]
				}
			}, options);
			
			// getting the script basepath
			if (!settings.basePath) {
			  (function (name) {
			    var scripts = document.getElementsByTagName('script');
			
			    for (var i = scripts.length - 1; i >= 0; --i) {
			      var src = scripts[i].src;
			      var l = src.length;
			      var length = name.length;
			      if (src.substr(l - length) == name) {
			        // set a global propery here
			        settings.basePath = src.substr(0, l - length);
			
			      }
			    }
			  })("timeline.js");
			}
			
			// marker icons
			var markerIcons = function(type, isAnimated){
				
				isAnimated = isAnimated || false;
				
				switch(type){
					case "performance":
						if(isAnimated){
							return  L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-performance animated-icon"></div>'
							});
						}else{
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-performance"></div>'
							});
						}
						break;
					case "optimization":
						if(isAnimated){
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-cost-optimization animated-icon"></div>',
							});
						}else{
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-cost-optimization"></div>',
							});
						}
						break;
					case "security":
						if(isAnimated){
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-security animated-icon"></div>'
							});
						}else{
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-security"></div>'
							});
						}
						break;
					case "fault":
						if(isAnimated){
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-fault-tolerance animated-icon"></div>'
							});
						}else{
							return L.divIcon({
								iconSize : [settings.mapMarkerIconSize, settings.mapMarkerIconSize],
								iconAnchor: [15, 15],
								popupAnchor: [10, 0],
								shadowSize: [0, 0],
								className : '',
								html: '<div class="icon-fault-tolerance"></div>'
							});
						}
						break;
				}
				
			};
			
			// setting map height
			var setMapHeight = function(view) {
				var viewportHeight = $(window).height();
				
				var height = 127;
				
				view.css({height: viewportHeight - height});
				$(".map-timeline .map-display").css({height: viewportHeight - height});
				
				$(window).resize(function() {
					if($(".map-timeline").is(":visible"))
						setMapHeight(view);
				});
			};
			
			// set initial containers
			var setContainers = function(view) {
				
				// initalize container
				var mainContainer = '<div class="map-timeline">\
						<div class="map-display">\
							<div id="map-container"></div>\
						</div>\
						<div class="timeline-chart-display">\
							<div class="timeline-chart-holder"></div>\
						</div>\
						<div class="timeline-display">\
							<div class="switch-button"><button class="play-button"></button></div>\
							<div class="timeline-content">\
								<div class="slider-container"></div>\
								<div class="tick-container"></div>\
							</div>\
							<div class="date-counter"><span class="date-month"></span><span class="date-day">1</span></div>\
						</div>\
					<div>';
				view.html("").html(mainContainer);
				
				// parse event data
				parseData(view);
				
			};
			
			// parsing event data
			var parseData = function(view) {
				
				var hasError = false;
				
				if(aDataPoints.length == 0) {
					
					if(typeof settings.data == "undefined") {
						hasError = true;
						alert("Unable to find events data.");	
					}
					
					if(!hasError) {
						var secondsPerPoint = (settings.data.end - settings.data.start) / (settings.data.duration - 1);
						var timestampFrom = settings.data.start, timestampTo = 0;
						
						for(i=0; i < settings.data.duration; i++){
							
							timestampTo =  timestampFrom + secondsPerPoint;
							
							var pointCntr = 0, points = [];
							points= {timestamp:timestampFrom, data: []};
							$.each(settings.data.events, function(key, point) {
								
								if(point.timestamp > timestampFrom && point.timestamp <= timestampTo) {
									
									points.data.push(point);
									pointCntr++;
								}
								
							});
							
							aDataPoints.push(points);
							aBarGraphData.push(pointCntr);
							
							timestampFrom = timestampTo;
						}
					}
				}
				
				// if no errors
				if(!hasError){
				
					// set parent container and map height
					setMapHeight(view);
					
					// initailize map
					initializeMap(settings.mapLatitude, settings.mapLongitude);
					
					// initialize sliders
					initializeTimeline();
					
					// initialize chart
					initializeChart();
					
					//console.log(aDataPoints);
				}
			};
			
			// adding markers to map
			var addMarkerPoint = function(point, isAnimated){
				
				isAnimated = isAnimated || false;
				
				if(typeof aDataPoints[point] != "undefined" && typeof aDataPoints[point].data != "undefined") {
					
					var cnt;
					for(cnt=0; cnt < aDataPoints[point].data.length; cnt++) {
						
						var data = aDataPoints[point].data[cnt];
						switch(data.type){
							case "performance":
								iconType = markerIcons(data.type, isAnimated); //performanceIcon;
								break;
							case "optimization":
								iconType = markerIcons(data.type, isAnimated); //optimizationIcon;
								break;
							case "security":
								iconType = markerIcons(data.type, isAnimated); //securityIcon;
								break;
							case "fault":
								iconType = markerIcons(data.type, isAnimated); //faultToleranceIcon;
								break;
						}
						
						if(map) {
							
							if(indexOf.call(aExcludedMarker, data.type) == -1) {
								
								var markerName = data.type+"_"+data.timestamp; 
								
								// check if marker was not yet added
								if(indexOf.call(aMarkers, markerName) == -1){
									
									aMarkers.push(markerName);
									aMapMarkers[markerName] = L.marker([data.lat, data.lng], {
										icon : iconType
									}).addTo(map);
									
								}
							}
						}
					}
				}
			};
			
			// removing all markers in map
			var clearMapMarkers = function() {
				
				for(i=0;i<aMarkers.length;i++) {
					
					var markerName = aMarkers[i];
					map.removeLayer(aMapMarkers[markerName]);
				}
				aMarkers = [];
			};
			
			// get index of element in array
			var indexOf = function(needle) {
			    if(typeof Array.prototype.indexOf === 'function') {
			        indexOf = Array.prototype.indexOf;
			    } else {
			        indexOf = function(needle) {
			            var i = -1, index = -1;
			
			            for(i = 0; i < this.length; i++) {
			                if(this[i] === needle) {
			                    index = i;
			                    break;
			                }
			            }
			
			            return index;
			        };
			    }
			
			    return indexOf.call(this, needle);
			};
			
			// updating the chart display
			var updateChartDisplay = function(cnt) {

				var i = 0;
				var barColors = [];
				
				for(i=0; i <= cnt; i++)
					barColors[i] = '#51c5cb';
					
				//console.log(barColors);
				barColors = barColors.filter(function( element ) {
				   return !!element;
				});
				
				$(".timeline-chart-display .timeline-chart-holder").sparkline(aBarGraphData, {
				    type: 'bar',
				    barWidth: barGraphWidth,
				    barSpacing: barGraphSpacing,
				    height: 50,
				    barColor: '#4c4f57',
				    negBarColor: '#51c5cb',
				    chartRangeMin :0,
				    disableInteraction: true,
				    colorMap: barColors
				});
				
			};
			
			// update display
			var updateDisplay = function(cntr, isAnimated) {
				
				isAnimated = isAnimated || false;
				
				if(typeof aDataPoints[cntr] != "undefined") {
					
					// update chart display
					updateChartDisplay(cntr);
					
					// add marker on map
					addMarkerPoint(cntr, isAnimated);
				
					// create a new JavaScript Date object based on the timestamp
					// multiplied by 1000 so that the argument is in milliseconds, not seconds.
					var date = new Date( aDataPoints[cntr].timestamp * 1000); 
					
					// set month and date display
					$(".date-counter .date-month").text(aMonths[date.getMonth()]);
					$(".date-counter .date-day").text(date.getDate());
				}
			};
			
			var removeAnimation = function(){
				
				// removing animation
				$("#map-container div.animated-icon").each(function(){
					$(this).removeClass("animated-icon");
				});
			};
			
			// display months ticker in timeline
			var showSliderTick = function() {
				var content = "",
				firstData = true,
				left = 0;
				
				var viewportWidth = $(".slider-container").width();
				leftPixels = (viewportWidth / settings.data.duration);
				
				for(key in aDataPoints) {
					
					var date = new Date( aDataPoints[key].timestamp * 1000);
					if(firstData) {
						
						firstData = false;
						content +='<div class="horizontal-line left-end" data="{i:'+key+'}">\
							<div class="month">'+aMonths[date.getMonth()]+" "+date.getDate()+'</div>\
						</div>';
					}else {
						if((parseInt(key)+1) % 10 === 0){
							content +='<div class="horizontal-line" style="left:'+left+'px;" data="{i:'+key+'}">\
								<div class="month">'+aMonths[date.getMonth()]+" "+date.getDate()+'</div>\
							</div>';
						}
					}
					left += leftPixels;
				}
				
				// add ticker to the container
				$(".timeline-display .timeline-content .tick-container").html(content);
				
				// ticker event (onclick)
				$(".tick-container .horizontal-line").unbind("click").click(function() {
					
					var i, 
					data = eval('(' + $(this).attr("data") + ')'),
					sliderStep = 100 / (settings.data.duration-1);
					
					resetSliderPlayback = false;
					clearMapMarkers();
					removeAnimation();
					
					$('.slider-container').sGlide('startAt', sliderStep*data.i, true);

					//i = location;
					pointer = (data.i + 1) * sliderMultiplier;
					console.log(pointer);
					for(i = 0; i <= data.i; i++){
						// udapte display
						updateDisplay(i, false);
					}
				});
			};
			
			var initializeChart = function() {

				var parentWidth = $(".map-display").width();
				parentWidth -= 130; // padding to be subtracted
				
				var valueCount = aBarGraphData.length;
				barGraphWidth = Math.round((parentWidth - ( valueCount * barGraphSpacing) ) / valueCount);
				//barGraphWidth =(parentWidth - ( valueCount * barGraphSpacing) ) / valueCount;
				
				//console.log(barGraphWidth);
				
				$(".timeline-chart-display .timeline-chart-holder").sparkline(aBarGraphData, {
				    type: 'bar',
				    barWidth: barGraphWidth,
				    barSpacing: barGraphSpacing,
				    height: 50,
				    barColor: '#4c4f57',
				    negBarColor: '#51c5cb',
				    chartRangeMin :0,
				    disableInteraction: true,
				    colorMap: ['#51c5cb']
				});
				
			};
			
			// initialize map
			var initializeMap = function(lat,lng) {
				
				// add legend
				setLegend = function(){
					var content = "<div class='map-timeline-legend' style='display:none;'>\
						<nav class='legend clearfix'>\
							<span class='icon icon-cost-optimization' style='width:15px;height:17px;'></span><span class='label'>Cost Optimization: 8</span>\
							<span class='icon icon-performance' style='width:15px;height:17px;'></span><span class='label'>Performance: 21</span>\
							<span class='icon icon-security' style='width:15px;height:17px;'></span><span class='label'>Security: 11</span>\
							<span class='icon icon-fault-tolerance' style='width:15px;height:17px;'></span><span class='label'>Fault Tolerance: 10</span>\
						</nav>\
					</div>";
					
					if(!$(".map-timeline-legend").length)
						$(".map-display").append(content);
				};
				
				if (!map) {
					
					// set map legend container
					setLegend();
					
					L.mapbox.accessToken = settings.mapToken;
					map = L.mapbox.map('map-container', settings.mapBoxId, {
						zoomControl: false,
						legendControl : {
							position : 'topleft'
						}
					}).setView([lat, lng], settings.mapZoom);
					
					// add zoom control bottom right
					new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
					
					// add legends
					map.legendControl.addLegend($(".map-timeline-legend").html());
					
					// marker filtering
					$("nav.legend span").unbind("click").click(function(){
						
						var el, 
						type;
						
						if($(this).hasClass("icon"))
							el = $(this);
						else if($(this).hasClass("label"))
							el = $(this).prev();
							
						if(el.hasClass("icon-cost-optimization")) {
							type = "optimization";
							//type = "icon-cost-optimization.animated-icon";
						}else if(el.hasClass("icon-performance")) {
							type = "performance";
							//type = "icon-performance.animated-icon";
						}else if(el.hasClass("icon-security")) {
							type = "security";
							//type = "icon-security.animated-icon";
						}else if(el.hasClass("icon-fault-tolerance")) {
							type = "fault";
							//type = "icon-fault-tolerance.animated-icon";
						}
						
						if(el.hasClass("icon-default")) {
							var index = aExcludedMarker.indexOf(type);
							aExcludedMarker.splice(index, 1);
							//$(".map-display ."+type).show();
							el.removeClass("icon-default");
						}else {
							aExcludedMarker.push(type);
							//$(".map-display ."+type).hide();
							el.addClass("icon-default");
						}
						
						// remove all markers
						clearMapMarkers();
						removeAnimation();
						
						// add markers
						var cnt;
						for(cnt = 0; cnt <= (pointer/sliderMultiplier); cnt++ ) {
							updateDisplay(cnt, false);
						}
					});
						
				}
			};
			
			// initalize slider
			var initializeTimeline = function () {
				
				var range = 0, // playback duration in seconds
				step = 0, // multiplier for the slider per second;
				play = $('.switch-button button'), // play button element
				isPlaying = false, // boolean to determine if the slider is playing
				stepper = 0;
				
				range =  settings.data.duration * sliderMultiplier;
				step = 100 / (range-1);
				
				// update display
				updateDisplay(pointer/sliderMultiplier, true);
				
				// create slider
				$('.slider-container').sGlide({
					image : settings.basePath + 'images/slider_knob.png',
					startAt: 0,
					height : 7,
					disabled : false,
					totalRange : [0, range],
					buttons : false,
					drag : function(o) {
						// clear timer
						//clearInterval(sliderTimer);
						cancelAnimationFrame(sliderTimer);
												
						isPlaying = false;
						if(play.hasClass("pause-button")){
							play.removeClass("pause-button");
							play.addClass("play-button");
						}
						
						//var pct = Math.round(o.percent) + '%';
						var location = Math.round(o.custom);

						if(pointer != location){
							//console.log(location);
							// clear map markers
							clearMapMarkers();
							removeAnimation();
							
							pointer = location;
							for(j = 0; j < (pointer/sliderMultiplier); j++){
								// udapte display
								updateDisplay(j, false);
							}
						}
							
					},
					drop: function(o){},
					snap : {
						markers	: true,
						type	: 'soft'
					},
					onSnap: function(o){
						console.log("snap");
					}
				});
				
				// run slider
				function run() {
					if (pointer >= range) {
						
						// clear timer interval
						//clearInterval(sliderTimer);
						cancelAnimationFrame(sliderTimer);
						
						isPlaying = false;
						
						// reset slider playback
						resetSliderPlayback = true;
						
						// remove marker animation
						removeAnimation();
						
						// change pause button background to play
						if(play.hasClass("pause-button")){
							
							play.removeClass("pause-button");
							play.addClass("play-button");
						}
						return;
					}
					
					$('.slider-container').sGlide('startAt', step*pointer);
					
					// update display
					updateDisplay(Math.floor(pointer/sliderMultiplier), true);
					
					++pointer;
					
					sliderTimer = requestAnimationFrame(run);
				}
				
				// play button event (click)
				play.click(function() {
					
					// reset plaback and map markers
					if(resetSliderPlayback){
						pointer = 1;
						
						clearMapMarkers();
						resetSliderPlayback = false;
					}
					
					if (isPlaying) { // if slider is playing
						
						// change button background to play
						if($(this).hasClass("pause-button")) {
							
							$(this).removeClass("pause-button");
							$(this).addClass("play-button");
						}
						
						isPlaying = false; // set boolean isPlaying to false
						//clearInterval(sliderTimer); // clear timer
						cancelAnimationFrame(sliderTimer);
						
					} else { // if slider is not playing
						
						// change button background to pause
						if($(this).hasClass("play-button")) {
							
							$(this).removeClass("play-button");
							$(this).addClass("pause-button");
						}

						isPlaying = true;
						run();
					}
				});
				
				showSliderTick();
				
			};
			
			setContainers(this);
			
		};
		
	}(jQuery));
