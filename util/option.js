'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.none = exports.Some = exports.None = exports.Option = undefined;
exports.some = some;
exports.someOrNone = someOrNone;

var _resolveThunk = require('./resolveThunk');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Option = exports.Option = function Option() {
  _classCallCheck(this, Option);
};

var None = exports.None = function (_Option) {
  _inherits(None, _Option);

  function None() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, None);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = None.__proto__ || Object.getPrototypeOf(None)).call.apply(_ref, [this].concat(args))), _this), _this.isNone = function () {
      return true;
    }, _this.isSome = function () {
      return false;
    }, _this.map = // eslint-disable-line no-undef
    function (_) {
      return none;
    }, _this.mapOrNone = // eslint-disable-line no-undef
    function (_) {
      return none;
    }, _this.flatMap = // eslint-disable-line no-undef
    function (_) {
      return none;
    }, _this.toArray = function () {
      return [];
    }, _this.filter = function (_) {
      return none;
    }, _this.forEach = function () {}, _this.get = function () {
      throw new Error('Cannot get from None');
    }, _this.getOrElse = function (_default) {
      return (0, _resolveThunk.resolveThunk)(_default);
    }, _this.or = function (other) {
      return (0, _resolveThunk.resolveThunk)(other);
    }, _this.orSome = function (other) {
      return some((0, _resolveThunk.resolveThunk)(other));
    }, _this.xor = function (other, _) {
      return (0, _resolveThunk.resolveThunk)(other);
    }, _this.ifNone = function (f) {
      return f();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  } // eslint-disable-line no-use-before-define

  // eslint-disable-line no-use-before-define

  // eslint-disable-line no-use-before-define

  // eslint-disable-line no-use-before-define

  return None;
}(Option);

var Some = exports.Some = function (_Option2) {
  _inherits(Some, _Option2);

  function Some(t) {
    _classCallCheck(this, Some);

    var _this2 = _possibleConstructorReturn(this, (Some.__proto__ || Object.getPrototypeOf(Some)).call(this));

    _initialiseProps.call(_this2);

    _this2.t = t;
    return _this2;
  } // eslint-disable-line no-use-before-define

  return Some;
}(Option);

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.isNone = function () {
    return false;
  };

  this.isSome = function () {
    return true;
  };

  this.map = // eslint-disable-line no-undef
  // flow-disable-next-line
  function (f) {
    return some(f(_this3.t));
  };

  this.mapOrNone = // eslint-disable-line no-undef
  // flow-disable-next-line
  function (f) {
    return _this3.flatMap(function (t) {
      return someOrNone(f(t));
    });
  };

  this.flatMap = // eslint-disable-line no-undef
  // flow-disable-next-line
  function (f) {
    return f(_this3.t);
  };

  this.toArray = function () {
    return [_this3.t];
  };

  this.filter = function (f) {
    return f(_this3.t) ? _this3 : none;
  };

  this.forEach = function (f) {
    return f(_this3.t);
  };

  this.get = function () {
    return _this3.t;
  };

  this.getOrElse = function (_) {
    return _this3.t;
  };

  this.or = function (_) {
    return _this3;
  };

  this.orSome = function (_) {
    return _this3;
  };

  this.xor = function (other, error) {
    var o = (0, _resolveThunk.resolveThunk)(other);
    if (o.isSome()) {
      if (error) {
        throw error();
      }
      return none; // eslint-disable-line no-use-before-define
    }
    return _this3;
  };

  this.ifNone = function (_) {};
};

var none = exports.none = new None(); // eslint-disable-line no-use-before-define
function some(t) {
  return new Some(t);
}
function someOrNone(t) {
  return t ? some(t) : none;
}