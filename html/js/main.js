/**
 * All functionality is here.
 * BART Key MW9S-E7SL-26DU-VV8V
 */
var map = "",
	marker = [],
	initialize,
	addMarker,
	addPolyline,
	addInfoWindow,
	getJson,
	polylinePath,
	addLine,
	removeLine;

initialize = function () {
	"use strict";
	var mapOptions = {
		center: new google.maps.LatLng(37.775362, -122.417564),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
};

addMarker = function () {
	"use strict";
	marker = new google.maps.Marker({
		position: new google.maps.LatLng(37.775362, -122.417564),
		title: "I am a marker!"
	});
	marker.setMap(map);
};

addPolyline = function (route) {
	"use strict";
	var polylineCoordinates = [],
		i, len;
	
	// set route's name
	document.getElementById('route')
			.innerHTML = route[0].name;
	for (i in route[0].st) {
		polylineCoordinates.push(
			new google.maps.LatLng(route[0].st[i][0].lat,
								   route[0].st[i][0].lng)
		);
		marker.push(
			new google.maps.Marker({
				position: new google.maps.LatLng(route[0].st[i][0].lat,
												 route[0].st[i][0].lng),
				title: route[0].st[i][0].abbr
			})
		);
	}
	polylinePath = new google.maps.Polyline({
		path: polylineCoordinates,
		strokeColor: route[0].color,
		strokeOpacity: 0.7,
		strokeWeight: 8
	});
	// draw route
	addLine();
};

function addLine() {
	polylinePath.setMap(map);
	for (var i in marker) {
		marker[i].setMap(map);
	}
};

function removeLine() {
	polylinePath.setMap(null);
	for (var i in marker) {
		marker[i].setMap(null);
	}
	marker = [];
};
addInfoWindow = function () {
	"use strict";
	var infowindow = new google.maps.InfoWindow({
		content: "<h1 style='color:blue'>I am an info window!</h1>",
		position: new google.maps.LatLng(37.7805, -122.4725)
	});

	google.maps.event.addListener(marker, 'click', function () {
		infowindow.open(map, marker);
	});
};

getJson = function (route) {
	"use strict";
	var xhr, params = 'route=' + route;
	try {
		// for non-Microsoft browsers
        xhr = new XMLHttpRequest();
    } catch (e) {
		// for IE5 and IE6
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.open("POST", "ajax.php", true);
    // set content-type 
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // on response state change call the handler
    xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				addPolyline(window.JSON.parse(xhr.responseText));
			} else {
				console.log("Error with Ajax call!");
			}
		}
	};
    // send the post variables to the server
    xhr.send(params);
};

window.onload = function () {
	"use strict";
	var menu, i, len, text, route;
	initialize();
	menu = document.getElementsByClassName('menu_item');
	for (i = 0, len = menu.length; i < len; i++) {
		menu[i].onclick = function () {
			if (polylinePath !== undefined) {
				// clear shown route
				removeLine();
			};
			text = this.firstElementChild.innerHTML;
			route = text.match(/\d{1,2}/);
			getJson(route[0]);
		};
	}
	//addPolyline();
	//addMarker();
	//addInfoWindow();
};