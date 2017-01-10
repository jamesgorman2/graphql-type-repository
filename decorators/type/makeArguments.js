'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.makeArguments = makeArguments;

var _graphql = require('graphql');

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _GraphQLTypeError = require('./GraphQLTypeError');

var _getDescription = require('./getDescription');

var _getInputType = require('./getInputType');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function makeArgument(argumentNode, configIn, referringType, referringFieldName, referringTypeName, typeMap, module) {
  var name = argumentNode.name.value;
  var getType = function getType() {
    return (0, _getInputType.getInputType)(argumentNode.type, typeMap, referringTypeName, module);
  };

  var configInForValue = configIn.mapOrNone(function (c) {
    return c[name];
  });

  var description = (0, _getDescription.getDescriptionObject)(argumentNode, configInForValue.mapOrNone(function (c) {
    return c.description;
  }), referringType + ' argument', referringTypeName + '.' + name + '.' + referringFieldName, module.name);
  var defaultValue = // TODO also from config
  function defaultValue(type) {
    return (0, _util.someOrNone)(argumentNode.defaultValue).map(function (v) {
      var value = (0, _graphql.valueFromAST)(v, type);
      if (value === undefined) {
        throw new _GraphQLTypeError.GraphQLTypeError('Invalid default value in argument for ' + referringType + ' ' + referringTypeName + '.' + name + '.' + referringFieldName + ' in module ' + module.name + '.');
      }
      return value;
    }).map(function (d) {
      return { defaultValue: d };
    }).getOrElse({});
  };

  return description.map(function (d) {
    return {
      name: name,
      getType: getType,
      defaultValue: defaultValue,
      description: d
    };
  });
}

function makeArguments(argumentNodes, configIn, referringType, referringFieldName, referringTypeName, typeMap, module) {
  var argumentSpecs = argumentNodes.map(function (argumentNode) {
    return makeArgument(argumentNode, configIn, referringType, referringFieldName, referringTypeName, typeMap, module);
  }).reduce(function (acc, trySpec) {
    return acc.mergeWith(trySpec, function (previousSpecs, spec) {
      return [].concat(_toConsumableArray(previousSpecs), [spec]);
    });
  }, _util.Try.of([]));

  return argumentSpecs.map(function (as) {
    return function () {
      return as.map(function (spec) {
        var type = spec.getType();
        var config = _extends({
          type: type
        }, spec.defaultValue, spec.description);
        return [spec.name, config];
      }).reduce(function (acc, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            config = _ref2[1];

        return _extends({}, acc, _defineProperty({}, name, config));
      }, {});
    };
  });
}