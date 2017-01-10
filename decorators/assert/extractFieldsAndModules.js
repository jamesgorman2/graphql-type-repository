'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.extractFieldsAndModules = extractFieldsAndModules;

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

function extractFieldsAndModules(type) {
  return (0, _util.flatMap)(type.definitions, function (typeDefinition) {
    return typeDefinition.definition.map(function (namedDefintionNode) {
      return namedDefintionNode.definition;
    }).filter(function (d) {
      return d.kind === 'ObjectTypeDefinition';
    }).map(function (d) {
      return d;
    }).flatMap(function (d) {
      return (0, _util.someOrNone)(d.fields).map(function (fs) {
        return fs.map(function (field) {
          return [field.name.value, typeDefinition.module];
        });
      });
    }).getOrElse([]);
  }).concat((0, _util.flatMap)(type.extensions, function (extension) {
    return extension.definition.definition.fields.map(function (field) {
      return [field.name.value, extension.module];
    });
  })).reduce(function (acc, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        fieldName = _ref2[0],
        module = _ref2[1];

    if ((0, _util.hasOwnProperty)(acc, fieldName)) {
      acc[fieldName].push(module);
    } else {
      acc[fieldName] = [module]; // eslint-disable-line no-param-reassign
    }
    return acc;
  }, {});
}