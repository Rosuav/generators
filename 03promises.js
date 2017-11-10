//Promises. Basically "callbacks with less indentation".
//Not everything supports them, though, and this example actually won't
//work, because client.connect() doesn't return a promise.

var pg = require('pg');
var pgconfig = require('./secret.js');
var client = new pg.Client(pgconfig);

(function() {
	//Step 1: Connect. (In real-world work, this would be done just once for the app.)
	return client.connect().then(function () {
		//Step 2: Submit a query.
		return client.query('select value1, value2 from demo where id = $1', [3]);
	}).then(function (result) {
		//Print that to the console (the real guts of the program)
		console.log(result.rows[0]);

		//Step 3: Disconnect
		return client.end();
	}).catch(function (err) {
		console.error(err);
	});
})();
