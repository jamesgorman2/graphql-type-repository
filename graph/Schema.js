'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Schema = undefined;

var _config = require('../config');

var _util = require('../util');

var _SchemaDefinition = require('./SchemaDefinition');

var _Type = require('./Type');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function maybeAppendTypes(o1, o2) {
  return o1.flatMap(function (t1) {
    return o2.map(function (t2) {
      return t1.append(t2);
    }).orSome(t1);
  }).or(o2);
}

var Schema = exports.Schema = function (_Appendable) {
  _inherits(Schema, _Appendable);

  function Schema() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _util.none;
    var mutation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _util.none;
    var subscription = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _util.none;
    var directiveRefs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new _util.AppendableMap();
    var definitions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

    _classCallCheck(this, Schema);

    var _this = _possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).call(this));

    _initialiseProps.call(_this);

    _this.query = query;
    _this.mutation = mutation;
    _this.subscription = subscription;
    _this.directiveRefs = directiveRefs;
    _this.definitions = definitions;
    return _this;
  }

  return Schema;
}(_util.Appendable);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.withQuery = function (query) {
    return new Schema((0, _util.some)(query), _this2.mutation, _this2.subscription, _this2.directiveRefs, _this2.definitions);
  };

  this.withMutation = function (mutation) {
    return new Schema(_this2.query, (0, _util.some)(mutation), _this2.subscription, _this2.directiveRefs, _this2.definitions);
  };

  this.withSubscription = function (subscription) {
    return new Schema(_this2.query, _this2.mutation, (0, _util.some)(subscription), _this2.directiveRefs, _this2.definitions);
  };

  this.withDefinition = function (definition) {
    return new Schema(_this2.query, _this2.mutation, _this2.subscription, _this2.directiveRefs, [].concat(_toConsumableArray(_this2.definitions), [definition]));
  };

  this.withDirectiveRef = function (directive, module) {
    return new Schema(_this2.query, _this2.mutation, _this2.subscription, _this2.directiveRefs.put(directive, new _util.AppendableList([module])), _this2.definitions);
  };

  this.append = function (other) {
    return new Schema(maybeAppendTypes(_this2.query, other.query), maybeAppendTypes(_this2.mutation, other.mutation), maybeAppendTypes(_this2.subscription, other.subscription), _this2.directiveRefs.append(other.directiveRefs), [].concat(_toConsumableArray(_this2.definitions), _toConsumableArray(other.definitions)));
  };
};