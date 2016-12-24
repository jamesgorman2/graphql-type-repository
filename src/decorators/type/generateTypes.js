// @flow

import type {
  GraphQLNamedType,
} from 'graphql';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

import {
  Option,
  none,
} from '../../util';

function buildType(_: Type): Option<GraphQLNamedType> {
  return none;
}

function getRawType(type: Type): Option<GraphQLNamedType> {
  return type.definitions.reduce(
    (tOut, definition) => tOut.or(definition.type),
    none
  );
}

function generateType(type: Type): Type {
  return getRawType(type).or(() => buildType(type))
    .map(namedType => type.withType(namedType))
    .getOrElse(type);
}

export function generateTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .filter(type => type.type.isNone())
    .reduce(
      (graph, type) => graph.replaceType(generateType(type)),
      graphIn
    );
}
