'use strict';

var _ = require('lodash');
var Photo = require('./photo.model');
var flow = require('../../flow-node.js')('tmp');
var fs = require('fs');

// Get list of photos
exports.index = function(req, res) {
  Photo.find(function (err, photos) {
    if(err) { return handleError(res, err); }
    return res.json(200, photos);
  });
};

// Get a single photo
exports.show = function(req, res) {


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
};

// Creates a new photo in the DB.
exports.create = function(req, res) {
    flow.post(req, function(status, filename, original_filename, identifier) {
			console.log('status: '+ status, filename, original_filename, identifier);
      if(status==='done'){
        var s = fs.createWriteStream('./photos' + filename);
        s.on('finish', function() {
	        res.send(200, {
          });
/*
				  Photo.create(req.body, function(err, photo) {
				    if(err) { return handleError(res, err); }
				    return res.json(201, photo);
				  });
					*/
			  });
        flow.write(identifier, s, {end: true});
			}
    });
};

// Updates an existing photo in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Photo.findById(req.params.id, function (err, photo) {
    if (err) { return handleError(res, err); }
    if(!photo) { return res.send(404); }
    var updated = _.merge(photo, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, photo);
    });
  });
};

// Deletes a photo from the DB.
exports.destroy = function(req, res) {
  Photo.findById(req.params.id, function (err, photo) {
    if(err) { return handleError(res, err); }
    if(!photo) { return res.send(404); }
    photo.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
