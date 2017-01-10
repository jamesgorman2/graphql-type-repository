'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeEnum = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _graphql = require('graphql');

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _getDeprecationReason = require('./getDeprecationReason');

var _getDescription = require('./getDescription');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getValues(values, configIn, enumName, module) {
  return values.reduce(function (acc, v) {
    var name = v.name.value;

    var configInForValue = configIn.mapOrNone(function (c) {
      return c.values;
    }).mapOrNone(function (c) {
      return c[name];
    });

    var description = (0, _getDescription.getDescriptionObject)(v, configInForValue.mapOrNone(function (c) {
      return c.description;
    }), 'enum value', enumName + '.' + name, module.name);

    var deprecationReason = (0, _getDeprecationReason.getDeprecationReasonObject)((0, _util.someOrNone)(v.directives), configInForValue.mapOrNone(function (c) {
      return c.deprecationReason;
    }), 'enum value', enumName + '.' + name, module.name);

    var config = _util.Try.of(configInForValue.mapOrNone(function (c) {
      return c.value;
    }).map(function (value) {
      return { value: value };
    }).getOrElse({})).mergeWith(description, function (c1, c2) {
      return _extends({}, c1, c2);
    }).mergeWith(deprecationReason, function (c1, c2) {
      return _extends({}, c1, c2);
    });

    return acc.mergeWith(config, function (accumulatedConfig, newValueConfig) {
      return _extends({}, accumulatedConfig, _defineProperty({}, name, newValueConfig));
    });
  }, _util.Try.of({}));
}

function makeEnumFromNamedDefinition(namedDefinition, typeMap, module) {
  var configIn = namedDefinition.config;
  var definition = namedDefinition.definition;
  var values = getValues(definition.values, configIn, namedDefinition.name, module);
  var description = (0, _getDescription.getDescriptionObject)(namedDefinition.definition, configIn.mapOrNone(function (cIn) {
    return cIn.description;
  }), 'enum', namedDefinition.name, module.name);

  var config = values.map(function (vs) {
    return {
      name: namedDefinition.name,
      values: vs
    };
  }).mergeWith(description, function (enumConfig, enumDescription) {
    return _extends({}, enumConfig, enumDescription);
  });

  return config.map(function (c) {
    return new _graphql.GraphQLEnumType(c);
  });
}

var makeEnum = exports.makeEnum = ['EnumTypeDefinition', makeEnumFromNamedDefinition];