var Transform = require('stream').Transform;
var util = require( "util" ).inherits;
var commander = require('commander');
var fs = require('fs');

function PatternMatch(PM){
	this.PM = PM;
	
	Transform.call( this, { objectMode: true });
}

util(PatternMatch, Transform);

PatternMatch.prototype._transform = function (chunk, encoding, getNext){

	var data = chunk.toString();
    if (this._lastLineData) data = this._lastLineData + data;
 
    var lines = data.split(this.PM);
    this._lastLineData = lines.splice(lines.length-1,1)[0];
    lines.forEach(this.push.bind(this));
  
    getNext();
}

PatternMatch.prototype._flush = function (complete) { 
	if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
   
    complete();
}

commander
    .option('-p, --pattern <pattern>', 'Input: "."" /n ","')
    .parse(process.argv);
    
var inputStream = fs.createReadStream( "input-sensor.txt" );

var patternStream = inputStream.pipe(new PatternMatch(commander.pattern));

var results = [];

patternStream.on('readable', function() {
	var MatchFound;
	while ((MatchFound = patternStream.read()) !== null) {
		results.push(MatchFound);
	}
});

console.log("===Input===");
inputStream.pipe(process.stdout);

patternStream.on('end', function() {
	console.log("===Output===");
	console.log(results);
});
