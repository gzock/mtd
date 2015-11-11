'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var multer = require('multer');
var storage = multer.diskStorage({
	destination :function(req, file, cb) {
		cb(null, 'csv/');
	},
	filename: function(req, file, cb) {
		var fileName = req.body.fileName;
		var random = Math.floor(Math.random() * 100000000);
		cb(null,random + "_" + req.params.id + "csv");
	}
});
var upload = multer({ storage: storage });

router.get('/', auth.hasRole('admin'), controller.index);
//router.get('/', controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/batch', auth.isAuthenticated(), upload.single('file'),controller.batchCreate);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
