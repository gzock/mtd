'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

		//mongoose.connect('mongodb://localhost/mtd-dev');

var ProjectSchema = new Schema({
	owner: {type: Schema.Types.ObjectId},
	users: [{type: Schema.Types.ObjectId}],
	name: String,
	date: [
					{start: {type: Date, default: Date.now}},
					{end: Date}
				],
	progress: {type: Number, default: 0},
	complete: {type: Boolean, default: false},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Project', ProjectSchema);
