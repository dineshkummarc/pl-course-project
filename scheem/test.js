function start()
{
	var assert = chai.assert;	
	mocha.setup( 'tdd' );


	suite( 'parse', function()
	{
		test( 'lists', function()
		{
			assert.deepEqual( SCHEEM.parse( "(a b c)" ), [ "a", "b", "c" ] );
		});
		test( 'nested expressions', function() {
			assert.deepEqual( SCHEEM.parse( "(+ 1 (* x 3))" ), [ "+", 1, [ "*", "x", 3 ] ] );
		});
		test( 'nested expressions2', function() {
			assert.deepEqual( SCHEEM.parse( "(* n (factorial (- n 1)))" ), [ "*", "n", [ "factorial", [ "-", "n", 1 ] ] ] );
		});
		test( 'whitespace', function() {
			assert.deepEqual( SCHEEM.parse( "(* n \n\t(factorial (- n 1)))" ), [ "*", "n", [ "factorial", [ "-", "n", 1 ] ] ] );
		});
		test( 'quote', function() {
			assert.deepEqual( SCHEEM.parse( "(a '(1 20 3))" ), [ "a", [ "quote", [ 1, 20, 3 ] ] ] );
		});
		test( 'complex', function() {
			assert.deepEqual(
				SCHEEM.parse( "(let loop ((n 1))\n\t(if (<= n 10)\n\t\t(begin\n\t\t\t(display n) (newline)\n\t\t\t(loop (+ n 1)))))" ),
				[
					"let",
					"loop",
					[ [ "n", 1 ] ],
					[
						"if",
						[ "<=", "n", 10 ],
						[
							"begin",
							[ "display", "n" ],
							[ "newline" ],
							[
								"loop",
								[ "+", "n", 1 ]
							]
						]
					]
				]
			);
		});
	});


	suite( 'errors', function()
	{
		test( 'set! undefined variable', function()
		{
			assert.throws( function () { evalScheem( [ 'set!', 'x', 1 ], {} ); } );
		});
		test( 'access undefined variable', function() {
			assert.throws( function () { evalScheem( [ '+', 'x', 1 ], {} ); } );
		});
		test( 'pass too few arguments', function() {
			assert.throws( function () { evalScheem( [ '+', 1 ], {} ); } );
		});
//		test( 'pass too many arguments', function() {
//			assert.throws( function () { evalScheem( [ 'quote', 2, 1 ], {} ); } );
//		});		
	});

	suite( 'quote', function()
	{
		test( 'a number', function()
		{
			assert.deepEqual(
				evalScheem( [ 'quote', 3 ], {} ),
				3
			);
		});
		test( 'an atom', function() {
			assert.deepEqual(
				evalScheem( [ 'quote', 'dog' ], {} ),
				'dog'
			);
		});
		test( 'a list', function() {
			assert.deepEqual(
				evalScheem( [ 'quote', [ 1, 2, 3 ] ], {} ),
				[ 1, 2, 3 ]
			);
		});
	});

	suite( 'add', function() {
		test( 'two numbers', function() {
			assert.deepEqual(
				evalScheem( [ '+', 3, 5 ], {} ),
				8
			);
		});
		test( 'a number and an expression', function() {
			assert.deepEqual(
				evalScheem( [ '+', 3, [ '+', 2, 2 ] ], {} ),
				7
			);
		});
		test( 'variable', function()
		{
			assert.deepEqual(
				evalScheem( [ '+', 'x', 1 ], { x: 5 } ),
				6
			);
		});		
		test( 'a dog and a cat', function() {
			assert.deepEqual(
				evalScheem( [ '+', 'dog', 'cat' ], { dog: 35, cat: 7 } ),
				42
			);
		});
		test( '2 and 2', function() {
			assert.deepEqual(
				evalScheem( [ '+', 2, 2 ], {} ),
				4
			);
		});
	});

	suite( 'begin', function() {
		test( 'set two variables then add', function() {
			assert.deepEqual(
				evalScheem( [ 'begin', [ 'define', 'x', 3 ], [ 'define', 'y', 5 ], [ '+', 'x', 'y' ] ], {} ),
				8
			);
		});
		test( 'return only final value', function() {
			assert.deepEqual(
				evalScheem( [ 'begin', [ '+', 1, 1 ], [ '+', 2, 2 ], [ '+', 3, 3 ] ], {} ),
				6
			);
		});
	});

	suite( 'comparison', function() {
		test( 'Equals', function() {
			assert.deepEqual(
				evalScheem( [ '=', 1, 1 ], {} ),
				'#t'
			);
		});
		test( 'Not equals', function() {
			assert.deepEqual(
				evalScheem( [ '=', 1, 2 ], {} ),
				'#f'
			);
		});
		test( 'More than', function() {
			assert.deepEqual(
				evalScheem( [ '>', 'cat', 'dog' ], { cat: 10, dog: 5 } ),
				'#t'
			);
		});
		test( 'Not more than', function() {
			assert.deepEqual(
				evalScheem( [ '>', 10, 20 ], {} ),
				'#f'
			);
		});
		test( 'Less than', function() {
			assert.deepEqual(
				evalScheem( [ '<', 10, 20 ], {} ),
				'#t'
			);
		});
		test( 'Not less than', function() {
			assert.deepEqual(
				evalScheem( [ '<', 'cat', 'dog' ], { cat: 10, dog: 5 }, {} ),
				'#f'
			);
		});
	});

	suite( 'if', function() {
		test( 'Expression true', function() {
			assert.deepEqual(
				evalScheem( [ 'if', [ '=', 'a', 'a' ], 1, 2 ], { a: 5 } ),
				1
			);
		});
		test( 'Expression false', function() {
			assert.deepEqual(
				evalScheem( [ 'if', [ '=', 'apples', 'oranges' ], 1, 2 ], { apples: 1, oranges: 2 } ),
				2
			);
		});
	});

	suite( 'lists', function() {
		test( 'cons value, list', function() {
			assert.deepEqual(
				evalScheem( [ 'cons', 1, [ 'quote', [ '=', 'a', 'a' ] ] ], {} ),
				[ 1, '=', 'a', 'a' ]
			);
		});
		test( 'cons list, list', function() {
			assert.deepEqual(
				evalScheem( [ 'cons', [ 'quote', [ '=', 'apples', 'oranges' ] ], [ 'quote', [ '=', 'a', 'a' ] ] ], {} ),
				[ [ '=', 'apples', 'oranges' ], '=', 'a', 'a' ]
			);
		});
		test( 'car', function() {
			assert.deepEqual(
				evalScheem( [ 'car', [ 'quote', [ '=', 'a', 'a' ] ] ], {} ),
				'='
			);
		});
		test( 'cdr', function() {
			assert.deepEqual(
				evalScheem( [ 'cdr', [ 'quote', [ '=', 'apples', 'oranges' ] ] ], { apples: 1, oranges: 2 } ),
				[ 'apples', 'oranges' ]
			);
		});
	});		


	suite( 'evalScheemString', function()
	{
		test( 'nested expressions', function() {
			assert.deepEqual( evalScheemString( "(+ 1 (* x 3))", { x: 4 } ), 13 );
		});
		test( 'nested expressions2', function() {
			assert.deepEqual( evalScheemString( "(* n (+ n 1))", { n: 10} ), 110 );
		});
	});

	mocha.run();
}

$( start );
