var Target = require('./target.model.js');
var Pro = require('./target.model.js');
var async = require('async');
var fs = require('fs');
var rl = require('readline');
var jschardet = require('jschardet');
var Iconv = require('iconv').Iconv;

var array = [];

//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/mtd-dev');

function search(searchId, cb) {
	var array = [];
	var query = { parent: searchId };
	console.log("Search ID : " + searchId);

	Target.find({'parent': searchId}, function(err, datas) {
		if(err) { console.log("Error : " + err); return cb(err); }
		if(!datas) { console.log("Parent is " + searchId + " Not Found."); return cb('NotFound'); }
		console.log("Length : "  + datas.length);
		array = array.concat(datas);
		
		//async.forEachSeries(datas, function(data, done) {
		async.mapSeries(datas, function(data, next) {
			//console.log("data : " + data._id);
			//console.log("name : " + data.name);
			search(data._id, function(err, data) {
				next(err, data);
			});
		
		}, function(err, ret) {
			for(var i in ret) {
				array = array.concat(ret[i]);
			}
			return cb(err, array);
		});
	});

};

function getChildren(id, cb) {
	search(id, function(err, array) {
		return cb(err, array);
	});
};


function updatePhotoTotalCnt(target, cb) {
	
	var loopFlg = true;
	if(target.type == 0) { return cb(); }

	var parent = target.parent;
	async.whilst(
		function() {
			return loopFlg;
		},
		function(done) {
			//if(target.type == 0) { loopFlg = false; return done(); }
			var query = { _id: parent };
			Target.findOneAndUpdate(query, 
															{ 
																$inc: { "photo.bfr.total": 1, 
																				"photo.aft.total": 1
																			}
															}, 
															function(err, dbRes) {
				if (err) { done(err); }
				if (!dbRes) { loopFlg = false; }
				else {
					parent = dbRes.parent;
					console.log("parent : " + parent);
				}
				done();
			});
		}, function(err) {
				return cb(err);
		});
};



function createFamily(id, csv, cb) {
	var query = {};
	var treeCnt = 0;
	var tmpTreeCnt = 0;
	var parentTree = [];
	var type = 0;
	var list = [];

	var inputStream = fs.createReadStream(csv);
	var inputReadLine = rl.createInterface({'input': inputStream, 'output': {}});
	var tab = new RegExp("\\t", "g");
	var hyphen = new RegExp("\-", "g");
	var result = '';

	parentTree.push(id);

	inputReadLine
			.on('line', function(line){
				/* 文字コード変換 うまくいかない。。。
				result = jschardet.detect(line);
				var iconv = new Iconv(result.encoding, 'UTF-8//TRANSLIT//IGNORE');
				var convertedString = iconv.convert(line).toString();
				*/
				list.push(line.replace(tab, "-"));
			})
			.on('close', function() {
				//notUtf8String = jschardet.detect(line);
				//if(notUtf8String.encoding !== 'UTF-8') { return cb('Not UTF-8 Encording.'); }

				async.forEachSeries(list, function(item, done) {
					if(!item) { return done(); } //空行のときはそのまま次へ
					
					tmpTreeCnt = treeCnt;
					treeCnt = item.split("\-").length - 1;
					if(treeCnt > tmpTreeCnt + 1) { return done('Description Error'); } //階層が前の階層より2つ以上離れているとダメ
					item = item.replace(hyphen, "");
					console.log("tree cnt : " + treeCnt);
					type = item.slice(0, 1) !== "\*" ? 0 : 1;
					query = {
										pj_id: id,
										name: item.replace("\*", ""),
										parent: parentTree[treeCnt],
										type: type
									};
						
				  Target.create(query, function(err, target) {
						console.log('Create Target : '  + target.name);
						if(err) { return done(err); }
						
						updatePhotoTotalCnt(target, function(err) {
							if(parentTree.length > 1 && parentTree.length - 1 > treeCnt) { 
								parentTree.splice(treeCnt + 1, parentTree.length - 1);
								//console.log("after splice : " + parentTree);
							}
							parentTree.push(target._id);
							return done(err);
						});
					});
				}, function(err) {
					return cb(err);
				});
			});
};


function getAllAdoptPhotos(id, cb) {
	getChildren(id, function(err, array) {
		if(err) { return cb(err); }
		var ret = [];
		for(var i in array) {
			if(array[i].type == 0) { continue; }
			if(array[i].photo.bfr.shot) {
				ret.push({
									_id: array[i]._id,
									name: array[i].name,
									bfrAft: 0,
									src: array[i].photo.bfr.adopt
				});
			}
			if(array[i].photo.aft.shot) { 
				ret.push({
									_id: array[i]._id,
									name: array[i].name,
									bfrAft: 1,
									src: array[i].photo.aft.adopt
				});
			}
		}
		return cb(null, ret);
	});
};

exports.getChildren = getChildren;
exports.updatePhotoTotalCnt = updatePhotoTotalCnt;
exports.getAllAdoptPhotos = getAllAdoptPhotos;
exports.createFamily = createFamily;
