var pg = require('pg');
var pgconfig = require('./secret.js');
var client = new pg.Client(pgconfig);

//Step 1: Connect. (In real-world work, this would be done just once for the app.)
client.connect(function (err) {
	if (err) throw err;

	//Step 2: Submit a query.
	client.query('select value1, value2 from demo where id = $1', [3], function (err, result) {
		if (err) throw err;
 
		//Print that to the console (the real guts of the program)
		console.log(result.rows[0]);

		//Step 3: Disconnect
		client.end(function (err) {
			if (err) throw err;
			//And then we backtab all the way.
		});
	});
});
