'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.makeTypes = makeTypes;

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _makeEnum = require('./makeEnum');

var _makeInterface = require('./makeInterface');

var _makeScalar = require('./makeScalar');

var _makeUnion = require('./makeUnion');

var builders = [_makeEnum.makeEnum, _makeInterface.makeInterface, _makeScalar.makeScalar, _makeUnion.makeUnion];

function buildTypeFromBuilder(type, typeMap, kind, builder) {
  return type.definitions.reduce(function (acc, typeDefinition) {
    return acc.or(function () {
      return typeDefinition.definition.filter(function (namedDefinition) {
        return namedDefinition.definition.kind === kind;
      }).map(function (d) {
        return builder(d, typeMap, typeDefinition.module);
      });
    });
  }, _util.none);
}

function buildType(type, typeMap) {
  return builders.reduce(function (acc, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        kind = _ref2[0],
        builder = _ref2[1];

    return acc.or(function () {
      return buildTypeFromBuilder(type, typeMap, kind, builder);
    });
  }, _util.none);
}

function getRawType(type) {
  return type.definitions.reduce(function (tOut, definition) {
    return tOut.or(definition.type.map(function (t) {
      return _util.Try.of(t);
    }));
  }, _util.none);
}

function makeType(type, typeMap) {
  return getRawType(type).or(function () {
    return buildType(type, typeMap);
  }).map(function (namedTypeTry) {
    return namedTypeTry.map(function (namedType) {
      return type.withType(namedType);
    });
  }).getOrElse(_util.Try.of(type));
}

function makeTypes(graphIn) {
  var typeMap = new _graph.TypeMap();
  return graphIn.types.values().filter(function (type) {
    return type.type.isNone();
  }).reduce(function (graph, type) {
    return makeType(type, typeMap).toEither().mapReduce(graph.replaceType, graph.withErrors);
  }, graphIn).withTypeMap(typeMap);
}