'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Directive = undefined;

var _util = require('../util');

var _DirectiveDefinition = require('./DirectiveDefinition');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Directive = exports.Directive = function (_Appendable) {
  _inherits(Directive, _Appendable);

  function Directive(name) {
    var definitions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var directive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _util.none;
    var isSystem = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, Directive);

    var _this = _possibleConstructorReturn(this, (Directive.__proto__ || Object.getPrototypeOf(Directive)).call(this));

    _initialiseProps.call(_this);

    _this.name = name;
    _this.definitions = definitions;
    _this.directive = directive;
    _this.isSystem = isSystem;
    return _this;
  }

  return Directive;
}(_util.Appendable);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.append = function (other) {
    return new Directive(_this2.name, [].concat(_toConsumableArray(_this2.definitions), _toConsumableArray(other.definitions)), _this2.directive.or(other.directive), _this2.isSystem || other.isSystem);
  };

  this.setIsSystem = function (newIsSystem) {
    return new Directive(_this2.name, _this2.definitions, _this2.directive, newIsSystem === undefined || newIsSystem === null ? true : newIsSystem);
  };

  this.withDefinition = function (directive) {
    return new Directive(_this2.name, [].concat(_toConsumableArray(_this2.definitions), [directive]), _this2.directive, _this2.isSystem);
  };

  this.withDirective = function (directive) {
    return new Directive(_this2.name, _this2.definitions, (0, _util.some)(directive), _this2.isSystem);
  };
};