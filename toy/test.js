// Make lint happy
/*global chai: true, mocha: true, suite: true, test: true, ToyParser: true */

function start()
{
	var assert = chai.assert;
	mocha.setup( 'tdd' );

	suite( 'parse', function()
	{
		test( 'addition', function()
		{
			assert.deepEqual( ToyParser.parse( "1+1" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: 1 } } ] );
			assert.deepEqual( ToyParser.parse( "1+2+3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "+", left: 2, right: 3 } } } ] );
			assert.deepEqual( ToyParser.parse( "  1  +  2  +  \t3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "+", left: 2, right: 3 } } } ] );
		});

		test( 'operators', function()
		{
// Unimplemented operators are commented out. Obviously uncomment the ones that are supposed to work.
//			assert.deepEqual( ToyParser.parse( "x++" ), [ { tag: "ignore", body: { tag: "++", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( ToyParser.parse( "x--" ), [ { tag: "ignore", body: { tag: "--", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( ToyParser.parse( "~x" ), [ { tag: "ignore", body: { tag: "~", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( ToyParser.parse( "-x" ), [ { tag: "ignore", body: { tag: "-", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( ToyParser.parse( "foo isa bar" ), [ { tag: "ignore", body: { tag: "isa", left: { tag: "ident", name: "foo" }, right: { tag: "ident", name: "bar" } } } ] );
			assert.deepEqual( ToyParser.parse( "!foo" ), [ { tag: "ignore", body: { tag: "!", expression: { tag: "ident", name: "foo" } } } ] );
			assert.deepEqual( ToyParser.parse( "1*2/3%5" ), [ { tag: "ignore", body: { tag: "*", left: 1, right: { tag: "/", left: 2, right: { tag: "%", left: 3, right: 5 } } } } ] );
			assert.deepEqual( ToyParser.parse( "1+2-3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "-", left: 2, right: 3 } } } ] );
//			assert.deepEqual( ToyParser.parse( "1<<8>>2" ), [ { tag: "ignore", body: { tag: "<<", left: 1, right: { tag: ">>", left: 8, right: 2 } } } ] );
			assert.deepEqual( ToyParser.parse( "1<2<=3>4>=5<>6" ), [ { tag: "ignore", body: { tag: "<", left: 1, right: { tag: "<=", left: 2, right: { tag: ">", left: 3, right: { tag: ">=", left: 4, right: { tag: "<>", left: 5, right: 6 } } } } } } ] );
			assert.deepEqual( ToyParser.parse( "false==1!=1" ), [ { tag: "ignore", body: { tag: "==", left: false, right: { tag: "!=", left: 1, right: 1 } } } ] );
//			assert.deepEqual( ToyParser.parse( "1&2" ), [ { tag: "ignore", body: { tag: "&", left: 1, right: 2 } } ] );
//			assert.deepEqual( ToyParser.parse( "1^2" ), [ { tag: "ignore", body: { tag: "^", left: 1, right: 2 } } ] );
//			assert.deepEqual( ToyParser.parse( "1|2" ), [ { tag: "ignore", body: { tag: "|", left: 1, right: 2 } } ] );
			assert.deepEqual( ToyParser.parse( "true&&false" ), [ { tag: "ignore", body: { tag: "&&", left: true, right: false } } ] );
			assert.deepEqual( ToyParser.parse( "false||true" ), [ { tag: "ignore", body: { tag: "||", left: false, right: true } } ] );
		});

		test( 'assignment', function()
		{
			assert.deepEqual( ToyParser.parse( "a = 1" ), [ { "tag": "=", "left": "a", "right": 1 } ] );
			assert.deepEqual( ToyParser.parse( "a = b" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "b" } } ] );
			assert.deepEqual( ToyParser.parse( "a = a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "a" } } ] );
			assert.deepEqual( ToyParser.parse( "a = ( x, y ) => x + y" ), [ { tag: "=", left: "a", right: { tag: "function", body: { tag: "ignore", body: { tag: "+", left: { tag: "ident", name: "x" }, right: { tag: "ident", name: "y" } } }, args: [ { tag: "ident", name: "x" }, { tag: "ident", name: "y" } ] } } ] );
		});

		test( 'comments', function()
		{
			assert.deepEqual( ToyParser.parse( "a = 1 // Assign the value 1 to a" ), [ { "tag": "=", "left": "a", "right": 1 } ] );
			assert.deepEqual( ToyParser.parse( "a = b // Assign the value of b to a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "b" } } ] );
			assert.deepEqual( ToyParser.parse( "a = b // Assign the value of b to a\na = c" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "b" } }, { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "c" } } ] );
//			assert.deepEqual( ToyParser.parse( "a = /* mid-statement comment */ a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "a" } } ] );
//			assert.deepEqual( ToyParser.parse( "/*\n\tMulti-line comment!\n\tHere we assign a simple function value to a\n*/\na = ( x, y ) => x + y" ), [ { tag: "=", left: "a", right: { tag: "function", body: { tag: "ignore", body: { tag: "+", left: { tag: "ident", name: "x" }, right: { tag: "ident", name: "y" } } }, args: [ { tag: "ident", name: "x" }, { tag: "ident", name: "y" } ] } } ] );
			assert.deepEqual( ToyParser.parse( "// A comment as the last line" ), [] );
		});

		test( 'whitespace, newlines, EOF', function()
		{
			assert.deepEqual( ToyParser.parse( "" ), [] );
			assert.deepEqual( ToyParser.parse( " " ), [] );
			assert.deepEqual( ToyParser.parse( "\n  \nx = 1\t  \n  \t  " ), [ { "tag": "=", "left": "x", "right": 1 } ] );
		});

		test( 'literals', function()
		{
			assert.deepEqual( ToyParser.parse( "false" ), [ { tag: "ignore", body: false } ] );
			assert.deepEqual( ToyParser.parse( "true" ), [ { tag: "ignore", body: true } ] );
			assert.deepEqual( ToyParser.parse( "1" ), [ { tag: "ignore", body: 1 } ] );
			assert.deepEqual( ToyParser.parse( "0" ), [ { tag: "ignore", body: 0 } ] );
			assert.deepEqual( ToyParser.parse( "-2" ), [ { tag: "ignore", body: -2 } ] );
			assert.deepEqual( ToyParser.parse( "0.001" ), [ { tag: "ignore", body: 0.001 } ] );
			assert.deepEqual( ToyParser.parse( "-0.5" ), [ { tag: "ignore", body: -0.5 } ] );
			assert.deepEqual( ToyParser.parse( "null" ), [ { tag: "ignore", body: { tag: "null" } } ] );
			//assert.deepEqual( ToyParser.parse( "4.5e+4" ), [ { tag: "ignore", body: 45000 } ] );
			//assert.deepEqual( ToyParser.parse( "4.5e-4" ), [ { tag: "ignore", body: 0.00045 } ] );
			//assert.deepEqual( ToyParser.parse( "4.5e4" ), [ { tag: "ignore", body: 45000 } ] );
			assert.deepEqual( ToyParser.parse( "''" ), [ { tag: "ignore", body: "" } ] );
			assert.deepEqual( ToyParser.parse( '""' ), [ { tag: "ignore", body: "" } ] );
			assert.deepEqual( ToyParser.parse( "'single quoted string'" ), [ { tag: "ignore", body: "single quoted string" } ] );
			assert.deepEqual( ToyParser.parse( '"double quoted string"' ), [ { tag: "ignore", body: "double quoted string" } ] );
		});

		test( 'multi-line statements', function()
		{
			assert.deepEqual( ToyParser.parse( "b == 4 ? 4 :\n  b == 5 ? 5 :\n  b == 6 ? 6 : 7" ), [ { tag: "ignore", body: { tag: "ternary", expression: { tag: "==", left: { tag: "ident", name: "b" }, right: 4 }, left: 4, right: { tag: "ternary", expression: { tag: "==", left: { tag: "ident", name: "b" }, right: 5 }, left: 5, right: { tag: "ternary", expression: { tag: "==", left: { tag: "ident", name: "b" }, right: 6 }, left: 6, right: 7 } } } } ] );
			assert.deepEqual( ToyParser.parse( "a(\n5,\n6\n)" ), [ { tag: "ignore", body: { tag: "call", 'function': "a", args: [ 5, 6 ] } } ] );
			assert.deepEqual( ToyParser.parse( "a(\n)" ), [ { tag: "ignore", body: { tag: "call", 'function': "a", args: [] } } ] );
			assert.deepEqual( ToyParser.parse( "a = (\n) => n" ), [ { tag: "=", left: "a", right: { tag: "function", body: { tag: "ignore", body: { tag: "ident", name: "n" } }, args: [] } } ] );
			assert.deepEqual( ToyParser.parse( "a = () => {\n\tx = 5\n\ty = 6\n\ty * x\n}" ), [ { tag: "=", left: "a", right: { tag: "function", body: [ { tag: "=", left: "x", right: 5 }, { tag: "=", left: "y", right: 6 }, { tag: "ignore", body: { tag: "*", left: { tag: "ident", name: "y" }, right: { tag: "ident", name: "x" } } } ], args: [] } } ] );
		});

		test( 'special statements', function()
		{
			assert.deepEqual( ToyParser.parse( "module wibbly.test" ), [ { tag: "module", name: "wibbly.test" } ] );
			assert.deepEqual( ToyParser.parse( "import wibbly.test" ), [ { tag: "import", name: "wibbly.test" } ] );
			assert.deepEqual( ToyParser.parse( "import wibbly.test as foo" ), [ { tag: "import", name: "wibbly.test", alias: "foo" } ] );
			assert.deepEqual( ToyParser.parse( "return 5 + 5" ), [ { tag: "return", expression: { tag: "+", left: 5, right: 5 } } ] );
		});

		test( 'some problematic statements', function()
		{
			// These statements work fine now but caused very slow parsing or time-outs with previous parser versions
			assert.deepEqual( ToyParser.parse( "x" ), [ { "tag": "ignore", "body": { "tag": "ident", name: "x" } } ] );
			assert.deepEqual( ToyParser.parse( "((5))" ), [ { tag: 'ignore', body: 5 } ] );
			assert.deepEqual( ToyParser.parse( "((x) => { x * x })(5)" ), [ { tag: 'ignore', body: { tag: "call", "function": { "tag": "function", args: [ { tag: "ident", name: "x" } ], "body": [ { "tag": "ignore", "body": { "tag": "*", "left": { "tag": "ident", "name": "x" }, "right": { "tag": "ident", "name": "x" } } } ] }, args: [ 5 ] } } ] );
			assert.deepEqual( ToyParser.parse( "f((x) => {x*x})" ), [ { "tag": "ignore", "body": { "tag": "call", "function": "f", "args": [ { "tag": "function", "body": [ { "tag": "ignore", "body": { "tag": "*", "left": { "tag": "ident", "name": "x" }, "right": { "tag": "ident", "name": "x" } }} ], "args": [ { "tag": "ident", "name": "x" } ] }] } }] );
		});

		test( 'precedence', function()
		{
			assert.deepEqual( ToyParser.parse( "1+2*3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "*", left: 2, right: 3 } } } ] );
			assert.deepEqual( ToyParser.parse( "1*2+3" ), [ { tag: "ignore", body: { tag: "+", left: { tag: "*", left: 1, right: 2 }, right: 3 } } ] );
		});


		// Tests still todo: precedence, control structures (if, while, for)
	});


	mocha.run();
}

$( start );
