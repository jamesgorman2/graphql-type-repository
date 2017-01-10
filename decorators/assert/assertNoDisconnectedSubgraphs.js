'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoDisconnectedSubgraphs = assertNoDisconnectedSubgraphs;

var _graph = require('../../graph');

var _util = require('../../util');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getRefs(type) {
  return type.map(function (t) {
    return t.typeRefs.keys();
  }).getOrElse([]);
}

function assertNoDisconnectedSubgraphs(graphIn) {
  var reachableFromSchema = [];
  var typesToCheck = getRefs(graphIn.schema.query).concat(getRefs(graphIn.schema.mutation)).concat(getRefs(graphIn.schema.subscription));

  if (typesToCheck.length === 0) {
    return graphIn;
  }

  while (typesToCheck.length > 0) {
    var t = typesToCheck.pop();
    if (!reachableFromSchema.includes(t)) {
      reachableFromSchema.push(t);
      typesToCheck.push.apply(typesToCheck, _toConsumableArray(getRefs(graphIn.types.get(t))));
    }
  }

  return graphIn.types.values().filter(function (type) {
    return !reachableFromSchema.includes(type.name);
  }).reduce(function (graph, type) {
    return graph.withError(new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('Type ' + type.name + ' not reachable from schema', type.definitions.map(function (definition) {
      return definition.module;
    }))));
  }, graphIn);
}