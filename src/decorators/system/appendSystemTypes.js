// @flow

import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

const scalars = [
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
export function appendSystemTypes(graph: FlattenedTypeGraph): FlattenedTypeGraph {
  return scalars.reduce(
    (g, scalar) => {
      const name = scalar.name;
      if (g.containsType(name)) {
        return g.withType(new Type(name).isSystem().withType(scalar));
      }
      return g;
    },
    graph,
  );
}
