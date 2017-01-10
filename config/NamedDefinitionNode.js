'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NamedDefinitionNode = undefined;

var _util = require('../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NamedDefinitionNode = exports.NamedDefinitionNode = function NamedDefinitionNode(name, definition) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _util.none;

  _classCallCheck(this, NamedDefinitionNode);

  this.name = name;
  this.definition = definition;
  this.config = config;
};