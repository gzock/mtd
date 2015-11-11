'use strict';

var _ = require('lodash');
var Generate = require('./generate.model');
var Project = require('../project/project.model');
var family = require('../target/family-seacher.js');
var gen = require('./generate.js');
var fs = require('fs');

// Get list of generates
exports.index = function(req, res) {
	/*
  Generate.find(function (err, generates) {
    if(err) { return handleError(res, err); }
    return res.json(200, generates);
  });
	*/
};

// Get a single generate
exports.show = function(req, res) {
	//var mongoose = require('mongoose');

	family.getAllAdoptPhotos(req.params.id, function(err, array) {
		if(err) { return handleError(res, err); }
		if(array.length == 0 || !array) { return handleError(res, 'Error : Return Array is empty.'); }
		console.log("ret : " + array);
		return res.json(array);
	});
	/*
  Generate.findById(req.params.id, function (err, generate) {
    if(err) { return handleError(res, err); }
    if(!generate) { return res.send(404); }
    return res.json(generate);
  });
	*/
};

// Creates a new generate in the DB.
exports.create = function(req, res) {
	Project.findById(req.params.id, function(err, pj) {
   	if(err) { return handleError(res, err); }

		gen.generate(pj, function(err, filePath) {
    	if(err) { console.log(err); return handleError(res, err); }
			fs.readFile(filePath, function(err, binary) {
    		if(err) { return handleError(res, err); }
				
				fs.unlink(filePath, function(err) {
    			if(err) { console.log(err); return handleError(res, err); }
					res.writeHead(200, {'Content-Type': 'application/zip' });
					res.end(binary, 'binary');
				});
			});
		});
	});
		/*
  Generate.create(req.body, function(err, generate) {
    if(err) { return handleError(res, err); }
    return res.json(201, generate);
  });
	*/
};

// Updates an existing generate in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Generate.findById(req.params.id, function (err, generate) {
    if (err) { return handleError(res, err); }
    if(!generate) { return res.send(404); }
    var updated = _.merge(generate, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, generate);
    });
  });
};

// Deletes a generate from the DB.
exports.destroy = function(req, res) {
  Generate.findById(req.params.id, function (err, generate) {
    if(err) { return handleError(res, err); }
    if(!generate) { return res.send(404); }
    generate.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
