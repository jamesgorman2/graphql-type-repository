'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoMissingDirectives = assertNoMissingDirectives;

var _graph = require('../../graph');

var _util = require('../../util');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

function notDefined(directive) {
  return directive.directive.isNone() && directive.definitions.length === 0;
}

function findSchemaTypes(directiveName, schemaType, label) {
  return schemaType.filter(function (referrant) {
    return referrant.directiveRefs.keys().includes(directiveName);
  }).map(function (referrant) {
    return label + ' ' + (0, _errorInModules.inModules)(referrant.directiveRefs.get(directiveName).map(function (ms) {
      return ms.toArray();
    }).getOrElse([]));
  }).toArray();
}

function findReferrants(directiveName, allTypes, schema) {
  return new _AssertionError.AssertionError('Undefined directive ' + directiveName + ' referenced from ' + allTypes.filter(function (referrant) {
    return referrant.directiveRefs.keys().includes(directiveName);
  }).reduce(function (acc, referrant) {
    return acc.concat('type ' + referrant.name + ' ' + (0, _errorInModules.inModules)(referrant.directiveRefs.get(directiveName).map(function (ms) {
      return ms.toArray();
    }).getOrElse([])));
  }, []).concat(schema.directiveRefs.keys().includes(directiveName) ? 'schema ' + (0, _errorInModules.inModules)(schema.directiveRefs.get(directiveName).map(function (ms) {
    return ms.toArray();
  }).getOrElse([])) : []).concat(findSchemaTypes(directiveName, schema.query, 'schema.query')).concat(findSchemaTypes(directiveName, schema.mutation, 'schema.mutation')).concat(findSchemaTypes(directiveName, schema.subscription, 'schema.subscription')).join(', ') + '.');
}

function assertNoMissingDirectives(graphIn) {
  return graphIn.directives.values().filter(notDefined).map(function (directive) {
    return findReferrants(directive.name, graphIn.types.values(), graphIn.schema);
  }).reduce(function (graph, error) {
    return graph.withError(error);
  }, graphIn);
}