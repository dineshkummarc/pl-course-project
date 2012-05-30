var PEG = require( "pegjs" );
var assert = require( "assert" );
var fs = require( "fs" ); // for loading files

var data = fs.readFileSync( "scheem.peg", "utf-8" );
var parse = PEG.buildParser( data ).parse;

// Unit Tests
assert.deepEqual( parse( "(a b c)" ), [ "a", "b", "c" ] );
assert.deepEqual( parse( "(+ 1 (* x 3))" ), [ "+", "1", [ "*", "x", "3" ] ] );
assert.deepEqual( parse( "(* n (factorial (- n 1)))" ), [ "*", "n", [ "factorial", [ "-", "n", "1" ] ] ] );
assert.deepEqual( parse( "(* n \n\t(factorial (- n 1)))" ), [ "*", "n", [ "factorial", [ "-", "n", "1" ] ] ] );
assert.deepEqual( parse( "(a '(1 2 3))" ), [ "a", [ "quote", [ "1", "2", "3" ] ] ] );
//assert.deepEqual( parse( "(a '(1 2 3))\n;; Any old rubbish, lets have an unmatched set of parens! (()))\n" ), [ "a", [ "quote", [ "1", "2", "3" ] ] ] );
assert.deepEqual(
	parse( "(let loop ((n 1))\n\t(if (<= n 10)\n\t\t(begin\n\t\t\t(display n) (newline)\n\t\t\t(loop (+ n 1)))))" ),
	[
		"let",
		"loop",
		[ [ "n", "1" ] ],
		[
			"if",
			[ "<=", "n", "10" ],
			[
				"begin",
				[ "display", "n" ],
				[ "newline" ],
				[
					"loop",
					[ "+", "n", "1" ]
				]
			]
		]
	]
);
