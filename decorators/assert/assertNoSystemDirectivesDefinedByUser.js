'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoSystemDirectivesDefinedByUser = assertNoSystemDirectivesDefinedByUser;

var _graph = require('../../graph');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

/**
 * Assert that no Directives flagged as system directives also
 * have user definitions. This include both raw and
 * schema-defined directives.
 */
function assertNoSystemDirectivesDefinedByUser(graphIn) {
  return graphIn.directives.values().filter(function (d) {
    return d.isSystem;
  }).reduce(function (graph, directive) {
    var errors = [];
    if (directive.definitions.length > 0) {
      errors.push(new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('System directive @' + directive.name + ' cannot be defined by user', directive.definitions.map(function (d) {
        return d.module;
      }))));
    }
    return graph.withErrors(errors);
  }, graphIn);
}