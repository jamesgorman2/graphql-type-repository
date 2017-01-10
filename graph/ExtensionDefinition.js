'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExtensionDefinition = undefined;

var _config = require('../config');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExtensionDefinition = exports.ExtensionDefinition = function ExtensionDefinition(module, definition) {
  _classCallCheck(this, ExtensionDefinition);

  this.module = module;
  this.definition = definition;
};