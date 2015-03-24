<?php
	/**
	 * Open Database connection (via PDO).
	 * @return PDO handler on success
	 *  or false on error.
	 *  Also log errors with current time into a file.
	 */
	function connectDB () {
		// create time object
		$time = new DateTime('NOW');
		// open log file
		$file = fopen('dberrors.log', 'a');

		try {
			// connect to database
			$DBUSER = 'lampp';
			$DBPASS = 'serveradmin';
			$DSN = "mysql:host=localhost;dbname=cs75bart;";
			$pdo = new PDO($DSN, $DBUSER, $DBPASS);
		} catch (PDOException $e) {
			// log errors
			fwrite($file, $time->format('c') 
					   . '>dbquery:code> ' 
					   . $e->getCode() . "\n");
			fclose($file);
			return false;
		}
		return $pdo;
	}
?>