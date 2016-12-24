// @flow

import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLScalarType,
} from 'graphql';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

const scalars: GraphQLScalarType[] = [
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
];

/**
 * Append all system types used in the FlattenedTypeGraph.
 * Unused system types will be ignored.
 */
export function appendSystemTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return scalars.reduce(
    (graph, scalar) => {
      const name = scalar.name;
      if (graph.types.contains(name)) {
        return graph.withType(new Type(name).setIsSystem().withType(scalar));
      }
      return graph;
    },
    graphIn,
  );
}
