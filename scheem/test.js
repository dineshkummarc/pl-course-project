// Make lint happy
/*global chai: true, mocha: true, suite: true, test: true, SCHEEM: true, evalScheem: true, evalScheemString: true */
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
		test( 'non-list quote', function() {
			assert.deepEqual( SCHEEM.parse( "(alert 'hello-world)" ), [ "alert", [ "quote", "hello-world" ] ] );
		});
		test( 'zero', function() {
			assert.deepEqual( SCHEEM.parse( "(0)" ), [ 0 ] );
		});
		test( 'negative', function() {
			assert.deepEqual( SCHEEM.parse( "(-5)" ), [ -5 ] );
		});
		test( 'float', function() {
			assert.deepEqual( SCHEEM.parse( "(0.5)" ), [ 0.5 ] );
		});
		test( 'scientific', function() {
			assert.deepEqual( SCHEEM.parse( "(-3.45e+6)" ), [ -3450000 ] );
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
			assert.throws( function () { evalScheem( [ '/' ], {} ); } );
		});
		test( 'formals not a list', function() {
			assert.throws( function () { evalScheemString( "(lambda n n)", {} ); } );
		});
		test( 'let vars not a list', function() {
			assert.throws( function () { evalScheemString( "(let n 2 n)", {} ); } );
		});
		test( 'env is empty', function()
		{
			assert.deepEqual(
				evalScheem( [ 'begin', [ 'define', 'n', 1 ], [ '+', 'n', 0 ] ], {} ),
				1
			);
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
				evalScheem( [ '+', 'x', 1 ], { bindings: { x: 5 } } ),
				6
			);
		});
		test( 'a dog and a cat', function() {
			assert.deepEqual(
				evalScheem( [ '+', 'dog', 'cat' ], { bindings: { dog: 35, cat: 7 }  } ),
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
				evalScheem( [ '>', 'cat', 'dog' ], { bindings: { cat: 10, dog: 5 }  } ),
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
				evalScheem( [ '<', 'cat', 'dog' ], { bindings: { cat: 10, dog: 5 } } ),
				'#f'
			);
		});
	});

	suite( 'if', function() {
		test( 'Expression true', function() {
			assert.deepEqual(
				evalScheem( [ 'if', [ '=', 'a', 'a' ], 1, 2 ], { bindings: { a: 5 }  } ),
				1
			);
		});
		test( 'Expression false', function() {
			assert.deepEqual(
				evalScheem( [ 'if', [ '=', 'apples', 'oranges' ], 1, 2 ], { bindings: { apples: 1, oranges: 2 }  } ),
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
				evalScheem( [ 'cdr', [ 'quote', [ '=', 'apples', 'oranges' ] ] ], { bindings: { apples: 1, oranges: 2 }  } ),
				[ 'apples', 'oranges' ]
			);
		});
	});

	suite( 'let', function() {
		test( 'new value when in scope', function() {
			assert.deepEqual( evalScheemString( "(begin (define n 1) (let ((n 2)) (+ n 1)))", {} ), 3 );
		});
		test( 'old value when out of scope', function() {
			assert.deepEqual( evalScheemString( "(begin (define n 1) (let ((n 2)) (define a n)) (+ n 1))", {} ), 2 );
		});
		test( 'nested', function() {
			assert.deepEqual( evalScheemString( "(let ((x 2)) (+ (let ((x 3)) x) (let ((y 4)) x)))", {} ), 5 );
		});
		test( 'multiple', function() {
			assert.deepEqual( evalScheemString( "(begin (define n 1) (let ((n 2) (m 16)) (+ n m)))", {} ), 18 );
		});
	});

	suite( 'apply', function() {
		test( 'built-in 0 parameter', function() {
			assert.deepEqual( evalScheemString( "(always3)", { bindings: { always3: function(){ return 3; } } } ), 3 );
		});
		test( 'built-in 1 parameter', function() {
			assert.deepEqual( evalScheemString( "(always3 10)", { bindings: { always3: function( x ){ return 3; } } } ), 3 );
		});
		test( 'built-in 4 parameter', function() {
			assert.deepEqual( evalScheemString( "(sum 1 2 3 4)", { bindings: { sum: function( a, b, c, d ){ return a+b+c+d; } } } ), 10 );
		});
		test( 'custom 0 parameter', function() {
			assert.deepEqual( evalScheemString( "(begin (define always3 (lambda () 3)) (always3))", {} ), 3 );
		});
		test( 'custom 1 parameter', function() {
			assert.deepEqual( evalScheemString( "(begin (define always3 (lambda (n) 3)) (always3 10))", {} ), 3 );
		});
		test( 'custom 4 parameter', function() {
			assert.deepEqual( evalScheemString( "(begin (define sum (lambda (a b c d) (+ a (+ b (+ c d))) )) (sum 1 2 3 4))", {} ), 10 );
		});
	});

	suite( 'lambda', function() {
		test( 'Defining a function', function() {
			assert.deepEqual( evalScheemString( "(define always3 (lambda (n) 3))", {} ), 0 );
		});
		test( 'Simple function calls', function() {
			assert.deepEqual( evalScheemString( "(begin (define always3 (lambda (n) 3)) (always3 10))", {} ), 3 );
		});
		test( 'Calling an anonymous function', function() {
			assert.deepEqual( evalScheemString( "((lambda (n) (* n n)) 9)", {} ), 81 );
		});
		test( 'Passing a function as a value to another function', function() {
			assert.deepEqual( evalScheemString( "(begin (define call (lambda (f) (f 10))) (call (lambda (n) (* n 11))))", {} ), 110 );
		});
		test( 'Inner function using values from enclosing function', function() {
			assert.deepEqual( evalScheemString( "(((lambda (n) (lambda (y) (* n y))) 7) 13)", {} ), 91 );
		});
		test( 'Argument to a function shadows a global variable', function() {
			assert.deepEqual( evalScheemString( "(begin (define n 5) ((lambda (n) n) 3))", {} ), 3 );
		});
		test( 'A function modifies a global variable', function() {
			assert.deepEqual( evalScheemString( "(begin (define n 5) (begin ((lambda (x) (set! n x)) 11) n))", {} ), 11 );
		});
		test( 'An inner function modifies a variable in the outer function', function() {
			assert.deepEqual( evalScheemString( "(begin (define foo (lambda (n) (lambda (var) (begin (set! n (+ n var)) n)))) (begin (define bar (foo 5)) (begin (bar 7) (bar 11))))", {} ), 23 );
		});
		test( 'A function in a define that calls itself recursively', function() {
			assert.deepEqual( evalScheemString( "(begin (define sum (lambda (n) (if (= n 0) 0 (+ n (sum (- n 1)))))) (sum 10))", {} ), 55 );
		});
	});

	suite( 'evalScheemString', function()
	{
		test( 'nested expressions', function() {
			assert.deepEqual( evalScheemString( "(+ 1 (* x 3))", { bindings: { x: 4 }  } ), 13 );
		});
		test( 'nested expressions2', function() {
			assert.deepEqual( evalScheemString( "(* n (+ n 1))", { bindings: { n: 10 } } ), 110 );
		});
	});

	mocha.run();
}

$( start );
