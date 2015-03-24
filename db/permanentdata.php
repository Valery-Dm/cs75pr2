<?php
	require_once('connectdb.php');

	/**
	 * Store permanent (or rarely changed) data
	 * into DB (stations here). Will replace old data.
	 * @return message for errors or for success.
	 */
	function getStations () {
		$url = 'http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V';
		//$url = 'stn.aspx.xml';
		$stations = @simplexml_load_file($url);
		if (!$stations)
			return "unable to load data";
		// Prepare data: count string lengths,
		// collect cities and counties as arrays
		$name_length = 0;
		$addr_length = 0;
		$city_length = 0;
		$county_length = 0;
		$cities = [];
		$counties = [];
		foreach ($stations->stations->station as $stn) {
			$name = strlen($stn->name);
			$addr = strlen($stn->address);
			$city = strlen($stn->city);
			$county = strlen($stn->county);
			if ($name > $name_length) {
				$name_length = $name;
			}
			if ($addr > $addr_length) {
				$addr_length = $addr;
			}
			if ($city > $city_length) {
				$city_length = $city;
			}
			if ($county > $county_length) {
				$county_length = $county;
			}
			if (!in_array($stn->city->__toString(), $cities)) {
				$cities[] = $stn->city->__toString();
			}
			if (!in_array($stn->county->__toString(), $counties)) {
				$counties[] = $stn->county->__toString();
			}
		}
		// sort arrays
		sort($cities);
		sort($counties);
		// helper arrays
		$tables = ['stations', 'cities', 'counties'];
		$lengths = [$name_length, $addr_length,
					$city_length, $county_length];
		$len_tab_index = [0,0,1,2];
		$fields = ['name', 'address', 'name', 'name'];
		// Connect to DB
		$pdo = connectDB();
		if (!$pdo)
			return "can't connect to DB";
		// All further error checking must be done manually,
		// just looking into DB an comparing its content
		// with the actual data. 
		// So I won't check each statement's output here
		
		// First, delete old data
		foreach ($tables as $table) {
			$pdo->exec("TRUNCATE $table");
		}
		
		// Then change fields lengths
		// (I'm not worried about Null parameter)
		foreach ($lengths as $index => $length) {
			$table = $tables[$len_tab_index[$index]];
			$field = $fields[$index];
			$pdo->exec("ALTER TABLE $table
						MODIFY $field VARCHAR($length)");
		}
		// add values
		$stmt = $pdo->prepare("INSERT INTO counties (name) VALUES (?)");
		foreach ($counties as $county) {
			$stmt->execute([$county]);
		}
		$stmt = $pdo->prepare("INSERT INTO cities (name) VALUES (?)");
		foreach ($cities as $city) {
			$stmt->execute([$city]);
		}
		$stmt = $pdo->prepare("INSERT INTO stations 
							(name, abbr, address, city_id, 
							county_id, zipcode, lat, lng) 
							VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
		foreach ($stations->stations->station as $stn) {
			$city = array_search($stn->city, $cities);
			$county = array_search($stn->county, $counties);
			$stmt->execute([$stn->name, $stn->abbr, $stn->address,
						   $city + 1, $county + 1, $stn->zipcode,
						   $stn->gtfs_latitude, $stn->gtfs_longitude]);
		}
		$pdo = null;
		// On success message
		return 'data is loaded into DB';
	}
/**
	 * Store permanent (or rarely changed) data
	 * into DB (routes). Will replace old data.
	 * @return message for errors or for success.
	 */
	function getRoutes() {
		$url = 'http://api.bart.gov/api/route.aspx?cmd=routes&key=MW9S-E7SL-26DU-VV8V';
		$routes = @simplexml_load_file($url);
		if (!$routes)
			return "unable to load data";
		$name_length = 0;
		$route_stations = array();
		foreach ($routes->routes->route as $rt) {
			$name = strlen($rt->name);
			if ($name > $name_length) {
				$name_length = $name;
			}
			// get stations for each route
			$url = 'http://api.bart.gov/api/route.aspx?cmd=routeinfo&route='
					. $rt->number . '&key=MW9S-E7SL-26DU-VV8V';
			$route_info = @simplexml_load_file($url);
			if (!$route_info)
				return "unable to load data";
			//$route_stations[$rt->abbr] = $route_info->xpath('//station');
			$route_stations[] = $route_info->routes->route->config->station;
		}
		//echo '<pre>';
		$rtst_array = json_decode(json_encode((array)$route_stations), TRUE);
		//var_dump($rtst_array);
		//echo '</pre>';
		//return;
		// Connect to DB
		$pdo = connectDB();
		if (!$pdo)
			return "can't connect to DB";
		$pdo->exec("TRUNCATE routes");
		$pdo->exec("ALTER TABLE routes
					MODIFY name VARCHAR($name_length)");
		$stmt = $pdo->prepare("INSERT INTO routes
							(routeID, name, abbr, color, stations)
							VALUES (?, ?, ?, ?, ?)");
		$index = 0;
		foreach ($routes->routes->route as $rt) {
			$stmt->execute([$rt->number, $rt->name,
						  	$rt->abbr, $rt->color,
						   	implode(',', $rtst_array[$index])]);
			$index++;
		}
		$pdo = null;
		// On success message
		return 'data is loaded into DB';
	}
	echo getStations();
	echo getRoutes();
?>