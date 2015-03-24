<?php
	require_once('../db/getfromdb.php');
	if (isset($_POST['route']))
		echo loadFromDB([$_POST['route']]);
?>