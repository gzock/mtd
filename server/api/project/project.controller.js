'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var Target = require('../target/target.model');
var authz = require('../target/authz-checker.js');

var async = require('async');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment');
var validateJwt = expressJwt({ secret: config.secrets.session });
var family = require('../target/family-seacher.js');
var CSV_PATH = '/home/gzock/workspace/mtd/csv/';

// Get list of projects
exports.index = function(req, res) {

	////Project.find({}).remove(function() {});
  //Project.find(function (err, projects) {
  //  if(err) { return handleError(res, err); }
  //  return res.json(200, projects);
  //  //return res.json(200, [{"name":"d"}, {"name":"e"}]);
  //});

  Project.find(function (err, projects) {
    if(err) { return handleError(res, err); }

		for(var i = 0; i < projects.length; i++) {
	  	Target.find({pj_id: projects[i]._id, parent: projects[i].p_id}, function (err, target) {
	  	  if(err) { return handleError(res, err); }
	  	  if(!target) { return res.send(404); }
	  	  
				for (var j = 0; j < target.length; j++) {
					bfr = (target[j].photo.bfr.shot / target[j].photo.bfr.total) * 100;
					aft = (target[j].photo.aft.shot / target[j].photo.aft.total) * 100;
					projects[i].progress = (bfr + aft) / 2;
				}
    		return res.json(200, projects);
	  	});
		}
    //return res.json(200, [{"name":"d"}, {"name":"e"}]);
  });
};

// Get a single project
exports.show = function(req, res) {

	if(req.user._id != req.params.id) { return res.send(204); }

  Project.find({'users': {$in: [req.params.id]}}, function (err, projects) {
    if(err) { return handleError(res, err); }
    if(!projects) { return res.send(404); }
		async.forEach(projects, function(pj, forDone) {
	  	Target.find({pj_id: pj._id, parent: pj._id}, function (err, target) {
	  	  if(err) { return forDone(err); }
	  	  if(!target) { return forDone("not found"); }
					var bfrShot = 0;
					var aftShot = 0;
					var bfrTotal = 0;
					var aftTotal = 0;
	  	  
				for (var j = 0; j < target.length; j++) {
					if(target[j].type) {
						bfrTotal++;
						aftTotal++;
						if(target[j].photo.bfr.shot > 0) { bfrShot += target[j].photo.bfr.shot; }
						if(target[j].photo.aft.shot > 0) { aftShot += target[j].photo.aft.shot; }

					} else {
						bfrShot += target[j].photo.bfr.shot;
						aftShot += target[j].photo.aft.shot;
						bfrTotal += target[j].photo.bfr.total;
						aftTotal += target[j].photo.aft.total;
					}
				}
				var bfr = (bfrShot / bfrTotal) * 100;
				var aft = (aftShot / aftTotal) * 100;
				pj.progress = Math.round((bfr + aft) / 2);
				return forDone(err);
	  	});

		}, function(err) {
			if(err) { return handleError(res, err); }
			return res.json(200, projects);
		});
  });

};

// Creates a new project in the DB.
exports.create = function(req, res) {
  Project.create(req.body, function(err, project) {
    if(err) { return handleError(res, err); }
    return res.json(201, project);
  });
};

// Updates an existing project in the DB.
exports.update = function(req, res) {
	authz.isOwner(req.user._id,  req.params.id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }

  	if(req.body._id) { delete req.body._id; }
  	Project.findOne( {'users': {$in: [req.user._id]}, _id: req.params.id}, function (err, project) {
  	  if (err) { return handleError(res, err); }
  	  if(!project) { return res.send(404); }
  	  var updated = _.merge(project, req.body);
  	  updated.save(function (err) {
  	    if (err) { return handleError(res, err); }
  	    return res.json(200, project);
  	  });
  	});
  });
};

// Deletes a project from the DB.
exports.destroy = function(req, res) {

	authz.isOwner(req.user._id,  req.params.id, function(err, flag) {
	  if(err || !flag) { return handleError(res, err); }
		Project.findById(req.params.id, function (err, project) {
  	  if(err) { return handleError(res, err); }
  	 	if(!project) { return res.send(404); }

		 	// target -> projectで同期的にいくようにしたほうが良い
		 	family.getChildren(project._id, function(err, datas) {
  	  		if(err) { return handleError(res, err); }
		 		datas.forEach(function(data) {
		 			data.remove(function(err) {
		 				if(err) { return handleError(res, err); }
		 			});
		 		});
		 	});

  		project.remove(function(err) {
  	 		if(err) { return handleError(res, err); }
  	  	return res.send(200, {});
  		});
  	});
	});
};

exports.batchCreate = function(req, res) {
	family.createFamily(req.params.id, CSV_PATH + req.file.filename, function(err) {
		if(err) { return handleError(res, err); }
		return res.send(200, {});
	});
};

function handleError(res, err) {
  return res.send(500, err);
}
