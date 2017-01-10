'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoModuleErrors = assertNoModuleErrors;

var _graph = require('../../graph');

var _util = require('../../util');

var _NestedAssertionError = require('./NestedAssertionError');

var _errorInModules = require('./errorInModules');

function assertNoModuleErrors(graphIn) {
  return (0, _util.flatMap)(graphIn.moduleRepositories, function (moduleRepository) {
    return moduleRepository.modules;
  }).reduce(function (graph, module) {
    return graph.withErrors(module.errors.map(function (error) {
      return new _NestedAssertionError.NestedAssertionError((0, _errorInModules.errorInModules)('Error', [module]), error);
    }));
  }, graphIn);
}