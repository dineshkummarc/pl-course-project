function evalScheem( expr, env )
{
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
		if( typeof env[ name ] === "undefined" )
			throw new Error( "Tried to access variable '" + name + "', but it was not defined" );

		if( typeof value !== "undefined" )
			env[ name ] = value;

		return env[ name ];
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
		case '+':
			return e(1) + e(2);
		case '-':
			return e(1) - e(2);
		case '*':
			return e(1) * e(2);
		case '/':
			return e(1) / e(2);
		case 'define':
			env[ expr[ 1 ] ] = e(2); // We skip calling v() because we don't need to have already defined the variable in this case
			return 0;
		case 'set!':
			v( expr[ 1 ], e(2) );
			return 0;
		case 'begin':
			var result;
			for( var i = 1; i < expr.length; i++ )
			{
				result = e(i);
			}
			return result;
		case 'quote':
			return expr[ 1 ];
		case '=':
			return ( e(1) === e(2) ) ? '#t' : '#f';
		case '<':
			return ( e(1) < e(2) ) ? '#t' : '#f';
		case '>':
			return ( e(1) > e(2) ) ? '#t' : '#f';
		case 'cons':
			return [ e(1) ].concat( e(2) );
		case 'car':
			return e(1)[0];
		case 'cdr':
			return e(1).slice(1);
		case 'if':
			return e(1) === "#t" ? e(2) : e(3);
	}
}

function evalScheemString( input, environment )
{
	var expression = SCHEEM.parse( input );

	return evalScheem( expression, environment );
}