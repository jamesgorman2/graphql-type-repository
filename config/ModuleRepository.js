'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModuleRepository = undefined;

var _util = require('../util');

var _Module = require('./Module');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isNewModule(module, existingModules) {
  return !existingModules.find(function (m) {
    return m.name === module.name;
  });
}

function assertNewModule(module, existingModules) {
  return (0, _util.assert)(isNewModule(module, existingModules), 'cannot add module with duplicate name \'' + module.name + '\'');
}

function assertNonEmptyModule(module) {
  return (0, _util.assert)(!module.isEmpty(), 'cannot add empty module \'' + module.name + '\'');
}

var ModuleRepository = exports.ModuleRepository = function (_Appendable) {
  _inherits(ModuleRepository, _Appendable);

  function ModuleRepository() {
    var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var errors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, ModuleRepository);

    var _this = _possibleConstructorReturn(this, (ModuleRepository.__proto__ || Object.getPrototypeOf(ModuleRepository)).call(this));

    _initialiseProps.call(_this);

    _this.modules = modules;
    _this.errors = errors;
    return _this;
  }

  return ModuleRepository;
}(_util.Appendable);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.isEmpty = function () {
    return _this2.modules.length === 0;
  };

  this.withModule = function (module) {
    return _this2.captureError(assertNewModule(module, _this2.modules).flatMap(function (_) {
      return assertNonEmptyModule(module);
    }).map(function (_) {
      return new ModuleRepository([].concat(_toConsumableArray(_this2.modules), [module]), _this2.errors);
    }));
  };

  this.withError = function (error) {
    return new ModuleRepository(_this2.modules, [].concat(_toConsumableArray(_this2.errors), [error]));
  };

  this.withErrors = function (errors) {
    return new ModuleRepository(_this2.modules, [].concat(_toConsumableArray(_this2.errors), _toConsumableArray(errors)));
  };

  this.append = function (other) {
    return new ModuleRepository([].concat(_toConsumableArray(_this2.modules), _toConsumableArray(other.modules)), [].concat(_toConsumableArray(_this2.errors), _toConsumableArray(other.errors)));
  };

  this.captureError = function (maybeModuleRepository) {
    return maybeModuleRepository.toEither().mapReduce(function (moduleRepository) {
      return moduleRepository;
    }, _this2.withErrors);
  };
};