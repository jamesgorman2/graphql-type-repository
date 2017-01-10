'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeScalar = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.makeScalarFromNamedDefinition = makeScalarFromNamedDefinition;

var _graphql = require('graphql');

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _GraphQLTypeError = require('./GraphQLTypeError');

var _getDescription = require('./getDescription');

function getConfigIn(namedDefinition, module) {
  if (namedDefinition.config.isNone()) {
    return _util.Try.failure(new _GraphQLTypeError.GraphQLTypeError('Scalar ' + namedDefinition.name + ' missing required configs in module ' + module.name + '.'));
  }

  var configIn = namedDefinition.config.get();
  if (!configIn.serialize) {
    return _util.Try.failure(new _GraphQLTypeError.GraphQLTypeError('Scalar ' + namedDefinition.name + ' missing required config parameter serialize in module ' + module.name + '.'));
  }
  return _util.Try.of(configIn);
}

function makeScalarFromNamedDefinition(namedDefinition, typeMap, module) {
  var configIn = getConfigIn(namedDefinition, module);

  var description = configIn.flatMap(function (cIn) {
    return (0, _getDescription.getDescriptionObject)(namedDefinition.definition, (0, _util.someOrNone)(cIn.description), 'scalar', namedDefinition.name, module.name);
  });

  var config = configIn.flatMap(function (cIn) {
    return _util.Try.success({
      name: namedDefinition.name,
      serialize: cIn.serialize
    }).map(function (c) {
      return cIn.parseValue ? _extends({}, c, { parseValue: cIn.parseValue }) : c;
    }).map(function (c) {
      return cIn.parseLiteral ? _extends({}, c, { parseLiteral: cIn.parseLiteral }) : c;
    }).mergeWith(description, function (c, enumDescription) {
      return _extends({}, c, enumDescription);
    });
  });

  return config.map(function (c) {
    return new _graphql.GraphQLScalarType(c);
  });
}

var makeScalar = exports.makeScalar = ['ScalarTypeDefinition', makeScalarFromNamedDefinition];