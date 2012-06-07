// Make lint happy
/*global chai: true, mocha: true, suite: true, test: true, ToyLang: true */

function start()
{
	var assert = chai.assert;
	var compiler = new ToyLang();
	mocha.setup( 'tdd' );

	suite( 'parse', function()
	{
		test( 'addition', function()
		{
			assert.deepEqual( compiler.parse( "1+1" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: 1 } } ] );
			assert.deepEqual( compiler.parse( "1+2+3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "+", left: 2, right: 3 } } } ] );
			assert.deepEqual( compiler.parse( "  1  +  2  +  \t3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "+", left: 2, right: 3 } } } ] );
		});

		test( 'operators', function()
		{
// Unimplemented operators are commented out. Obviously uncomment the ones that are supposed to work.
//			assert.deepEqual( compiler.parse( "x++" ), [ { tag: "ignore", body: { tag: "++", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parse( "x--" ), [ { tag: "ignore", body: { tag: "--", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parse( "~x" ), [ { tag: "ignore", body: { tag: "~", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parse( "-x" ), [ { tag: "ignore", body: { tag: "-", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parse( "foo isa bar" ), [ { tag: "ignore", body: { tag: "isa", left: { tag: "ident", name: "foo" }, right: { tag: "ident", name: "bar" } } } ] );
			assert.deepEqual( compiler.parse( "!foo" ), [ { tag: "ignore", body: { tag: "!", expression: { tag: "ident", name: "foo" } } } ] );
			assert.deepEqual( compiler.parse( "1*2/3%5" ), [ { tag: "ignore", body: { tag: "*", left: 1, right: { tag: "/", left: 2, right: { tag: "%", left: 3, right: 5 } } } } ] );
			assert.deepEqual( compiler.parse( "1+2-3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "-", left: 2, right: 3 } } } ] );
//			assert.deepEqual( compiler.parse( "1<<8>>2" ), [ { tag: "ignore", body: { tag: "<<", left: 1, right: { tag: ">>", left: 8, right: 2 } } } ] );
			assert.deepEqual( compiler.parse( "1<2<=3>4>=5<>6" ), [ { tag: "ignore", body: { tag: "<", left: 1, right: { tag: "<=", left: 2, right: { tag: ">", left: 3, right: { tag: ">=", left: 4, right: { tag: "<>", left: 5, right: 6 } } } } } } ] );
			assert.deepEqual( compiler.parse( "false==1!=1" ), [ { tag: "ignore", body: { tag: "==", left: false, right: { tag: "!=", left: 1, right: 1 } } } ] );
//			assert.deepEqual( compiler.parse( "1&2" ), [ { tag: "ignore", body: { tag: "&", left: 1, right: 2 } } ] );
//			assert.deepEqual( compiler.parse( "1^2" ), [ { tag: "ignore", body: { tag: "^", left: 1, right: 2 } } ] );
//			assert.deepEqual( compiler.parse( "1|2" ), [ { tag: "ignore", body: { tag: "|", left: 1, right: 2 } } ] );
			assert.deepEqual( compiler.parse( "true&&false" ), [ { tag: "ignore", body: { tag: "&&", left: true, right: false } } ] );
			assert.deepEqual( compiler.parse( "false||true" ), [ { tag: "ignore", body: { tag: "||", left: false, right: true } } ] );
		});

		test( 'assignment', function()
		{
			assert.deepEqual( compiler.parse( "a = 1" ), [ { "tag": "=", "left": "a", "right": 1 } ] );
			assert.deepEqual( compiler.parse( "a = b" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "b" } } ] );
			assert.deepEqual( compiler.parse( "a = a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "a" } } ] );
			assert.deepEqual( compiler.parse( "a = ( x, y ) => x + y" ), [ { tag: "=", left: "a", right: { tag: "function", body: [ { tag: "ignore", body: { tag: "+", left: { tag: "ident", name: "x" }, right: { tag: "ident", name: "y" } } } ], args: [ { tag: "ident", name: "x" }, { tag: "ident", name: "y" } ] } } ] );
		});

		test( 'comments', function()
		{
			assert.deepEqual( compiler.parse( "a = 1 // Assign the value 1 to a" ), [ { "tag": "=", "left": "a", "right": 1 } ] );
			assert.deepEqual( compiler.parse( "a = b // Assign the value of b to a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "b" } } ] );
			assert.deepEqual( compiler.parse( "a = b // Assign the value of b to a\na = c" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "b" } }, { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "c" } } ] );
//			assert.deepEqual( compiler.parse( "a = /* mid-statement comment */ a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "a" } } ] );
//			assert.deepEqual( compiler.parse( "/*\n\tMulti-line comment!\n\tHere we assign a simple function value to a\n*/\na = ( x, y ) => x + y" ), [ { tag: "=", left: "a", right: { tag: "function", body: { tag: "ignore", body: { tag: "+", left: { tag: "ident", name: "x" }, right: { tag: "ident", name: "y" } } }, args: [ { tag: "ident", name: "x" }, { tag: "ident", name: "y" } ] } } ] );
			assert.deepEqual( compiler.parse( "// A comment as the last line" ), [] );
		});

		test( 'whitespace, newlines, EOF', function()
		{
			assert.deepEqual( compiler.parse( "" ), [] );
			assert.deepEqual( compiler.parse( " " ), [] );
			assert.deepEqual( compiler.parse( "\n  \nx = 1\t  \n  \t  " ), [ { "tag": "=", "left": "x", "right": 1 } ] );
		});

		test( 'literals', function()
		{
			assert.deepEqual( compiler.parse( "false" ), [ { tag: "ignore", body: false } ] );
			assert.deepEqual( compiler.parse( "true" ), [ { tag: "ignore", body: true } ] );
			assert.deepEqual( compiler.parse( "1" ), [ { tag: "ignore", body: 1 } ] );
			assert.deepEqual( compiler.parse( "0" ), [ { tag: "ignore", body: 0 } ] );
			assert.deepEqual( compiler.parse( "-2" ), [ { tag: "ignore", body: -2 } ] );
			assert.deepEqual( compiler.parse( "0.001" ), [ { tag: "ignore", body: 0.001 } ] );
			assert.deepEqual( compiler.parse( "-0.5" ), [ { tag: "ignore", body: -0.5 } ] );
			assert.deepEqual( compiler.parse( "null" ), [ { tag: "ignore", body: { tag: "null" } } ] );
			//assert.deepEqual( compiler.parse( "4.5e+4" ), [ { tag: "ignore", body: 45000 } ] );
			//assert.deepEqual( compiler.parse( "4.5e-4" ), [ { tag: "ignore", body: 0.00045 } ] );
			//assert.deepEqual( compiler.parse( "4.5e4" ), [ { tag: "ignore", body: 45000 } ] );
			assert.deepEqual( compiler.parse( "''" ), [ { tag: "ignore", body: "" } ] );
			assert.deepEqual( compiler.parse( '""' ), [ { tag: "ignore", body: "" } ] );
			assert.deepEqual( compiler.parse( "'single quoted string'" ), [ { tag: "ignore", body: "single quoted string" } ] );
			assert.deepEqual( compiler.parse( '"double quoted string"' ), [ { tag: "ignore", body: "double quoted string" } ] );
		});

		test( 'multi-line statements', function()
		{
			assert.deepEqual( compiler.parse( "b == 4 ? 4 :\n  b == 5 ? 5 :\n  b == 6 ? 6 : 7" ), [ { tag: "ignore", body: { tag: "ternary", expression: { tag: "==", left: { tag: "ident", name: "b" }, right: 4 }, left: 4, right: { tag: "ternary", expression: { tag: "==", left: { tag: "ident", name: "b" }, right: 5 }, left: 5, right: { tag: "ternary", expression: { tag: "==", left: { tag: "ident", name: "b" }, right: 6 }, left: 6, right: 7 } } } } ] );
			assert.deepEqual( compiler.parse( "a(\n5,\n6\n)" ), [ { tag: "ignore", body: { tag: "call", 'function': { "tag": "ident", "name": "a" }, args: [ 5, 6 ] } } ] );
			assert.deepEqual( compiler.parse( "a(\n)" ), [ { tag: "ignore", body: { tag: "call", 'function': { "tag": "ident", "name": "a" }, args: [] } } ] );
			assert.deepEqual( compiler.parse( "a = (\n) => n" ), [ { tag: "=", left: "a", right: { tag: "function", body: [ { tag: "ignore", body: { tag: "ident", name: "n" } } ], args: [] } } ] );
			assert.deepEqual( compiler.parse( "a = () => {\n\tx = 5\n\ty = 6\n\ty * x\n}" ), [ { tag: "=", left: "a", right: { tag: "function", body: [ { tag: "=", left: "x", right: 5 }, { tag: "=", left: "y", right: 6 }, { tag: "ignore", body: { tag: "*", left: { tag: "ident", name: "y" }, right: { tag: "ident", name: "x" } } } ], args: [] } } ] );
		});

		test( 'special statements', function()
		{
			assert.deepEqual( compiler.parse( "module wibbly.test" ), [ { tag: "module", name: "wibbly.test" } ] );
			assert.deepEqual( compiler.parse( "import wibbly.test" ), [ { tag: "import", name: "wibbly.test" } ] );
			assert.deepEqual( compiler.parse( "import wibbly.test as foo" ), [ { tag: "import", name: "wibbly.test", alias: "foo" } ] );
			assert.deepEqual( compiler.parse( "return 5 + 5" ), [ { tag: "return", expression: { tag: "+", left: 5, right: 5 } } ] );
		});

		test( 'some problematic statements', function()
		{
			// These statements work fine now but caused very slow parsing or time-outs with previous parser versions
			assert.deepEqual( compiler.parse( "x" ), [ { "tag": "ignore", "body": { "tag": "ident", name: "x" } } ] );
			assert.deepEqual( compiler.parse( "((5))" ), [ { tag: 'ignore', body: 5 } ] );
			assert.deepEqual( compiler.parse( "((x) => { x * x })(5)" ), [ { tag: 'ignore', body: { tag: "call", "function": { "tag": "function", args: [ { tag: "ident", name: "x" } ], "body": [ { "tag": "ignore", "body": { "tag": "*", "left": { "tag": "ident", "name": "x" }, "right": { "tag": "ident", "name": "x" } } } ] }, args: [ 5 ] } } ] );
			assert.deepEqual( compiler.parse( "f((x) => {x*x})" ), [ { "tag": "ignore", "body": { "tag": "call", "function": { "tag": "ident", "name": "f" }, "args": [ { "tag": "function", "body": [ { "tag": "ignore", "body": { "tag": "*", "left": { "tag": "ident", "name": "x" }, "right": { "tag": "ident", "name": "x" } }} ], "args": [ { "tag": "ident", "name": "x" } ] }] } }] );
		});

		test( 'precedence and associativity', function()
		{
			assert.deepEqual( compiler.parse( "1+2*3" ), [ { tag: "ignore", body: { tag: "+", left: 1, right: { tag: "*", left: 2, right: 3 } } } ] );
			assert.deepEqual( compiler.parse( "1*2+3" ), [ { tag: "ignore", body: { tag: "+", left: { tag: "*", left: 1, right: 2 }, right: 3 } } ] );
		});


		// Tests still todo: precedence, control structures (if, while, for)
	});


	suite( 'evaluate', function()
	{
		test( 'addition', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "1+1" ), 2 );
			assert.deepEqual( compiler.parseAndEvaluate( "1+2+3" ), 6 );
			assert.deepEqual( compiler.parseAndEvaluate( "  1  +  2  +  \t3" ), 6 );
		});

		test( 'operators', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "!foo", { bindings: { "foo": true } } ), false );
			assert.deepEqual( compiler.parseAndEvaluate( "1*2/3%5" ), 2 / 3 );
			assert.deepEqual( compiler.parseAndEvaluate( "1+2-3" ), 0 );
			assert.deepEqual( compiler.parseAndEvaluate( "true&&false" ), false );
			assert.deepEqual( compiler.parseAndEvaluate( "false||true" ), true );
			assert.deepEqual( compiler.parseAndEvaluate( "false==1!=1" ), true );
			assert.deepEqual( compiler.parseAndEvaluate( "1<2<=3>4>=5<>6" ), false );
// Unimplemented operators are commented out. Obviously uncomment the ones that are supposed to work.
//			assert.deepEqual( compiler.parseAndEvaluate( "x++" ), [ { tag: "ignore", body: { tag: "++", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "x--" ), [ { tag: "ignore", body: { tag: "--", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "~x" ), [ { tag: "ignore", body: { tag: "~", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "-x" ), [ { tag: "ignore", body: { tag: "-", expression: { tag: "ident", name: "x" } } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "foo isa bar" ), [ { tag: "ignore", body: { tag: "isa", left: { tag: "ident", name: "foo" }, right: { tag: "ident", name: "bar" } } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "1<<8>>2" ), [ { tag: "ignore", body: { tag: "<<", left: 1, right: { tag: ">>", left: 8, right: 2 } } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "1&2" ), [ { tag: "ignore", body: { tag: "&", left: 1, right: 2 } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "1^2" ), [ { tag: "ignore", body: { tag: "^", left: 1, right: 2 } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "1|2" ), [ { tag: "ignore", body: { tag: "|", left: 1, right: 2 } } ] );
		});

		test( 'assignment', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "a = 1" ), 1 );
			assert.deepEqual( compiler.parseAndEvaluate( "a = b", { bindings: { "b": 5 } } ), 5 );
			assert.deepEqual( compiler.parseAndEvaluate( "a = a", { bindings: { "a": 7 } } ), 7 );
		});

		test( 'comments', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "a = 1 // Assign the value 1 to a" ), 1 );
			assert.deepEqual( compiler.parseAndEvaluate( "a = b // Assign the value of b to a", { bindings: { "b": 5 } } ), 5 );
			assert.deepEqual( compiler.parseAndEvaluate( "a = b // Assign the value of b to a\na = c", { bindings: { "b": 5, "c": 13 } } ), 13 );
//			assert.deepEqual( compiler.parseAndEvaluate( "a = /* mid-statement comment */ a" ), [ { "tag": "=", "left": "a", "right": { "tag": "ident", "name": "a" } } ] );
//			assert.deepEqual( compiler.parseAndEvaluate( "/*\n\tMulti-line comment!\n\tHere we assign a simple function value to a\n*/\na = ( x, y ) => x + y" ), [ { tag: "=", left: "a", right: { tag: "function", body: { tag: "ignore", body: { tag: "+", left: { tag: "ident", name: "x" }, right: { tag: "ident", name: "y" } } }, args: [ { tag: "ident", name: "x" }, { tag: "ident", name: "y" } ] } } ] );
			assert.deepEqual( compiler.parseAndEvaluate( "// A comment as the last line" ), undefined );
		});

		test( 'whitespace, newlines, EOF', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "" ), undefined );
			assert.deepEqual( compiler.parseAndEvaluate( " " ), undefined );
			assert.deepEqual( compiler.parseAndEvaluate( "\n  \nx = 1\t  \n  \t  " ), 1 );
		});

		test( 'literals', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "false" ), false );
			assert.deepEqual( compiler.parseAndEvaluate( "true" ), true );
			assert.deepEqual( compiler.parseAndEvaluate( "1" ), 1 );
			assert.deepEqual( compiler.parseAndEvaluate( "0" ), 0 );
			assert.deepEqual( compiler.parseAndEvaluate( "-2" ), -2 );
			assert.deepEqual( compiler.parseAndEvaluate( "0.001" ), 0.001 );
			assert.deepEqual( compiler.parseAndEvaluate( "-0.5" ), -0.5 );
			assert.deepEqual( compiler.parseAndEvaluate( "null" ), null );
			//assert.deepEqual( compiler.parseAndEvaluate( "4.5e+4" ), 45000 );
			//assert.deepEqual( compiler.parseAndEvaluate( "4.5e-4" ), 0.00045 );
			//assert.deepEqual( compiler.parseAndEvaluate( "4.5e4" ), 45000 );
			assert.deepEqual( compiler.parseAndEvaluate( "''" ), "" );
			assert.deepEqual( compiler.parseAndEvaluate( '""' ), "" );
			assert.deepEqual( compiler.parseAndEvaluate( "'single quoted string'" ), "single quoted string" );
			assert.deepEqual( compiler.parseAndEvaluate( '"double quoted string"' ), "double quoted string" );
		});

		test( 'multi-line statements', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "b == 4 ? 4 :\n  b == 5 ? 5 :\n  b == 6 ? 6 : 7", { "bindings": { "b": 5 } } ), 5 );
			assert.deepEqual( compiler.parseAndEvaluate( "a(\n5,\n6\n)", { bindings: { a: function(a,b){ return a*b; } } } ), 30 );
			assert.deepEqual( compiler.parseAndEvaluate( "a(\n)", { bindings: { a: function(){ return "woot"; } } } ), "woot" );
			assert.deepEqual( compiler.parseAndEvaluate( "a = (\n) => n", { "bindings": { "n": 17 } } )(), 17 );
			assert.deepEqual( compiler.parseAndEvaluate( "a = () => {\n\tx = 5\n\ty = 6\n\ty * x\n}" )(), 30 );
		});

		test( 'special statements', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "module wibbly.test" ), undefined );
			assert.deepEqual( compiler.parseAndEvaluate( "import wibbly.test" ), undefined );
			assert.deepEqual( compiler.parseAndEvaluate( "import wibbly.test as foo" ), undefined );
			assert.deepEqual( compiler.parseAndEvaluate( "return 5 + 5" ), 10 );		});

		test( 'some problematic statements', function()
		{
			// These statements work fine now but caused very slow parsing or time-outs with previous parseAndEvaluater versions
			assert.deepEqual( compiler.parseAndEvaluate( "x", { "bindings": { "x": 5 } } ), 5 );
			assert.deepEqual( compiler.parseAndEvaluate( "((5))" ), 5 );
			assert.deepEqual( compiler.parseAndEvaluate( "((x) => { x * x })(5)" ), 25 );
			assert.deepEqual( compiler.parseAndEvaluate( "f((x) => {x*x})", { bindings: { f: function(f){ return function( n ){ return f( f( n) ); }; } } } )( 2 ), 16 );
		});

		test( 'precedence and associativity', function()
		{
			assert.deepEqual( compiler.parseAndEvaluate( "1+2*3" ), 7 );
			assert.deepEqual( compiler.parseAndEvaluate( "1*2+3" ), 5 );
		});


		// Tests still todo: precedence, control structures (if, while, for)
	});

	mocha.run();
}

$( start );
