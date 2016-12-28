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
} from '../../util';

import {
  getDescription,
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

function generateUnionFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): GraphQLNamedType {
  const name = namedDefinition.name;
  const configIn: Option<UnionConfig> = (namedDefinition.config: any);
  const types = getTypes(namedDefinition.definition, name, typeMap, module);

  const config: GraphQLUnionTypeConfig<*, *> = {
    name,
    types,
  };

  getDescription(
    namedDefinition.definition,
    configIn.mapOrNone(c => c.description),
    'union',
    namedDefinition.name,
    module.name
  )
    .forEach((d) => { config.description = d; });

  configIn
    .mapOrNone(c => c.resolveType)
    .forEach((resolveType) => { config.resolveType = resolveType; });

  return new GraphQLUnionType(config);
}

export const generateUnion = ['UnionTypeDefinition', generateUnionFromNamedDefinition];
