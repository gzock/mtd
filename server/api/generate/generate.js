var fs = require('fs');
var async = require('async');
var archiver = require('archiver');
var family = require('../target/family-seacher.js');
var ZIP_PATH = '../../../zip/';
var PHOTO_PATH = '../../..//photos/';

function generate(pj, cb) {
	var genZip = ZIP_PATH + pj.name + '_' + pj._id + '.zip';

		family.getAllAdoptPhotos(pj._id, function(err, names) {
			// copy
			var cnt = 0;
			var archive = archiver('zip', {});
			var ret = null;
			var output = fs.createWriteStream(genZip);
			var dir = pj.name + '_' + pj._id + '/';
			archive.append(null, { name: dir });
			archive.pipe(output);

			async.forEach(names, function(name, done) {
				cnt++;
				archive.append(
					fs.createReadStream(PHOTO_PATH + name.src),
					{ name:
									dir
									+ convertNum(cnt, 5) + '_'
									+ name.bfrAft + '_'
									+ name.name + '_'
									+ name._id
									+ '.jpg'
					}
				);
				return done();

			}, function(err) {
				archive.finalize();
				if(err) { return cb(err); }

				output.on('close', function() {
					return cb(null, genZip);
				});
			});
		});
};


function mkdir(name, cb) {
	fs.stat(name, function(err, stat) {
		if(err) { 
			fs.mkdir(name, '755', function(err) {
				if(err) { return cb(err); }
				return cb(null);
			});
		} else {
			if(stat.isDirectory()) { return cb(null); }
			return cb('Target directory is exists as file');
		}
	});
};

function copy(src, dst, cb) {
	var srcFile = fs.createReadStream(src)
	var dstFile = fs.createWriteStream(dst);

	srcFile.addListener("data", function(chunk) {
		dstFile.write(chunk);
	})
	srcFile.addListener("close",function() {
		dstFile.end();
		return cb();
	});
};

function convertNum(num, figures) {
	var str = String(num);
	while (str.length < figures) {
		str = "0" + str;
	}
	return str;
}


exports.mkdir = mkdir;
exports.generate = generate;
