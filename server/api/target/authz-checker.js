var Target = require('./target.model.js');
var Project = require('./../project/project.model.js');
var Target = require('./../target/target.model.js');

function hasProject(token_id, p_id, cb) {
	Project.findById(p_id, function(err, project) {
		if(err) { return cb(err); }
		if(!project) { return cb(err); }
		for(var i = 0; i < project.users.length; i++) {
			if(token_id == String(project.users[i])) { 
				console.log("hogehoge");
				return cb(null, true);
			}
		}
		return cb(null, false);
	});
};

function hasTarget(token_id, t_id, cb) {
	Target.findById(t_id, function(err, target) {
		if(err) { return cb(err); }
		if(!target) { return cb(err); }
		
		hasProject(token_id, target.pj_id, function(err, result) {
			return cb(err, result);
		});
	});
};


function hasPhoto(token_id, filename, cb) {
	var array = filename.split("_");
	var t_id = array[1].replace("\.jpg", "");

	hasTarget(token_id, t_id, function(err, result) {
		return cb(err, result);
	});
};

exports.hasProject = hasProject;
exports.hasTarget = hasTarget;
exports.hasPhoto = hasPhoto;
