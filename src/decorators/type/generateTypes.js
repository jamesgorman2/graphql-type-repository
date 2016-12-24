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

import { generateEnum } from './generateEnum';
import { generateScalar } from './generateScalar';

const builders: ((type: Type) => Option<GraphQLNamedType>)[] = [
  generateEnum,
  generateScalar,
];

function buildType(type: Type): Option<GraphQLNamedType> {
  return builders.reduce(
    (acc, builder) => acc.or(() => builder(type)),
    none
  );
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

function captureError(
  f: () => FlattenedTypeGraph,
  originalGraph: FlattenedTypeGraph
): FlattenedTypeGraph {
  try {
    return f();
  } catch (e) {
    return originalGraph.withError(e);
  }
}

export function generateTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return captureError(
    () =>
      graphIn.types.values()
        .filter(type => type.type.isNone())
        .reduce(
          (graph, type) => graph.replaceType(generateType(type)),
          graphIn
        ),
    graphIn
  );
}
