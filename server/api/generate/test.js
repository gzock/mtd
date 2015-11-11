var gen = require('./generate.js');
var Project = require('../project/project.model.js');

Project.findById('55aade95f9cbb3815680ae06', function(err, pj) {
	if(err) { console.log('err ' + err); }
	gen.generate(pj, function(err) {
		if(err) { console.log('err ' + err); }
		return;
	});
});
