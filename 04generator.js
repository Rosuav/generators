var pg = require('pg');
var pgconfig = require('./secret.js');
var client = new pg.Client(pgconfig);

function run(gen) {
	function advance(err, result) {
		var yielded = err ? gen.throw(err) : gen.next(result);
		if (yielded.done) return; //Generator has returned.
		//Handle a yielded promise.
		var p = yielded.value;
		if (typeof p === 'object' && typeof p.then === 'function') {
			//It seems to be a promise. Maybe?
			//Assume that a falsy value won't get thrown.
			p.then(val => advance(null, val)).catch(advance);
		}
	}
	gen = gen(advance); //Invoke the generator (we don't need the function)
	advance();
}

//And here's how asynchronous code looks. Whenever you would have a function
//with (err, result) parameters, pass 'next', and yield the result. You'll get
//back the result, or have the error thrown. Alternatively, yield a Promise.
run(function*(next) {
	//Step 1: Connect. (In real-world work, this would be done just once for the app.)
	yield client.connect(next);

	//Step 2: Submit a query.
	var result = yield client.query('select value1, value2 from demo where id = $1', [3], next);
	
	//Print that to the console (the real guts of the program)
	console.log(result.rows[0]);

	//Step 3: Disconnect
	yield client.end(next);
	//And no backtabbing (or backstabbing).
});
