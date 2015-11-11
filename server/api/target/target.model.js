'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TargetSchema = new Schema({
  name: String,
  pj_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId },
  active: { type: Boolean, default: true },
  type: { type: Number, default: 0 },
	photo: { 
			bfr: {
					shot: { type: Number, default: 0 },
					total: { type: Number, default: 0 },
					names: [{ type: String }],
					adopt: { type: String }

			},
			aft: {
					shot: { type: Number, default: 0 },
					total: { type: Number, default: 0 },
					names: [{ type: String }],
					adopt: { type: String }
			}
	},
	updated: { type: Date, default: Date.now }
						
});

module.exports = mongoose.model('Target', TargetSchema);
