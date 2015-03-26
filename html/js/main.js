/**
 * Draw google map on San Francisco.
 * Ask host server for routes
 * and stations data from DB.
 * Ask BART site for real-time data.
 * BART Key MW9S-E7SL-26DU-VV8V
 **/
var map = "",
	markers = [],
	direction,
	routeColor,
	infowindow,
	// functions
	initializeMap,
	addRouteWithMarkers,
	addInfoHandler,
	addInfo,
	showInfoWindow,
	getRoutes,
	routePath,
	drawRoute,
	clearRoute,
	getEstimate;

/**
* Create global map object.
* Centered at San Francisco
**/
initializeMap = function () {
	"use strict";
	var mapOptions = {
		center: new google.maps.LatLng(37.75, -122.25),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
};

/**
* Get route object with all data.
* Create map elements for
* the route with
* markers for its stations
**/
addRouteWithMarkers = function (route) {
	"use strict";
	var routeCoordinates = [],
		i,
		j,
		len,
		point,
		station,
		stations = '';

	for (i in route[0].st) {
		// set stations coordinates
		point = new google.maps
						  .LatLng(route[0].st[i][0].lat,
								  route[0].st[i][0].lng);
		routeCoordinates.push(point);
		// populate global markers array
		markers.push(
			new google.maps.Marker({
				position: point,
				map: map,
				title: route[0].st[i][0].abbr
			})
		);
		// create stations menu
		stations +=
			'<div class="stations_item">' +
			'<abbr title="' +
			route[0].st[i][0].name +
			'">' +
			route[0].st[i][0].abbr +
			'</abbr></div>';
	}
	// set route's name above the map
	document.getElementById('route')
			.innerHTML = route[0].routeID + ': ' + route[0].name;
	// attach stations items to DOM
	document.getElementById('stations')
			.innerHTML = stations;
	// Attach onclick handler to these items
	station = document.getElementsByClassName('stations_item');
	for (i = 0, len = station.length; i < len; i++) {
		station[i].onclick = function () {
			for (j in markers) {
				if (markers[j].getTitle() ===
					this.firstElementChild.innerHTML) {
					// show info window
					showInfoWindow(markers[j], j);
				}
			}
		};
	}
	routeColor = route[0].color;
	routePath = new google.maps.Polyline({
		path: routeCoordinates,
		strokeColor: routeColor,
		strokeOpacity: 0.7,
		strokeWeight: 8
	});
	// call draw route function
	drawRoute();
};

/**
* Helper function. 
* Draw route line
* with markers
**/
drawRoute = function () {
	"use strict";
	routePath.setMap(map);
	for (var i in markers) {
		markers[i].setMap(map);
		addInfoHandler(markers[i], i);
	}
};

/**
* Helper function.
* Remove route line
* with markers
**/
clearRoute = function () {
	"use strict";
	routePath.setMap(null);
	for (var i in markers) {
		markers[i].setMap(null);
	}
	markers = [];
};

/**
* Get marker object and it index in array.
* Show info window for all stations except last one.
**/
showInfoWindow = function (marker, num) {
	if (num < markers.length - 1) {
		var nextStId = parseInt(num) + 1;
		// Set direction based on coordinates 
		// of this and next stations.
		// It might not be correct in some cases,
		// but there is no other option at the moment
		// to get the right direction for particular route
		direction = (markers[nextStId].getPosition().k > 
					 marker.getPosition().k) ? 'n' : 's';
		// get schedule for this station, route and direction
		getEstimate(marker.getTitle(), direction);
		infowindow.open(map, marker);
	}
};

/**
* Instantiate infoWindow objects.
* Pass given parameters to handler 
* function on marker click
**/
addInfoHandler = function (marker, num) {
	"use strict";
	infowindow = new google.maps.InfoWindow;
	google.maps.event.addListener(marker, 'click', function () {
		showInfoWindow(marker, num);
	});
};

/**
* Take data recieved from server
* and construct DOM string for info window.
**/
addInfo = function (data) {
	/**
	* Helper function to get
	* nodes values
	**/
	var getValue = function (node) {
		var i,
			len,
			color,
			children,
			content,
			result = '';
		if (typeof node === 'string') {
			return data.getElementsByTagName(node)[0]
						.firstChild.nodeValue;
		} else {
			for (i = 0, len = node.length; i < len; i++) {
				children = node[i].childNodes;
				if (routeColor === children[5].firstChild.nodeValue) {
					if (routeColor === '#ffff33') {
						color = 'black';
					} else {
						color = 'white';
					}
					result +=
						'<hr /><div class="estimate" style=' +
						'"background-color: ' +
						children[5].firstChild.nodeValue +
						'; color:' + color + '"><h5>Platform: ' +
						children[1].firstChild.nodeValue +
						'</h5><h6>Direction: ' +
						children[2].firstChild.nodeValue +
						'</h6><p>Minutes left: ' +
						children[0].firstChild.nodeValue +
						'</p><p>Length: ' +
						children[3].firstChild.nodeValue +
						'</p></div>';
				}
			}
			return result;
		}
	};
	// Collect data into DOM string
	content = 
		'<div class="info_window"><h4>' +
		getValue('name') + ' (' +
		getValue('abbr') + ')</h4><p>' +
		getValue('date') + ' ' +
		getValue('time') + '</p>' +
		getValue(data.getElementsByTagName('estimate')) +
		'</div>';
	infowindow.setContent(content);
}

/**
* Call BART API for estimate arrival time
* for given station and direction
**/
getEstimate = function (station, dir) {
	"use strict";
	var xhr,
		url = 'http://api.bart.gov/api/etd.aspx?cmd=etd' +
			  '&orig=' + station + '&key=MW9S-E7SL-26DU-VV8V' +
			  '&dir=' + dir;
	try {
		// for non-Microsoft browsers
        xhr = new XMLHttpRequest();
    } catch (e) {
		// for IE5 and IE6
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
	xhr.open('GET', url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				// pass data to handler function
				addInfo(xhr.responseXML);
			} else {
				console.log("Can't get estimates");
			}
		}
	};
    // send query
    xhr.send();
};

/**
* Get route's data from host server
**/
getRoutes = function (route) {
	"use strict";
	var xhr, params = 'route=' + route;
	try {
		// for non-Microsoft browsers
        xhr = new XMLHttpRequest();
    } catch (e) {
		// for IE5 and IE6
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
	// open POST connection
    xhr.open("POST", "ajax.php", true);
    // set content-type 
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // on response state change
    xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				// pass data to handler function
				addRouteWithMarkers(window.JSON.parse(xhr.responseText));
			} else {
				console.log("Can't get data from server");
			}
		}
	};
    // send query
    xhr.send(params);
};

/**
 * Main function
 */
window.onload = function () {
	"use strict";
	var menu, i, len, text, route, stations;
	// initialize google map
	initializeMap();
	// menu functionality
	menu = document.getElementsByClassName('menu_item');
	for (i = 0, len = menu.length; i < len; i++) {
		menu[i].onclick = function () {
			if (routePath !== undefined) {
				// clear shown route
				clearRoute();
			}
			text = this.firstElementChild.innerHTML;
			route = text.match(/\d{1,2}/);
			// ask server for selected route's data
			getRoutes(route[0]);
		};
	}
	
};