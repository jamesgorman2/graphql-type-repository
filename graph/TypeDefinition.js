'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeDefinition = undefined;

var _config = require('../config');

var _util = require('../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypeDefinition = exports.TypeDefinition = function TypeDefinition(module) {
  var definition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _util.none;
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _util.none;

  _classCallCheck(this, TypeDefinition);

  _initialiseProps.call(this);

  this.module = module;
  this.definition = definition;
  this.type = type;
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.withType = function (type) {
    return new TypeDefinition(_this.module, _this.definition, (0, _util.some)(type));
  };

  this.withDefinition = function (definition) {
    return new TypeDefinition(_this.module, (0, _util.some)(definition), _this.type);
  };
};