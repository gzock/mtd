var fs = require('fs');
var rl = require('readline');
 
  
var inputStream = fs.createReadStream('./list.csv');
var inputReadLine = rl.createInterface({'input': inputStream, 'output': {}});
var regex = new RegExp("\\t", "g");

inputReadLine
		.on('line', function(line){
			if(line.replace(regex, "").slice(0,1) === "\*") { line += "_tgt"; }
			console.log(line);
		})
		.on('close', function() {
		});
