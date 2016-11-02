var Transform = require('stream').Transform;
var util = require( "util" ).inherits;
var commander = require('commander');
var fs = require('fs');

//Constructor to be used for Transforming the input data
function PatternMatch(PM){
	this.PM = PM;
	
	Transform.call( this, { objectMode: true });
}

util(PatternMatch, Transform);

//Function to transform the input data and rearrange it depending on given input
PatternMatch.prototype._transform = function (chunk, encoding, getNext){

	var data = chunk.toString();
    if (this._lastLineData) data = this._lastLineData + data;
 
    var lines = data.split(this.PM);
    this._lastLineData = lines.splice(lines.length-1,1)[0];
    lines.forEach(this.push.bind(this));
  
    getNext();
}
//Output values to the stream
PatternMatch.prototype._flush = function (complete) { 
	if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
   
    complete();
}
//This will take in the type of parsing you want to do for example <node assignment3 -p .>
commander
    .option('-p, --pattern <pattern>', 'Input: "."" /n ","')
    .parse(process.argv);

//Opens an input stream
var inputStream = fs.createReadStream( "input-sensor.txt" );

//Runs through given file and finds "." or "," depending on given command
var patternStream = inputStream.pipe(new PatternMatch(commander.pattern));

//Get the results from the input and store them
var results = [];

//Returns Errors
patternStream.on('readable', function() {
	var MatchFound;
	while ((MatchFound = patternStream.read()) !== null) {
		results.push(MatchFound);
	}
});

//Output the read text the was taken in onto the console
console.log("===Input===");
inputStream.pipe(process.stdout);

//Output the text that has been manipulated onto the console
patternStream.on('end', function() {
	console.log("===Output===");
	console.log(results);
});
