/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Generate = require('./generate.model');

exports.register = function(socket) {
  Generate.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Generate.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('generate:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('generate:remove', doc);
}