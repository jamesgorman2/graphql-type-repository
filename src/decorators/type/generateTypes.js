// @flow

import type {
  GraphQLNamedType,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

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
import { generateUnion } from './generateUnion';

type Builder = (namedDefinition: NamedDefinitionNode<*>, module: Module) => GraphQLNamedType;

const builders: [string, Builder][] = [
  generateEnum,
  generateScalar,
  generateUnion,
];

function buildTypeFromBuilder(
  type: Type,
  kind: string,
  builder: Builder
): Option<GraphQLNamedType> {
  return type.definitions.reduce(
    (acc, typeDefinition) =>
      acc.or(
        () =>
          typeDefinition.definition
            .filter(namedDefinition => namedDefinition.definition.kind === kind)
            .map(d => builder(d, typeDefinition.module))
      ),
    none
  );
}

function buildType(type: Type): Option<GraphQLNamedType> {
  return builders.reduce(
    (acc, [kind, builder]) =>
      acc.or(() => buildTypeFromBuilder(type, kind, builder)),
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
