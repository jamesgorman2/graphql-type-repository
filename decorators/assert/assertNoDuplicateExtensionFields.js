'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.assertNoDuplicateExtensionFields = assertNoDuplicateExtensionFields;

var _graph = require('../../graph');

var _util = require('../../util');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

var _extractFieldsAndModules = require('./extractFieldsAndModules');

function typeToExtensionFieldErrors(type) {
  return (0, _util.entries)((0, _extractFieldsAndModules.extractFieldsAndModules)(type)).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        modules = _ref2[1];

    return modules.length > 1;
  }).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        fieldName = _ref4[0],
        modules = _ref4[1];

    return new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('Field ' + type.name + '.' + fieldName + ' declared more than once', modules));
  });
}

function assertNoDuplicateExtensionFields(graphIn) {
  return graphIn.types.values().map(typeToExtensionFieldErrors).filter(function (errors) {
    return errors.length > 0;
  }).reduce(function (graph, error) {
    return graph.withErrors(error);
  }, graphIn);
}