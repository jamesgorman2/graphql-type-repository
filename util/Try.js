'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Failure = exports.Success = exports.Try = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CompositeError = require('./CompositeError');

var _either = require('./either');

var _resolveThunk = require('./resolveThunk');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function maybeCompositeError(errors) {
  if (errors.length === 0) {
    throw new Error();
  }
  if (errors.length === 1) {
    throw errors[0];
  }
  throw new _CompositeError.CompositeError(errors);
}

var Try = exports.Try = function () {
  function Try() {
    _classCallCheck(this, Try);
  }

  _createClass(Try, null, [{
    key: 'of',
    value: function of(r) {
      try {
        return Try.success((0, _resolveThunk.resolveThunk)(r));
      } catch (e) {
        return Try.failure(e);
      }
    }
  }, {
    key: 'success',
    value: function success(r) {
      return new Success(r);
    }
  }, {
    key: 'failure',
    value: function failure(error) {
      return new Failure([error]);
    } // eslint-disable-line no-undef
    // eslint-disable-line no-undef
    // eslint-disable-next-line no-undef

  }]);

  return Try;
}();

var Success = exports.Success = function (_Try) {
  _inherits(Success, _Try);

  function Success(t) {
    _classCallCheck(this, Success);

    var _this = _possibleConstructorReturn(this, (Success.__proto__ || Object.getPrototypeOf(Success)).call(this));

    _this.isSuccess = function () {
      return true;
    };

    _this.map = // eslint-disable-line no-undef
    // flow-disable-next-line
    function (f) {
      return Try.of(function () {
        return f(_this.t);
      });
    };

    _this.flatMap = // eslint-disable-line no-undef
    // flow-disable-next-line
    function (f) {
      return f(_this.t);
    };

    _this.mergeWith =
    // flow-disable-next-line
    function (other, f) {
      return other.isSuccess() ? Try.of(function () {
        return f(_this.t, other.t);
      }) : other;
    };

    _this.toEither = function () {
      return (0, _either.left)(_this.t);
    };

    _this.throw = function () {};

    _this.t = t;
    return _this;
  }

  // eslint-disable-next-line no-undef


  return Success;
}(Try);

var Failure = exports.Failure = function (_Try2) {
  _inherits(Failure, _Try2);

  function Failure(errors) {
    _classCallCheck(this, Failure);

    var _this2 = _possibleConstructorReturn(this, (Failure.__proto__ || Object.getPrototypeOf(Failure)).call(this));

    _this2.isSuccess = function () {
      return false;
    };

    _this2.map = // eslint-disable-line no-undef
    function (_) {
      return _this2;
    };

    _this2.flatMap = // eslint-disable-line no-undef
    function (_) {
      return _this2;
    };

    _this2.mergeWith =
    // flow-disable-next-line
    function (other, _) {
      return other.isSuccess() ? _this2 : // eslint-disable-line no-undef
      new Failure([].concat(_toConsumableArray(_this2.errors), _toConsumableArray(other.errors)));
    };

    _this2.toEither = function () {
      return (0, _either.right)(_this2.errors);
    };

    _this2.throw = function () {
      throw maybeCompositeError(_this2.errors);
    };

    _this2.errors = errors;
    return _this2;
  }

  // eslint-disable-next-line no-undef


  return Failure;
}(Try);