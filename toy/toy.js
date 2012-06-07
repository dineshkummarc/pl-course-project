/*global ToyParser: true */

function ToyLang()
{
	this.modules = {};
	this.defaultEnvironment = this.builtins();
}

ToyLang.prototype.parse = function( program )
{
	return ToyParser.parse( program );
};

ToyLang.prototype.evaluate = function( program, env )
{
	if( typeof env === "undefined" ) env = { bindings: {}, outer: this.defaultEnvironment };
	else if( typeof env.outer === "undefined" ) env.outer = {};

	var statement, value;

	for( var i = 0; i < program.length; i++ )
	{
		statement = program[ i ];
		value = undefined;

		switch( statement.tag )
		{
			case "ignore":
				value = this.evaluateExpression( statement.body, env );
				break;
			case "=":
				value = this.evaluateExpression( statement.right, env );
				if( !this.update( env, statement.left, value ) ) this.add_binding( env, statement.left, value );
				break;
			case "module":
				// env.outer is the builtins
				// env.outer.outer === {}
				// So env.outer.outer.outer is undefined
				if( typeof env.module !== "undefined" )
				{
					throw new Error( "Only one module can be declared per file" );
				}
				if( typeof env.outer.outer.outer !== "undefined" )
				{
					throw new Error( "Can only declare modules in the top level of a file" );
				}
				this.modules[ statement.name ] = env.bindings;
				env.module = statement.name;
				break;
			case "import":
				var name = statement.name;

				if( name === env.module )
				{
					throw new Error( "Cannot import a module into itself" );
				}
				if( typeof env.outer.outer.outer !== "undefined" )
				{
					throw new Error( "Can only import modules at the top level of a file" );
				}

				var module = this.modules[ name ];
				if( typeof statement.alias !== "undefined" ) name = statement.alias;
				this.add_binding( env, name, module );

				break;
			case "return":
				return this.evaluateExpression( statement.expression, env );
			default:
				throw new Error( "Unknown statement type '" + statement.tag + "'" );
		}
	}

	return value;
};

ToyLang.prototype.evaluateExpression = function( expr, env )
{
	var me;

	// Numbers evaluate to themselves
	if( typeof expr !== 'object' )
	{
		return expr;
	}

	switch( expr.tag )
	{
		case "+":
			return this.evaluateExpression( expr.left, env ) + this.evaluateExpression( expr.right, env );
		case "-":
			return this.evaluateExpression( expr.left, env ) - this.evaluateExpression( expr.right, env );
		case "*":
			return this.evaluateExpression( expr.left, env ) * this.evaluateExpression( expr.right, env );
		case "/":
			return this.evaluateExpression( expr.left, env ) / this.evaluateExpression( expr.right, env );
		case "%":
			return this.evaluateExpression( expr.left, env ) % this.evaluateExpression( expr.right, env );
		case "==":
			return this.evaluateExpression( expr.left, env ) === this.evaluateExpression( expr.right, env );
		case "!=":
			return this.evaluateExpression( expr.left, env ) !== this.evaluateExpression( expr.right, env );
		case "<":
			return this.evaluateExpression( expr.left, env ) < this.evaluateExpression( expr.right, env );
		case ">":
			return this.evaluateExpression( expr.left, env ) > this.evaluateExpression( expr.right, env );
		case "<=":
			return this.evaluateExpression( expr.left, env ) <= this.evaluateExpression( expr.right, env );
		case ">=":
			return this.evaluateExpression( expr.left, env ) >= this.evaluateExpression( expr.right, env );
		case "<>":
			return this.evaluateExpression( expr.left, env ) != this.evaluateExpression( expr.right, env );
		case "&&":
			return this.evaluateExpression( expr.left, env ) && this.evaluateExpression( expr.right, env );
		case "||":
			return this.evaluateExpression( expr.left, env ) || this.evaluateExpression( expr.right, env );
		case "ternary":
			return this.evaluateExpression( expr.expression, env ) ? this.evaluateExpression( expr.left, env ) : this.evaluateExpression( expr.right, env );
		case "!":
			return !this.evaluateExpression( expr.expression, env );
		case "ident":
			return this.lookup( env, this.evaluateExpression( expr.name, env ) );
		case "null":
			return null;
		case "call":
			var callee = this.evaluateExpression( expr[ "function" ], env );
			var args = [];

			if( typeof callee === "function" ) callee = { type: "function", func: callee };

			for( var i = 0; i < expr.args.length; i++ )
			{
				if( callee.type === "macro" )
				{
					args.push( expr.args[ i ] );
				}
				else
				{
					args.push( this.evaluateExpression( expr.args[ i ], env ) );
				}
			}

			return callee.func.apply( env, args );
		case "function":
			me = this;
			return function()
			{
				var newEnv = { bindings: {}, outer: env };
				for( i = 0; i < arguments.length; i++ )
				{
					me.add_binding( newEnv, expr.args[ i ].name, arguments[ i ] );
				}
				return me.evaluate( expr.body, newEnv );
			};
		case "block":
			return this.evaluate( expr.body, env );
		case "macro":
			me = this;
			return { type: "macro", func: function()
			{
				var newEnv = { bindings: {},  outer: { bindings: this.bindings, outer: env } };
				newEnv.bindings[ "eval" ] = { type: "function", func: function( expression )
				{
					return me.evaluateExpression( expression, newEnv );
				} };

				for( i = 0; i < arguments.length; i++ )
				{
					me.add_binding( newEnv, expr.args[ i ].name, arguments[ i ] );
				}
				return me.evaluate( expr.body, newEnv );
			} };
		default:
			throw new Error( "Unknown expression type '" + expr.tag + "'" );
	}
};

ToyLang.prototype.builtins = function()
{
	return {
		bindings:
		{
			'alert': { type: "function", func: function( expression )
			{
				if( typeof alert === "function" )
				{
					alert( expression );
				}
				else
				{
					console.log( expression );
				}
			} }
		},
		outer: {}
	};
};

ToyLang.prototype.add_binding = function( environment, name, value )
{
    environment.bindings[ name ] = value;
};

ToyLang.prototype.lookup = function( environment, name )
{
	if( typeof environment.bindings[ name ] !== "undefined" )
	{
		return environment.bindings[ name ];
	}
	else
	{
		if( typeof environment.outer.bindings === "undefined" )
			throw new Error( "Tried to access variable '" + name + "', but it was not defined" );

		return this.lookup( environment.outer, name );
	}
};

ToyLang.prototype.update = function( environment, name, value )
{
	if( typeof environment.bindings[ name ] !== "undefined" )
	{
		environment.bindings[ name ] = value;
		return true;
	}
	else
	{
		if( typeof environment.outer.bindings === "undefined" )
		{
			return false;
		}

		return this.update( environment.outer, name, value );
	}
};

ToyLang.prototype.parseAndEvaluate = function( input, environment )
{
	var expression = this.parse( input );

	return this.evaluate( expression, environment );
};

ToyLang.prototype.thunk = function( f )
{
    var args = Array.prototype.slice.call( arguments );
    args.shift();
    return { tag: "thunk", func: f, args: args };
};