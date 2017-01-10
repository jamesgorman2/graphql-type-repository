'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RightProjection = exports.LeftProjection = exports.Right = exports.Left = exports.Either = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.left = left;
exports.right = right;

var _option = require('./option');

var _resolveThunk = require('./resolveThunk');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Either = exports.Either = function () {
  function Either() {
    var _this = this;

    _classCallCheck(this, Either);

    this.left = function () {
      return new LeftProjection(_this);
    };

    this.right = function () {
      return new RightProjection(_this);
    };

    this.bimap = // eslint-disable-line no-undef
    function (fl, fr) {
      return (// eslint-disable-line no-undef
        _this.either(function (l) {
          return left(fl(l));
        }, function (r) {
          return right(fr(r));
        })
      );
    };

    this.mapReduce = // eslint-disable-line no-undef
    function (fl, fr) {
      return Either.reduce(_this.bimap(fl, fr));
    };

    this.swap = function () {
      return _this.either(function (l) {
        return right(l);
      }, function (r) {
        return left(r);
      });
    };
  }

  _createClass(Either, null, [{
    key: 'reduce',
    value: function reduce(e) {
      return e.either(function (l) {
        return l;
      }, function (r) {
        return r;
      });
    } // eslint-disable-line no-undef

  }]);

  return Either;
}();

var Left = exports.Left = function (_Either) {
  _inherits(Left, _Either);

  function Left(l) {
    _classCallCheck(this, Left);

    var _this2 = _possibleConstructorReturn(this, (Left.__proto__ || Object.getPrototypeOf(Left)).call(this));

    _this2.isLeft = function () {
      return true;
    };

    _this2.isRight = function () {
      return false;
    };

    _this2.either = // eslint-disable-line no-undef
    function (fl, _) {
      return fl(_this2.l);
    };

    _this2.l = l;
    return _this2;
  }

  return Left;
}(Either);

var Right = exports.Right = function (_Either2) {
  _inherits(Right, _Either2);

  function Right(r) {
    _classCallCheck(this, Right);

    var _this3 = _possibleConstructorReturn(this, (Right.__proto__ || Object.getPrototypeOf(Right)).call(this));

    _this3.isLeft = function () {
      return false;
    };

    _this3.isRight = function () {
      return true;
    };

    _this3.either = // eslint-disable-line no-undef
    function (_, fr) {
      return fr(_this3.r);
    };

    _this3.r = r;
    return _this3;
  }

  return Right;
}(Either);

var LeftProjection = exports.LeftProjection = function LeftProjection(e) {
  var _this4 = this;

  _classCallCheck(this, LeftProjection);

  this.either = function () {
    return _this4.e;
  };

  this.value = function () {
    if (_this4.e.isLeft()) {
      return _this4.e.l;
    }
    throw new Error('Cannot get left value from a Right');
  };

  this.orElse = function (other) {
    return _this4.e.isLeft() ? _this4.e.l : (0, _resolveThunk.resolveThunk)(other);
  };

  this.forEach = function (f) {
    if (_this4.e.isLeft()) {
      f(_this4.value());
    }
  };

  this.map = // eslint-disable-line no-undef
  function (f) {
    return _this4.e.isLeft() ? left(f(_this4.value())) : _this4.e;
  };

  this.flatMap = // eslint-disable-line no-undef
  function (f) {
    return _this4.e.isLeft() ? f(_this4.value()) : _this4.e;
  };

  this.toOption = function () {
    return _this4.e.isLeft() ? (0, _option.some)(_this4.value()) : _option.none;
  };

  this.toArray = function () {
    return _this4.toOption().toArray();
  };

  this.e = e;
};

var RightProjection = exports.RightProjection = function RightProjection(e) {
  var _this5 = this;

  _classCallCheck(this, RightProjection);

  this.either = function () {
    return _this5.e;
  };

  this.value = function () {
    if (_this5.e.isRight()) {
      return _this5.e.r;
    }
    throw new Error('Cannot get right value from a Left');
  };

  this.orElse = function (other) {
    return _this5.e.isRight() ? _this5.e.r : (0, _resolveThunk.resolveThunk)(other);
  };

  this.forEach = function (f) {
    if (_this5.e.isRight()) {
      f(_this5.value());
    }
  };

  this.map = // eslint-disable-line no-undef
  function (f) {
    return _this5.e.isRight() ? right(f(_this5.value())) : _this5.e;
  };

  this.flatMap = // eslint-disable-line no-undef
  function (f) {
    return _this5.e.isRight() ? f(_this5.value()) : _this5.e;
  };

  this.toOption = function () {
    return _this5.e.isRight() ? (0, _option.some)(_this5.value()) : _option.none;
  };

  this.toArray = function () {
    return _this5.toOption().toArray();
  };

  this.e = e;
};

function left(l) {
  return new Left(l);
}

function right(r) {
  return new Right(r);
}