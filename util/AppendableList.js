'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppendableList = undefined;

var _Appendable2 = require('./Appendable');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppendableList = exports.AppendableList = function (_Appendable) {
  _inherits(AppendableList, _Appendable);

  function AppendableList() {
    var ts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, AppendableList);

    var _this = _possibleConstructorReturn(this, (AppendableList.__proto__ || Object.getPrototypeOf(AppendableList)).call(this));

    _this.append = function (other) {
      return new AppendableList([].concat(_toConsumableArray(_this.ts), _toConsumableArray(other.ts)));
    };

    _this.toArray = function () {
      return _this.ts;
    };

    _this.push = function (t) {
      return new AppendableList([].concat(_toConsumableArray(_this.ts), [t]));
    };

    _this.ts = ts;
    return _this;
  }

  return AppendableList;
}(_Appendable2.Appendable);