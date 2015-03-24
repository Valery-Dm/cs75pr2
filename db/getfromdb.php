<?php
	require_once('connectdb.php');
	/**
	 * Take route information from DB,
	 * add stations info and return as JSON-formatted string.
	 * @param - route number. 
	 * If it's not set then get and 
	 * return route IDs and names for menu items.
	 */
	function loadFromDB($param=[]) {
		$pdo = connectDB();
		if (!$pdo)
			return "can't connect to DB";
		if (!$param) {
			$query = "SELECT routeID, name FROM routes";
		} else {
			$query = "SELECT * FROM routes
					  WHERE routeID = ?";
		}
		$stmt = $pdo->prepare($query);
		$stmt->execute($param);
		$results = $stmt->fetchAll();
		if (!$param)
			return $results;
		$stmt = $pdo->prepare("SELECT * FROM stations
							   WHERE abbr = ?");
		foreach ($results as &$result) {
			$stations = explode(',', $result['stations']);
			$result['st'] = [];
			foreach ($stations as $station) {
				$stmt->execute([$station]);
				$result['st'][] = $stmt->fetchAll();
			}
		}
		return json_encode($results, JSON_FORCE_OBJECT);
	}
	//print_r(loadFromDB());
?>