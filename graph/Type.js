'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Type = undefined;

var _config = require('../config');

var _util = require('../util');

var _ExtensionDefinition = require('./ExtensionDefinition');

var _TypeDefinition = require('./TypeDefinition');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Type = exports.Type = function (_Appendable) {
  _inherits(Type, _Appendable);

  function Type(name) {
    var typeRefs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new _util.AppendableMap();
    var directiveRefs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new _util.AppendableMap();
    var definitions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var extensions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
    var type = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : _util.none;
    var isSystem = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

    _classCallCheck(this, Type);

    var _this = _possibleConstructorReturn(this, (Type.__proto__ || Object.getPrototypeOf(Type)).call(this));

    _initialiseProps.call(_this);

    _this.name = name;
    _this.typeRefs = typeRefs;
    _this.directiveRefs = directiveRefs;
    _this.definitions = definitions;
    _this.extensions = extensions;
    _this.type = type;
    _this.isSystem = isSystem;
    return _this;
  }

  return Type;
}(_util.Appendable);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.append = function (other) {
    return new Type(_this2.name, _this2.typeRefs.append(other.typeRefs), _this2.directiveRefs.append(other.directiveRefs), [].concat(_toConsumableArray(_this2.definitions), _toConsumableArray(other.definitions)), [].concat(_toConsumableArray(_this2.extensions), _toConsumableArray(other.extensions)), _this2.type.or(other.type), _this2.isSystem || other.isSystem);
  };

  this.setIsSystem = function (newIsSystem) {
    return new Type(_this2.name, _this2.typeRefs, _this2.directiveRefs, _this2.definitions, _this2.extensions, _this2.type, newIsSystem === undefined || newIsSystem === null ? true : newIsSystem);
  };

  this.withDefinition = function (definition) {
    return new Type(_this2.name, _this2.typeRefs, _this2.directiveRefs, [].concat(_toConsumableArray(_this2.definitions), [definition]), _this2.extensions, _this2.type, _this2.isSystem);
  };

  this.withDirectiveRef = function (directiveRef, module) {
    return new Type(_this2.name, _this2.typeRefs, _this2.directiveRefs.put(directiveRef, new _util.AppendableList([module])), _this2.definitions, _this2.extensions, _this2.type, _this2.isSystem);
  };

  this.withExtension = function (extension) {
    return new Type(_this2.name, _this2.typeRefs, _this2.directiveRefs, _this2.definitions, [].concat(_toConsumableArray(_this2.extensions), [extension]), _this2.type, _this2.isSystem);
  };

  this.withType = function (type) {
    return new Type(_this2.name, _this2.typeRefs, _this2.directiveRefs, _this2.definitions, _this2.extensions, (0, _util.some)(type), _this2.isSystem);
  };

  this.withTypeRef = function (typeRef, module) {
    return new Type(_this2.name, _this2.typeRefs.put(typeRef, new _util.AppendableList([module])), _this2.directiveRefs, _this2.definitions, _this2.extensions, _this2.type, _this2.isSystem);
  };
};