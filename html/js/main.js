/**
 * All functionality is here.
 * BART Key MW9S-E7SL-26DU-VV8V
 */
var map = "",
	marker = "",
	initialize,
	addMarker,
	addPolyline,
	addInfoWindow;

initialize = function () {
	"use strict";
	var mapOptions = {
		center: new google.maps.LatLng(37.775362, -122.417564),
		zoom: 12,
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

addPolyline = function (coords, color='#f00') {
	"use strict";
	var polylineCoordinates = [
			new google.maps.LatLng(37.775362, -122.417564),
			new google.maps.LatLng(37.7849, -122.4522),
			new google.maps.LatLng(37.7805, -122.4725)
		],

		polylinePath = new google.maps.Polyline({
			path: polylineCoordinates,
			strokeColor: "#FF0000",
			strokeOpacity: 1.0,
			strokeWeight: 2
		});

	polylinePath.setMap(map);
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

window.onload = function () {
	"use strict";
	initialize();
	//addPolyline();
	//addMarker();
	//addInfoWindow();
};