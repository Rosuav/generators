var pg = require('pg');
var pgconfig = require('./secret.js');
var client = new pg.Client(pgconfig);

//This is semantically similar to the generator, but requires no driver function.
//NOTE: As of 2016, async functions are not supported by default in Node.js.
//To run this, ensure you have Node 7.x, then run: node --harmony async.js
(async function() {
	//Step 1: Connect. (In real-world work, this would be done just once for the app.)
	await client.connect();

	//Step 2: Submit a query.
	var result = await client.query('select value1, value2 from demo where id = $1', [3]);
	
	//Print that to the console (the real guts of the program)
	console.log(result.rows[0]);

	//Step 3: Disconnect
	await client.end();
})();
