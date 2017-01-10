'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DirectiveDefinition = undefined;

var _config = require('../config');

var _util = require('../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DirectiveDefinition = exports.DirectiveDefinition = function DirectiveDefinition(module) {
  var definition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _util.none;
  var directive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _util.none;

  _classCallCheck(this, DirectiveDefinition);

  _initialiseProps.call(this);

  this.module = module;
  this.definition = definition;
  this.directive = directive;
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.withDirective = function (directive) {
    return new DirectiveDefinition(_this.module, _this.definition, (0, _util.some)(directive));
  };

  this.withDefinition = function (definition) {
    return new DirectiveDefinition(_this.module, (0, _util.some)(definition), _this.directive);
  };
};