var parser = function()
{
	this.position = 0;
	this.input = "";

	this.parse = function( input )
	{
		this.input = input;

		var statements = [];
		var statement;

		this.consume_whitespace( true );

		statement = this.parse_statement();

		while( statement !== null && this.position < this.input.length )
		{
			statements.push( statement );
			this.consume_whitespace( true );
			statement = this.parse_statement();
		}

		return statements;
	};

	this.consume_whitespace = function( include_newlines )
	{
		var regex = include_newlines ? /^[ \t\n]/ : /^[ \t]/;

		while( regex.test( this.input.charAt( this.position ) ) )
		{
			this.position++;
		}
	};

	this.parse_statement = function()
	{
		var identifier = this.parse_identifier();

		if( identifier !== null )
		{
			return [ identifier ];
		}
		else
		{
			return null;
		}
	};

	this.parse_identifier = function()
	{
		var match = /^[A-Za-z][A-Za-z0-9_]*/.exec( this.input.substr( this.position ) );

		if( match === null )
		{
			return null;
		}

		this.position += match[ 0 ].length;

		return match[ 0 ];
	};	
};

var ToyParser = new parser();