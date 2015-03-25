/**
 * Draw google map on San Francisco.
 * Ask host server for routes
 * and stations data from DB.
 * Ask BART site for real-time data.
 * BART Key MW9S-E7SL-26DU-VV8V
 **/
var map = "",
	marker = [],
	initializeMap,
	addRouteWithMarkers,
	addInfoWindow,
	addInfo,
	getRoutes,
	routePath,
	drawRoute,
	clearRoute,
	getSchedule;


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
		point;

	// set route's name above the map
	document.getElementById('route')
			.innerHTML = route[0].name;
	for (i in route[0].st) {
		// set stations coordinates
		point = new google.maps
						  .LatLng(route[0].st[i][0].lat,
								  route[0].st[i][0].lng);
		routeCoordinates.push(point);
		// populate global marker array
		marker.push(
			new google.maps.Marker({
				position: point,
				map: map,
				title: route[0].st[i][0].abbr
			})
		);
	}
	routePath = new google.maps.Polyline({
		path: routeCoordinates,
		strokeColor: route[0].color,
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
function drawRoute() {
	"use strict";
	routePath.setMap(map);
	for (var i in marker) {
		marker[i].setMap(map);
		addInfoWindow(marker[i], i);
	}
};

/**
* Helper function.
* Remove route line
* with markers
**/
function clearRoute() {
	"use strict";
	routePath.setMap(null);
	for (var i in marker) {
		marker[i].setMap(null);
	}
	marker = [];
};

addInfoWindow = function (marker, num) {
	"use strict";
	var infowindow = new google.maps.InfoWindow({
		content: "<h1 style='color:blue'>" + marker.getTitle() + "</h1>"
	});
	google.maps.event.addListener(marker, 'click', function () {
		infowindow.open(map, marker);
	});
};

addInfo = function (data) {
	var getValue,
		result = '';
	/**
	* Helper function to get
	* nodes values
	**/
	getValue = function (node) {
		var i,
			len,
			children,
			vresult = '';
		if (typeof node === 'string') {
			return data.getElementsByTagName(node)[0]
						.firstChild.nodeValue;
		} else {
			for (i = 0, len = node.length; i < len; i++) {
				children = node[i].childNodes;
				vresult +=
					'<hr /><div class="estimate" style=' +
					'"background-color: ' +
					children[5].firstChild.nodeValue +
					'"><h5>Platform: ' +
					children[1].firstChild.nodeValue +
					'</h5><h6>Direction: ' +
					children[2].firstChild.nodeValue +
					'</h6><p>Minutes left: ' +
					children[0].firstChild.nodeValue +
					'</p><p>Length: ' +
					children[3].firstChild.nodeValue +
					'</p></div>';
			}
			return vresult;
		}
	};
	// Collect data into DOM string
	result = 
		'<div class="info_window"><h4>' +
		getValue('name') + ' (' +
		getValue('abbr') + ') - ' +
		getValue('destination') + ' (' +
		getValue('abbreviation') + ')</h4><p>' +
		getValue('date') + ' ' +
		getValue('time') + '</p>' +
		getValue(data.getElementsByTagName('estimate')) +
		'</div>';

	return result;
}

getSchedule = function (station, dir) {
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
				console.log("Error with Ajax call!");
			}
		}
	};
    // send query
    xhr.send();
};

/**
* Get route's data from server
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
				console.log("Error with Ajax call!");
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
	var menu, i, len, text, route;
	// initialize google map
	initializeMap();
	document.getElementById('route').onclick = function () {
		//getSchedule('PITT', 's');
	};
	
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