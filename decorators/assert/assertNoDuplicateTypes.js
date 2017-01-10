'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoDuplicateTypes = assertNoDuplicateTypes;

var _graph = require('../../graph');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

function assertNoDuplicateTypes(graphIn) {
  return graphIn.types.values().filter(function (type) {
    return type.definitions.length > 1;
  }).reduce(function (graph, type) {
    return graph.withError(new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('Type ' + type.name + ' declared more than once', type.definitions.map(function (d) {
      return d.module;
    }))));
  }, graphIn);
}