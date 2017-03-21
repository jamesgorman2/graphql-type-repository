// @flow

import {
  GraphQLUnionType,
} from 'graphql';
import type {
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLUnionTypeConfig,
  UnionTypeDefinitionNode,
  Thunk,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';
import type {
  UnionConfig,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Option,
  Try,
} from '../../util';

import {
  getDescriptionObject,
} from './getDescription';

function getTypes(
  definition: UnionTypeDefinitionNode,
  name: string,
  typeMap: TypeMap,
  module: Module
): Thunk<Array<GraphQLObjectType>> {
  return () =>
    definition.types
      .map(node => node.name.value)
      .map(typeName => typeMap.getObjectType(typeName, name, module));
}

function makeUnionFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): Try<GraphQLNamedType> {
  const name = namedDefinition.name;
  const configIn: Option<UnionConfig> = (namedDefinition.config: any);
  const types = getTypes(namedDefinition.definition, name, typeMap, module);

  const description = getDescriptionObject(
    namedDefinition.definition,
    configIn.mapOrNone(c => c.description),
    'union',
    namedDefinition.name,
    module.name
  );

  const config: Try<GraphQLUnionTypeConfig<*, *>> = Try.of({
    name,
    types,
  })
    .map(
      c => ({
        ...c,
        ...(
          configIn.mapOrNone(cIn => cIn.resolveType)
            .map(resolveType => ({ resolveType }))
            .getOrElse({})
        ),
      })
    )
    .mergeWith(
      description,
      (c, enumDescription) =>
        ({ ...c, ...enumDescription })
    );

  return config.map(c => new GraphQLUnionType(c));
}

export const makeUnion = ['UnionTypeDefinition', makeUnionFromNamedDefinition];
