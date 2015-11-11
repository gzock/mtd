var mongoose = require('mongoose');
var tree		 = require('mongoose-path-tree');
var url = 'mongodb://localhost/user';
var db  = mongoose.createConnection(url, function(err, res){
    if(err){
        console.log('Error connected: ' + url + ' - ' + err);
    }else{
        console.log('Success connected: ' + url);
    }
});

// Modelの定義

// アカウント一覧
var UserSchema = new mongoose.Schema({
    username    : { type: String, required: true },
    password    : { type: String, required: true },
    auth_id     : { type: String, required: true }
},{collection: 'account'});

// プロジェクト一覧
var ProjectSchema = new mongoose.Schema({
    constructLeader : String,
    projectName     : String,
    root_target     : { type: mongoose.Schema.Types.ObjectId, required: true }
},{collection: 'project'});

// ターゲット一覧
var TargetSchema = new mongoose.Schema({
    target_name         : { type: String,   required: true                             },
    photo_before_after  : { type: Number,   required: true, default: 0, min: 0, max: 2 },
    photo_check         : { 
				photo_count : { type: Number, required: true, default: 0, min: 0, max: 6 },
				adoption	  : { type: Number, required: false, default: 0, min: 0, max: 5 }
		},
    bfr_photo_shot_cnt  : { type: Number,   required: true, default: 0, min: 0         },
    bfr_photo_total_cnt : { type: Number,   required: true, default: 0, min: 0         },
    aft_photo_shot_cnt  : { type: Number,   required: true, default: 0, min: 0         },
    aft_photo_total_cnt : { type: Number,   required: true, default: 0, min: 0         },
    type	              : { type: Number,   required: true, default: 0, min: 0, max: 2 },
    lock	              : { type: Number,   required: true, default: 0, min: 0, max: 1 },
		updated			        : { type: Date,     required: true, default: Date.now          }
},{collection: 'target'});
TargetSchema.plugin(tree);

// 画像一覧
var PictureSchema = new mongoose.Schema({
    targetId 		 : String,
    pictureData  : Buffer
},{collection: 'picture'});

// test
var TestSchema = new mongoose.Schema({
    targetId 		 : { type : String, index : { unique:true } },
    ancestors		 : [ { type: mongoose.Schema.Types.ObjectId, index : { unique:true } } ]
},{collection: 'test'});
TestSchema.plugin(tree);

exports.User    = db.model( 'User', UserSchema);
exports.Project = db.model( 'Project', ProjectSchema);
exports.Target  = db.model( 'Target', TargetSchema);
exports.Picture = db.model( 'Picture', PictureSchema);
exports.Test	  = db.model( 'Test', TestSchema);
