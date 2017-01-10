'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoSystemTypesDefinedByUser = assertNoSystemTypesDefinedByUser;

var _graph = require('../../graph');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

/**
 * Assert that no Types flagged as system types also
 * have user definitions. This include both raw and
 * schema-defined types.
 */
function assertNoSystemTypesDefinedByUser(graphIn) {
  return graphIn.types.values().filter(function (t) {
    return t.isSystem;
  }).reduce(function (graph, type) {
    var errors = [];
    if (type.definitions.length > 0) {
      errors.push(new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('System type ' + type.name + ' cannot be defined by user', type.definitions.map(function (d) {
        return d.module;
      }))));
    }
    if (type.extensions.length > 0) {
      errors.push(new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('System type ' + type.name + ' cannot be extended by user', type.definitions.map(function (d) {
        return d.module;
      }))));
    }
    return graph.withErrors(errors);
  }, graphIn);
}