var pg = require('pg');
var pgconfig = require('./secret.js');
var client = new pg.Client(pgconfig);

//Theoretically, this could be a synchronous function.
//It wouldn't actually work this way, though, because pg.Client does not
//support synchronous calls.
(function*(next) {
	//Step 1: Connect. (In real-world work, this would be done just once for the app.)
	client.connect(next);

	//Step 2: Submit a query.
	result = client.query('select value1, value2 from demo where id = $1', [3], next);
	
	//Print that to the console (the real guts of the program)
	console.log(result.rows[0]);

	//Step 3: Disconnect
	client.end(next);
})();
