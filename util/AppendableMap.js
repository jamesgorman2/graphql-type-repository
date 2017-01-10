'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppendableMap = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _hasOwnProperty = require('./hasOwnProperty');

var _option = require('./option');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// eslint-disable-next-line no-unused-vars


var AppendableMap = exports.AppendableMap = function AppendableMap() {
  var _this = this;

  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, AppendableMap);

  this.append = function (other) {
    if (_this === other) {
      return _this;
    }
    if (_this.isEmpty()) {
      return other;
    }
    return Object.keys(other.data).reduce(function (map, key) {
      return map.put(key, other.data[key]);
    }, _this);
  };

  this.contains = function (key) {
    return (0, _hasOwnProperty.hasOwnProperty)(_this.data, key);
  };

  this.get = function (key) {
    return (0, _option.someOrNone)(_this.data[key]);
  };

  this.isEmpty = function () {
    return Object.keys(_this.data).length === 0;
  };

  this.keys = function () {
    return Object.keys(_this.data);
  };

  this.put = function (key, value) {
    var newData = _extends({}, _this.data);
    newData[key] = (0, _hasOwnProperty.hasOwnProperty)(newData, key) ? newData[key].append(value) : value;
    return new AppendableMap(newData);
  };

  this.remove = function (key) {
    if ((0, _hasOwnProperty.hasOwnProperty)(_this.data, key)) {
      var newData = _extends({}, _this.data);
      delete newData[key];
      return new AppendableMap(newData);
    }
    return _this;
  };

  this.replace = function (key, value) {
    return _this.get(key).filter(function (v) {
      return v === value;
    }).map(function (_) {
      return _this;
    }).getOrElse(function () {
      return new AppendableMap(_extends({}, _this.data, _defineProperty({}, key, value)));
    });
  };

  this.values = function () {
    return _this.keys().map(function (key) {
      return _this.data[key];
    });
  };

  this.data = data;
};