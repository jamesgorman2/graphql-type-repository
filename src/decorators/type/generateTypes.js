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
  TypeMap,
} from '../../graph';
import {
  Option,
  Try,
  none,
} from '../../util';

import { generateEnum } from './generateEnum';
import { generateInterface } from './generateInterface';
import { generateScalar } from './generateScalar';
import { generateUnion } from './generateUnion';

type Builder =
  (
    namedDefinition: NamedDefinitionNode<*>,
    typeMap: TypeMap,
    module: Module
  ) => Try<GraphQLNamedType>;

const builders: [string, Builder][] = [
  generateEnum,
  generateInterface,
  generateScalar,
  generateUnion,
];

function buildTypeFromBuilder(
  type: Type,
  typeMap: TypeMap,
  kind: string,
  builder: Builder
): Option<Try<GraphQLNamedType>> {
  return type.definitions.reduce(
    (acc, typeDefinition) =>
      acc.or(
        () =>
          typeDefinition.definition
            .filter(namedDefinition => namedDefinition.definition.kind === kind)
            .map(d => builder(d, typeMap, typeDefinition.module))
      ),
    none
  );
}

function buildType(type: Type, typeMap: TypeMap): Option<Try<GraphQLNamedType>> {
  return builders.reduce(
    (acc, [kind, builder]) =>
      acc.or(() => buildTypeFromBuilder(type, typeMap, kind, builder)),
    none
  );
}

function getRawType(type: Type): Option<Try<GraphQLNamedType>> {
  return type.definitions.reduce(
    (tOut, definition) => tOut.or(definition.type.map(t => Try.of(t))),
    none
  );
}

function generateType(type: Type, typeMap: TypeMap): Try<Type> {
  return getRawType(type).or(() => buildType(type, typeMap))
    .map(
      namedTypeTry =>
        namedTypeTry.map(
          namedType => type.withType(namedType)
        )
    )
    .getOrElse(Try.of(type));
}

export function generateTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  const typeMap = new TypeMap();
  return graphIn.types.values()
    .filter(type => type.type.isNone())
    .reduce(
      (graph, type) =>
        generateType(type, typeMap).toEither()
          .mapReduce(graph.replaceType, graph.withErrors),
      graphIn
    )
    .withTypeMap(typeMap);
}
