'use strict';

var express = require('express');
var controller = require('./target.controller');

var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var multer = require('multer');
var storage = multer.diskStorage({
	destination :function(req, file, cb) {
		cb(null, 'photos/');
	},
	filename: function(req, file, cb) {
		var fileName = req.body.fileName;
		var random = Math.floor(Math.random() * 100000000);
		cb(null,random + "_" + req.params.id + ".jpg");
		//cb(null, fileName + ".jpg");
	}
});
//var upload = multer({ dest: 'photos/' })
var upload = multer({ storage: storage });

var auth = require('../../auth/auth.service');

router.get('/', controller.index);
router.get('/:id', controller.allShow);
router.get('/:p_id/:t_id', auth.isAuthenticated(),  controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:p_id/:t_id', auth.isAuthenticated(), controller.update);
router.patch('/:p_id/:t_id', auth.isAuthenticated(), controller.update);
router.delete('/:p_id/:t_id', auth.isAuthenticated(), controller.destroy);

router.get('/:id/photos/:filename', auth.isAuthenticated(), controller.showPhoto);
//router.post('/:id/photos/:photoType', auth.isAuthenticated(), multipartMiddleware, controller.createPhoto);
router.post('/:id/photos/:photoType', auth.isAuthenticated(), upload.single('file'),  controller.createPhoto);
router.put('/:p_id/:t_id/photos/adopt',  auth.isAuthenticated(), controller.update);
router.put('/:id/photos', auth.isAuthenticated(), controller.updatePhoto);
router.patch('/:id/photos', auth.isAuthenticated(), controller.updatePhoto);
router.delete('/:id/photos', auth.isAuthenticated(), controller.destroyPhoto);

module.exports = router;
