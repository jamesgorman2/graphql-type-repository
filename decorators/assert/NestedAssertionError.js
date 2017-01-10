'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var NestedAssertionError = exports.NestedAssertionError = function (_extendableBuiltin2) {
  _inherits(NestedAssertionError, _extendableBuiltin2);

  function NestedAssertionError(message, causedBy) {
    _classCallCheck(this, NestedAssertionError);

    var _this = _possibleConstructorReturn(this, (NestedAssertionError.__proto__ || Object.getPrototypeOf(NestedAssertionError)).call(this, message));

    _this.causedBy = causedBy;
    _this.stack = _this.stack + '\nCaused by: ' + causedBy.stack.replace(/^Error:\s*/, '');
    return _this;
  }

  return NestedAssertionError;
}(_extendableBuiltin(Error));