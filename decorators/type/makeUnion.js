'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeUnion = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _graphql = require('graphql');

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _getDescription = require('./getDescription');

function getTypes(definition, name, typeMap, module) {
  return function () {
    return definition.types.map(function (node) {
      return node.name.value;
    }).map(function (typeName) {
      return typeMap.getObjectType(typeName, name, module);
    });
  };
}

function makeUnionFromNamedDefinition(namedDefinition, typeMap, module) {
  var name = namedDefinition.name;
  var configIn = namedDefinition.config;
  var types = getTypes(namedDefinition.definition, name, typeMap, module);

  var description = (0, _getDescription.getDescriptionObject)(namedDefinition.definition, configIn.mapOrNone(function (c) {
    return c.description;
  }), 'union', namedDefinition.name, module.name);

  var config = _util.Try.of({
    name: name,
    types: types
  }).map(function (c) {
    return _extends({}, c, configIn.mapOrNone(function (cIn) {
      return cIn.resolveType;
    }).map(function (resolveType) {
      return { resolveType: resolveType };
    }).getOrElse({}));
  }).mergeWith(description, function (c, enumDescription) {
    return _extends({}, c, enumDescription);
  });

  return config.map(function (c) {
    return new _graphql.GraphQLUnionType(c);
  });
}

var makeUnion = exports.makeUnion = ['UnionTypeDefinition', makeUnionFromNamedDefinition];