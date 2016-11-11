var pg = require('pg');
var pgconfig = require('./secret.js');
var client = new pg.Client(pgconfig);

function run(gen) {
	function advance(err, result) {
		var yielded = err ? gen.throw(err) : gen.next(result);
		if (yielded.done) return; //Generator has returned.
		//TODO: Handle a yielded promise
	}
	gen = gen(advance); //Invoke the generator (we don't need the function)
	advance();
}

//And here's how asynchronous code looks.
run(function*(next) {
	//Step 1: Connect. (In real-world work, this would be done just once for the app.)
	yield client.connect(next);

	//Step 2: Submit a query.
	result = yield client.query('select value1, value2 from demo where id = $1', [3], next);
	
	//Print that to the console (the real guts of the program)
	console.log(result.rows[0]);

	//Step 3: Disconnect
	yield client.end(next)
	//And no backtabbing (or backstabbing).
});
