'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.makeFields = makeFields;

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _getDeprecationReason = require('./getDeprecationReason');

var _getDescription = require('./getDescription');

var _getOutputType = require('./getOutputType');

var _makeArguments = require('./makeArguments');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function makeFieldSpec(fieldNode, configIn, referringType, referringTypeName, typeMap, module) {
  var name = fieldNode.name.value;
  var getType = function getType() {
    return (0, _getOutputType.getOutputType)(fieldNode.type, typeMap, referringTypeName, module);
  };

  var configInForValue = configIn.mapOrNone(function (c) {
    return c[name];
  });

  var description = (0, _getDescription.getDescriptionObject)(fieldNode, configInForValue.mapOrNone(function (c) {
    return c.description;
  }), referringType + ' field', referringTypeName + '.' + name, module.name);
  var deprecationReason = (0, _getDeprecationReason.getDeprecationReasonObject)((0, _util.someOrNone)(fieldNode.directives), configInForValue.mapOrNone(function (c) {
    return c.deprecationReason;
  }), referringType + ' field', referringTypeName + '.' + name, module.name);
  var getArgs = (0, _util.someOrNone)(fieldNode.arguments).map(function (argumentsNode) {
    return (0, _makeArguments.makeArguments)(argumentsNode, configInForValue.mapOrNone(function (c) {
      return c.arguments;
    }), referringType, name, referringTypeName, typeMap, module);
  }).getOrElse(_util.Try.success({}));

  return description.map(function (d) {
    return {
      name: name,
      getType: getType,
      description: d
    };
  }).mergeWith(deprecationReason, function (c, d) {
    return _extends({}, c, { deprecationReason: d });
  }).mergeWith(getArgs, function (c, a) {
    return _extends({}, c, { getArgs: a });
  });
}

function makeFields(fieldNodes, configIn, referringType, referringTypeName, typeMap, module) {
  var fieldSpecs = fieldNodes.map(function (fieldNode) {
    return makeFieldSpec(fieldNode, configIn, referringType, referringTypeName, typeMap, module);
  }).reduce(function (acc, trySpec) {
    return acc.mergeWith(trySpec, function (previousSpecs, spec) {
      return [].concat(_toConsumableArray(previousSpecs), [spec]);
    });
  }, _util.Try.of([]));

  return fieldSpecs.map(function (fs) {
    return function () {
      return fs.map(function (spec) {
        var type = spec.getType();
        var args = (0, _util.resolveThunk)(spec.getArgs);
        var config = _extends({
          type: type
        }, args, spec.description, spec.deprecationReason);
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