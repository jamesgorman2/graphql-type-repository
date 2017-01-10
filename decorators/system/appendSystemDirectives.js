'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendSystemDirectives = appendSystemDirectives;

var _graphql = require('graphql');

var _graph = require('../../graph');

/**
 * Append all system directives used in the FlattenedTypeGraph.
 * Unused system directives will be ignored.
 */
function appendSystemDirectives(graphIn) {
  return _graphql.specifiedDirectives.reduce(function (graph, directive) {
    var name = directive.name;
    if (graph.directives.contains(name)) {
      return graph.withDirective(new _graph.Directive(name).setIsSystem().withDirective(directive));
    }
    return graph;
  }, graphIn);
}