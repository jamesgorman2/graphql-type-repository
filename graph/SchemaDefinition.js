'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchemaDefinition = undefined;

var _config = require('../config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SchemaDefinition = exports.SchemaDefinition = function SchemaDefinition(module, definition) {
  _classCallCheck(this, SchemaDefinition);

  this.module = module;
  this.definition = definition;
};