var family = require('./family-seacher.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mtd-dev');

family.getAllAdoptPhotos('55aade95f9cbb3815680ae06', function(err, data) {
	if(err) { console.log(err); return -1; }
	console.log(JSON.stringify(data));
});
