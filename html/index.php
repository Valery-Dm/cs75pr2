<?php
	require_once('../db/getfromdb.php');
	$routes = loadFromDB();
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Frisco transport</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="css/style.css" />
	</head>
	<body>
		<h1>BART on Google Maps</h1>
		<hr />
		<div id="menu"><?php foreach ($routes as $route): ?>
			<div class="menu_item">
				<abbr title="<?= $route['name']; ?>">
					Route <?= $route['routeID']; ?>
				</abbr>
			</div>
		<?php endforeach ?></div>
		<h3 id="route">Choose route</h3>
		<div id="map_canvas"></div>
		<hr />
		<p>&copy; dmv 2015</p>
		<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript"
			src="http://maps.googleapis.com/maps/api/js?v=3&amp;sensor=false">
		</script>
	</body>
</html>