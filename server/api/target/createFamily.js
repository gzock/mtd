var fam = require('./family-seacher.js');

fam.createFamily('55fd69441f38fee149fbebc4', './list.csv', function(err, ret) {
	if(err) { conosole.log('err : ' + err); }
	console.log('ret : ' + ret);
	return;
});
