'use strict';

var express = require('express');
var controller = require('./generate.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');

//router.get('/', controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/:id', controller.create);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
//router.delete('/:id', controller.destroy);

module.exports = router;
