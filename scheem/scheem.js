function evalScheem( expr, env )
{
	// Declare locals that get reused
	var i, newEnv;

	if( expr[ 0 ] === "always3" )
	{
		console.log( "Before");
		console.log( env );
	}

	if( typeof env.outer === "undefined" ) env.outer = builtins();
	if( typeof env.bindings === "undefined" ) env.bindings = {};

	if( expr[ 0 ] === "always3" )
	{
		console.log( env );
	}

	// Helpers
	// evaluate the parameter with the given index
	var e = function( index )
	{
		if( typeof expr[ index ] === "undefined" )
			throw new Error( "Tried to evaluate parameter " + index + " but it was not provided" );

		return evalScheem( expr[ index ], env );
	};

	// get the value of the variable called name
	var v = function( name, value )
	{
		if( typeof value !== "undefined" )
			update( env, name, value );

		return lookup( env, name );
	};

	// Numbers evaluate to themselves
	if( typeof expr === 'number' )
	{
		return expr;
	}
	// Strings are variable references
	if( typeof expr === 'string' )
	{
		return v( expr );
	}
	// Look at head of list for operation
	switch( expr[ 0 ] )
	{
		case 'if':
			return e(1) === "#t" ? e(2) : e(3);			
		case 'define':
			add_binding( env, expr[ 1 ], e(2) );
			return 0;
		case 'set!':
			v( expr[ 1 ], e(2) );
			return 0;
		case 'begin':
			var result;
			for( i = 1; i < expr.length; i++ )
			{
				result = e(i);
			}
			return result;
		case 'quote':
			return expr[ 1 ];
		case 'let':
			if( typeof expr[ 1 ] !== "object" )
				throw new Error( "Expected a list of variable assignments to let" );

			newEnv = { bindings: {}, outer: env };

			for( i = 0; i < expr[ 1 ].length; i++ )
			{
				var pair = expr[ 1 ][ i ];
				add_binding( newEnv, pair[ 0 ], pair[ 1 ] );
			}
			return evalScheem(expr[2], newEnv);
		case 'lambda':
			if( typeof expr[ 1 ] !== "object" )
				throw new Error( "The formal arguments passed to lambda were not a list" );

			return function()
			{
				var newEnv = { bindings: {}, outer: env };
				for( i = 0; i < arguments.length; i++ )
				{
					add_binding( newEnv, expr[ 1 ][ i ], arguments[ i ] );
				}
				return evalScheem( expr[ 2 ], newEnv );
			};	
		default:
			var args = [];
			for( i = 1; i < expr.length; i++ )
			{
				args.push( e(i) );
			}
			return e(0).apply( null, args );

	}
}

function builtins( outer )
{
	var environment = {
		outer: {},
		bindings: {
			'+': function()
			{
				var total = 0;
				for( var i = 0; i < arguments.length; i++ )	total += arguments[ i ];
				return total;
			},
			'-': function()
			{
				if( arguments.length === 0 ) return 0;
				if( arguments.length === 1 ) return -arguments[ 0 ];

				var total = arguments[ 0 ];
				for( var i = 1; i < arguments.length; i++ )	total -= arguments[ i ];
				return total;
			},
			'*': function()
			{
				var total = 1;
				for( var i = 0; i < arguments.length; i++ )	total *= arguments[ i ];
				return total;				
			},
			'/': function()
			{
				if( arguments.length === 0 ) throw new Error( "/ called with no arguments" );

				var total = arguments[ 0 ];
				for( var i = 1; i < arguments.length; i++ ) total /= arguments[ i ];
				return total;				
			},
			'=': function( a, b )
			{
				return a === b ? '#t' : '#f';
			},
			'<': function( a, b )
			{
				return a < b ? '#t' : '#f';
			},
			'>': function( a, b )
			{
				return a > b ? '#t' : '#f';
			},
			'cons': function( head, tail )
			{
				return [ head ].concat( tail );
			},
			'car': function( list )
			{
				return list[0];
			},
			'cdr': function( list )
			{
				return list.slice(1);
			},
			'alert': function( expression )
			{
				if( typeof alert === "function" )
				{
					alert( expression );
				}
				else
				{
					console.log( expression );
				}
			}
		}
	};

	return environment;
}

function add_binding( environment, name, value )
{
    environment.bindings[ name ] = value;
}

function lookup( environment, name )
{
	if( typeof environment.bindings[ name ] !== "undefined" )
	{
		return environment.bindings[ name ];
	}
	else
	{
		if( typeof environment.outer.bindings === "undefined" )
			throw new Error( "Tried to access variable '" + name + "', but it was not defined" );

		return lookup( environment.outer, name );
	}
}

function update( environment, name, value )
{
	if( typeof environment.bindings[ name ] !== "undefined" )
	{
		environment.bindings[ name ] = value;
	}
	else
	{
		if( typeof environment.outer.bindings === "undefined" )
			throw new Error( "Tried to access variable '" + name + "', but it was not defined" );

		update( environment.outer, name, value );
	}
}

function evalScheemString( input, environment )
{
	var expression = SCHEEM.parse( input );

	return evalScheem( expression, environment );
}