'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertNoModuleRepositoryErrors = assertNoModuleRepositoryErrors;

var _graph = require('../../graph');

function assertNoModuleRepositoryErrors(graphIn) {
  return graphIn.moduleRepositories.reduce(function (graph, repository) {
    return graph.withErrors(repository.errors);
  }, graphIn);
}