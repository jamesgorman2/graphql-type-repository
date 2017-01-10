'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoMissingSchemaResolvers = assertNoMissingSchemaResolvers;

var _graph = require('../../graph');

var _util = require('../../util');

var _AssertionError = require('./AssertionError');

function assertMissingResolversForDefinition(definition, module, label) {
  if (definition.definition.kind !== 'ObjectTypeDefinition') {
    return [new _AssertionError.AssertionError('Unexpected type ' + definition.definition.kind + ' for ' + label + ' in module ' + module.name + '. Expected an ObjectTypeDefinition.')];
  }
  var objectTypeDefinition = definition.definition;
  return objectTypeDefinition.fields.map(function (field) {
    return field.name.value;
  }).filter(function (field) {
    return !definition.config.map(function (configs) {
      return (0, _util.hasOwnProperty)(configs, 'fields') &&
      // flow-disable-next-line
      (0, _util.hasOwnProperty)(configs.fields, field);
    }).getOrElse(false);
  }).map(function (field) {
    return new _AssertionError.AssertionError('Missing config for ' + label + '.' + field + ' in module ' + module.name + '.');
  });
}

function assertMissingResolvers(type, label) {
  return type.map(function (t) {
    return (0, _util.flatMap)(t.definitions, function (typeDefinition) {
      return typeDefinition.definition.map(function (d) {
        return assertMissingResolversForDefinition(d, typeDefinition.module, label);
      }).getOrElse([new _AssertionError.AssertionError('Missing definition for ' + label + ' in module ' + typeDefinition.module.name + '.')]);
    }).concat((0, _util.flatMap)(t.extensions, function (extension) {
      return assertMissingResolversForDefinition(extension.definition, extension.module, label);
    }));
  }).getOrElse([]);
}

function assertNoMissingSchemaResolvers(graphIn) {
  return assertMissingResolvers(graphIn.schema.query, 'schema.query').concat(assertMissingResolvers(graphIn.schema.mutation, 'schema.mutation')).concat(assertMissingResolvers(graphIn.schema.subscription, 'schema.subscription')).reduce(function (graph, error) {
    return graph.withError(error);
  }, graphIn);
}