"use strict";
const pg = require('pg');
const pgconfig = require('./secret.js');
const client = new pg.Client(pgconfig);
require('isomorphic-fetch');

//A few movie titles to play with
//Since I'm using a super-high-tech method of building URLs, these
//must all be one-word titles. Have fun.
const titles = ['Frozen', 'Tangled', 'Mulan', 'Aladdin'];

function run(gen) {
	function advance(err, result) {
		const yielded = err ? gen.throw(err) : gen.next(result);
		if (yielded.done) return; //Generator has returned.
		//Handle a yielded promise.
		const p = yielded.value;
		if (typeof p === 'object' && typeof p.then === 'function') {
			//It seems to be a promise. Maybe?
			//Assume that a falsy value won't get thrown.
			p.then(val => advance(null, val)).catch(advance);
		}
	}
	gen = gen(advance); //Invoke the generator (we don't need the function)
	advance();
}

run(function*(next) {
	yield client.connect(next);
	yield client.query("create table if not exists movies (" +
		"title text primary key, plot text)");
	//Populate the table, for the sake of the demo.
	//Of course, we do this only if it doesn't already have content.
	const count = yield client.query('select count(*) from movies');
	if (count.rows[0].count === '0') {
		console.log("Seeding database...");
		for (let title of titles)
			yield client.query('insert into movies (title) values ($1)', [title]);
	}

	//Okay, now the real work. Go through all the movies and fetch their plots.
	const movies = yield client.query("select title from movies where plot is null");
	for (let movie of movies.rows) {
		console.log("Looking up", movie.title);
		//TODO: Properly encode the query string.
		const url = 'http://www.omdbapi.com/?t=' + movie.title;
		const json = yield (yield fetch(url)).json();
		yield client.query("update movies set plot = $1 where title = $2",
			[json.Plot, movie.title]);
		console.log("Plot:", json.Plot);
	}
	
	yield client.end(next);
});
