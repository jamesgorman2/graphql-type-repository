'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendSystemTypes = appendSystemTypes;

var _graphql = require('graphql');

var _graph = require('../../graph');

var scalars = [_graphql.GraphQLBoolean, _graphql.GraphQLID, _graphql.GraphQLInt, _graphql.GraphQLFloat, _graphql.GraphQLString];

/**
 * Append all system types used in the FlattenedTypeGraph.
 * Unused system types will be ignored.
 */
function appendSystemTypes(graphIn) {
  return scalars.reduce(function (graph, scalar) {
    var name = scalar.name;
    if (graph.types.contains(name)) {
      return graph.withType(new _graph.Type(name).setIsSystem().withType(scalar));
    }
    return graph;
  }, graphIn);
}