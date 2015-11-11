'use strict';

var _ = require('lodash');
var Project = require('./project.model');

var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment');
var validateJwt = expressJwt({ secret: config.secrets.session });
var family = require('../target/family-seacher.js');
var CSV_PATH = '/home/gzock/workspace/mtd/csv/';

// Get list of projects
exports.index = function(req, res) {

	//Project.find({}).remove(function() {});
  Project.find(function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.json(200, projects);
    //return res.json(200, [{"name":"d"}, {"name":"e"}]);
  });
};

// Get a single project
exports.show = function(req, res) {

	if(req.user._id != req.params.id) { return res.send(204); }

  Project.find({'users': {$in: [req.params.id]}}, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    return res.json(project);
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
  if(req.body._id) { delete req.body._id; }
  Project.findById(req.params.id, function (err, project) {
    if (err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    var updated = _.merge(project, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, project);
    });
  });
};

// Deletes a project from the DB.
exports.destroy = function(req, res) {

	Project.findById(req.params.id, function (err, project) {
		var ownerFlag = false;
		for(var i in project.users) {
			if(req.user._id == project.users[i]) { ownerFlag = true; break; }
		}

    if(err) { return handleError(res, err); }

		if(ownerFlag) {
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
		} else {
			return res.send(204);
		}
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
