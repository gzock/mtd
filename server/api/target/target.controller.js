'use strict';

var _ = require('lodash');
var Target = require('./target.model');
var flow = require('../../flow-node.js')('tmp');
var fs = require('fs');
var async = require('async');

var family = require('./family-seacher.js');
var authz = require('./authz-checker.js');

// Get list of targets
exports.index = function(req, res) {
	
  Target.find(function (err, targets) {
    if(err) { return handleError(res, err); }
    return res.json(200, targets);
  });
};

// プロジェクト配下の全ての対象項目を表示
// ここの名前は変更したい・・・良いのが思いつかない
exports.allShow = function(req, res) {
  //Target.findById(req.params.id, function (err, target) {
  Target.find({pj_id: req.params.id}, function (err, target) {
    if(err) { return handleError(res, err); }
    if(!target) { return res.send(404); }
		console.log(JSON.stringify(target[0]));
    return res.json(target);
  });
};


// Get a single target
exports.show = function(req, res) {
	
	authz.hasProject(req.user._id, req.params.p_id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }

	  Target.find({pj_id: req.params.p_id, parent: req.params.t_id}, function (err, target) {
	    if(err) { return handleError(res, err); }
	    if(!target) { return res.send(404); }
	    return res.json(target);
	  });
	});
};

// Creates a new target in the DB.
exports.create = function(req, res) {
	var loopFlg = true;

	authz.hasProject(req.user._id, req.body.pj_id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }

	  Target.create(req.body, function(err, target) {
	    if(err) { return handleError(res, err); }
	
				var parent = target.parent;
				async.whilst(
					function() {
						return loopFlg;
					},
					function(done) {
						if(target.type == 0) { loopFlg = false; return done(); }
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
							if (err) { return handleError(res, err); }
	    				return res.json(201, target);
					});
			});
	});

};

// Updates an existing target in the DB.
exports.update = function(req, res) {
	authz.hasProject(req.user._id, req.params.p_id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }

	  if(req.body._id) { delete req.body._id; }
	  Target.findOne({pj_id: req.params.p_id, _id: req.params.t_id}, function (err, target) {
	    if (err) { return handleError(res, err); }
	    if(!target) { return res.send(404); }
	    var updated = _.merge(target, req.body);
	    updated.save(function (err) {
	      if (err) { return handleError(res, err); }
	      return res.json(200, target);
	    });
	  });
	});
};

// Deletes a target from the DB.
exports.destroy = function(req, res) {
	var loopFlg = true;
	var loopFlg2 = true;
	var bfrTotalCnt = -1;
	var aftTotalCnt = -1;
	var bfrShotCnt = 0;
	var aftShotCnt = 0;
	var parent = '';
	
	authz.hasProject(req.user._id, req.params.p_id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }

	  Target.findOne({pj_id: req.params.p_id, _id: req.params.t_id}, function (err, target) {
	    if(err) { return handleError(res, err); }
	    if(!target) { return res.send(404); }
	
			if(target.type == 0) {
				bfrTotalCnt = -target.photo.bfr.total;
				aftTotalCnt = -target.photo.aft.total;
			}
			bfrShotCnt = -target.photo.bfr.shot;
			aftShotCnt = -target.photo.aft.shot;
	
			console.log("bfrTotalCnt : " + bfrTotalCnt);
			console.log("aftTotalCnt : " + aftTotalCnt);
			console.log("bfrShotCnt : " + bfrShotCnt);
			console.log("aftShotCnt : " + aftShotCnt);
	    
			target.remove(function(err) {
	      if(err) { return handleError(res, err); }
	
				async.series([
					function(done) {
						parent = target.parent;
	
						async.whilst(
							function() {
								return loopFlg;
							},
							function(whileDone) {
								var query = { _id: parent };
								Target.findOneAndUpdate(query, 
										{ 
											$inc: { 
															"photo.bfr.total": bfrTotalCnt, 
															"photo.aft.total": aftTotalCnt,
															"photo.bfr.shot": bfrShotCnt, 
															"photo.aft.shot": aftShotCnt
														}
										}, 
										function(err, dbRes) {
											if (err) { return whileDone(err); }
											if (!dbRes) { loopFlg = false; }
											else {
												parent = dbRes.parent;
												console.log("parent : " + parent);
											}
											return whileDone();
										});
							}, function(err) {
			      			done(err);
							});
					},
					function(done) {
						if(!target.type && target.photo.bfr.total && target.photo.aft.total) {
							family.getChildren(target._id, function(datas){
								console.log("*** Finish ***");
	
								if(datas) {
									async.forEach(datas, function(data, forDone) {
										console.log("Delete is " + data._id);
										data.remove(function(err) {
											return forDone(err);
										});
									}, function(err) {
										return done(err);
									});
								} else {
									done("Children's Not Found.");
								};
							});
						} else {
							done();
						}
								
					}], function(err) {
			      if(err) { return handleError(res, err); }
						return res.send(204);
					});
	
	    });
	  });
	});
};


/*
 * 撮影画像用API
 */
exports.showPhoto = function(req, res) {
	authz.hasPhoto(req.user._id, req.params.filename, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }
		fs.readFile('photos/' + req.params.filename, function(err, data) {
			res.writeHead(200, {'Content-Type': 'image/gif' });
			res.end(data, 'binary');
		});
	});
	
	/*
	flow.get(req, function(status, filename, original_filename, identifier) {
		console.log('GET', status);

    if (status == 'found') {
      status = 200;
    } else {
      status = 204;
    }

    res.status(status).send();
  });

  Photo.findById(req.params.id, function (err, photo) {
    if(err) { return handleError(res, err); }
    if(!photo) { return res.send(404); }
    return res.json(photo);
  });
	*/
};

exports.createPhoto = function(req, res) {
	var loopFlg = true;
	var shotType = '';
	var shotName = '';

	authz.hasTarget(req.user._id, req.params.id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }

    if(req.file) {
			
			console.log("params : " + req.params.photoType);
			console.log("params new: " + req.body.newFlg);
			
			// 単にreq.params.photoTypeだけだと、
			// photoTypeがあるかどうか？で判断されて、全部trueになっちゃうっぽい
			if(req.params.photoType == 0) {
				shotType = { "photo.bfr.shot": 1};
				shotName = { "photo.bfr.names": req.file.filename};

			} else if(req.params.photoType == 1){
				shotType = { "photo.aft.shot": 1};
				shotName = { "photo.aft.names": req.file.filename};
			} else {
				return handleError(res, err);
			}


			console.log("shotType : " + JSON.stringify(shotType));
			console.log("shotName : " + JSON.stringify(shotName));

			var query = {_id: req.params.id};
			Target.findOneAndUpdate(query, 
															{ 
																$inc: shotType,
																$push: shotName
															}, 
															function(err, dbRes) {
				if (err) { return handleError(res, err); }
				var parent = dbRes.parent;

				
				// 書き直そう
				var newFlg = false;
				if(req.params.photoType == 0) {
					if(dbRes.photo.bfr.shot == 1) {
						newFlg = true;
					}
				} else if(req.params.photoType == 1) {
					if(dbRes.photo.aft.shot == 1) {
						newFlg = true;
					}
				}

				if(newFlg) {
					async.whilst(
						function() {
							return loopFlg;
						},
						function(done) {
							var query = { _id: parent };
							Target.findOneAndUpdate(query, 
									{ 
										$inc: shotType
									}, 
									function(err, dbRes) {
										if (err) { done(err); }
										if (!dbRes) { loopFlg = false; }
										else {
											parent = dbRes.parent;
											console.log("parent : " + parent);
										}
										done();
									}
							);
						}, function(err) {
								if (err) { return handleError(res, err); }
        				res.send(200, {
        				});
						});
				} else {
      		res.send(200, {});
				}
			});
    }
	});
};

exports.updatePhoto = function(req, res) {
};

exports.destroyPhoto = function(req, res) {
};


exports.adoptPhoto = function(req, res) {
};



function handleError(res, err) {
  return res.send(500, err);
}
