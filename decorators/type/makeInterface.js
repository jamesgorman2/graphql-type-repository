'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeInterface = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _graphql = require('graphql');

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

var _makeFields = require('./makeFields');

var _getDescription = require('./getDescription');

function makeInterfaceFromNamedDefinition(namedDefinition, typeMap, module) {
  var name = namedDefinition.name;
  var configIn = namedDefinition.config;
  var fields = (0, _makeFields.makeFields)(namedDefinition.definition.fields, configIn.mapOrNone(function (c) {
    return c.fields;
  }), 'interface', name, typeMap, module);

  var description = (0, _getDescription.getDescriptionObject)(namedDefinition.definition, configIn.mapOrNone(function (c) {
    return c.description;
  }), 'interface', namedDefinition.name, module.name);

  var config = fields.map(function (fs) {
    return {
      name: name,
      fields: fs
    };
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
    return new _graphql.GraphQLInterfaceType(c);
  });
}

var makeInterface = exports.makeInterface = ['InterfaceTypeDefinition', makeInterfaceFromNamedDefinition];