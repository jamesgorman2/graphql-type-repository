'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoDuplicateDirectives = assertNoDuplicateDirectives;

var _graph = require('../../graph');

var _AssertionError = require('./AssertionError');

var _errorInModules = require('./errorInModules');

function assertNoDuplicateDirectives(graphIn) {
  return graphIn.directives.values().filter(function (directive) {
    return directive.definitions.length > 1;
  }).reduce(function (graph, directive) {
    return graph.withError(new _AssertionError.AssertionError((0, _errorInModules.errorInModules)('Directive @' + directive.name + ' declared more than once', directive.definitions.map(function (d) {
      return d.module;
    }))));
  }, graphIn);
}