'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoMissingTypes = assertNoMissingTypes;

var _graph = require('../../graph');

var _util = require('../../util');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

function notDefined(type) {
  return type.type.isNone() && type.definitions.length === 0;
}

function findSchemaTypes(typeName, schemaType, label) {
  return schemaType.filter(function (referrant) {
    return referrant.typeRefs.keys().includes(typeName);
  }).map(function (referrant) {
    return label + ' ' + (0, _errorInModules.inModules)(referrant.typeRefs.get(typeName).map(function (ms) {
      return ms.toArray();
    }).getOrElse([]));
  }).toArray();
}

function findErrorsFromReferents(typeName, extensions, allTypes, schema) {
  return new _AssertionError.AssertionError('Undefined type ' + typeName + ' referenced from ' + allTypes.filter(function (referrant) {
    return referrant.typeRefs.keys().includes(typeName);
  }).reduce(function (acc, referrant) {
    return acc.concat('type ' + referrant.name + ' ' + (0, _errorInModules.inModules)(referrant.typeRefs.get(typeName).map(function (ms) {
      return ms.toArray();
    }).getOrElse([])));
  }, []).concat(extensions.length ? ['extended ' + (0, _errorInModules.inModules)(extensions.map(function (e) {
    return e.module;
  }))] : []).concat(findSchemaTypes(typeName, schema.query, 'schema.query')).concat(findSchemaTypes(typeName, schema.mutation, 'schema.mutation')).concat(findSchemaTypes(typeName, schema.subscription, 'schema.subscription')).join(', ') + '.');
}

function assertNoMissingTypes(graphIn) {
  return graphIn.types.values().filter(notDefined).map(function (type) {
    return findErrorsFromReferents(type.name, type.extensions, graphIn.types.values(), graphIn.schema);
  }).reduce(function (graph, error) {
    return graph.withError(error);
  }, graphIn);
}