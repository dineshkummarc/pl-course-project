function endTime( expression, startTime)
{
	switch( expression.tag )
	{
		case "note": return expression.dur + startTime;
		case "rest": return expression.duration + startTime;
		case "par": return Math.max( endTime( expression.left, startTime ), endTime( expression.right, startTime ) );
		case "seq": return endTime( expression.right, endTime( expression.left, startTime ) );

		case "repeat":
		{
			var length = endTime( expression.section, 0 );
			return length * expression.count + startTime;
		}
	}
}

function compileRecursive( expression, startTime )
{
	var left, right;

	switch( expression.tag )
	{
		case "note":
		{
			var newNote = { tag: 'note', start: startTime, pitch: nameToNumber( expression.pitch ), dur: expression.dur };
			return [ newNote ];
		}

		case "rest": return [];

		case "seq":
		{
			left = compileRecursive( expression.left, startTime );
			right = compileRecursive( expression.right, endTime( expression.left, startTime ) );
			return left.concat( right );
		}

		case "par":
		{
			left = compileRecursive( expression.left, startTime );
			right = compileRecursive( expression.right, startTime );
			return left.concat( right );
		}

		case "repeat":
		{
			var length = endTime( expression.section, 0 );
			var result = [];

			for( var i = 0; i < expression.count; i++ )
			{
				result = result.concat( compileRecursive( expression.section, length * i + startTime ) );
			}

			return result;
		}
	}
}

noteNumbers = { 'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11 };

function nameToNumber( noteName )
{
	var note = noteName.charAt( 0 ).toLowerCase();
	var octave = parseInt( noteName.charAt( 1 ) );

	return ( ( octave + 1 ) * 12 ) + noteNumbers[ note ];
}

function compile( expression )
{
	return compileRecursive( expression, 0 );
}

var melody_mus = {
	tag: 'repeat',
	section: {
		tag: 'par',
		left: {
			tag: 'seq',
			left: {	tag: 'note', pitch: 'a4', dur: 250 },
			right: { tag: 'note', pitch: 'b4', dur: 250 }
		},
		right: {
			tag: 'seq',
			left: { tag: 'rest', duration: 50 },
			right: { tag: 'note', pitch: 'd4', dur: 500 }
		}
	},
	count: 4
};

console.log( melody_mus );
console.log( compile( melody_mus ) );