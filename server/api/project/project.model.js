'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

		//mongoose.connect('mongodb://localhost/mtd-dev');

var ProjectSchema = new Schema({
//  name: String,
	users: [{type:String}],
	name: String,
	date: [
					{start: {type: Date, default: Date.now}},
					{end: Date}
				],
	complete: Boolean,
  active: Boolean
});

module.exports = mongoose.model('Project', ProjectSchema);
