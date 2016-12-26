// @flow
import {
  GraphQLEnumType,
} from 'graphql';

import type {
  EnumValueDefinitionNode,
  EnumTypeDefinitionNode,
  GraphQLNamedType,
  GraphQLEnumTypeConfig,
  GraphQLEnumValueConfigMap,
} from 'graphql';

import {
  Option,
  someOrNone,
} from '../../util';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import type {
  EnumConfig,
} from '../../config';

import { TypeError } from './TypeError';
import { getDescription } from './getDescription';
import { getDeprecationReason } from './getDeprecationReason';

function getValues(
  values: EnumValueDefinitionNode[],
  configIn: Option<EnumConfig>,
  enumName: string,
  module: Module
): GraphQLEnumValueConfigMap {
  return values.reduce(
    (map, v) => {
      const config = {};

      const name = v.name.value;

      const configInForValue = configIn
        .flatMap(c => someOrNone(c.values))
        .flatMap(c => someOrNone(c[name]));

      const descriptionFromSchema = getDescription(v);
      const descriptionFromConfig = configInForValue
        .flatMap(c => someOrNone(c.description));
      descriptionFromSchema.xor(
        descriptionFromConfig,
        () =>
          new TypeError(
            `Description for enum value ${enumName}.${name} supplied in both schema and config in module ${module.name}. It must only be supplied in one of these.`
          )
      )
        .forEach((description) => { config.description = description; });

      const deprecationReasonFromSchema = getDeprecationReason(someOrNone(v.directives));
      const deprecationReasonFromConfig = configInForValue
        .flatMap(c => someOrNone(c.deprecationReason));
      deprecationReasonFromSchema.xor(
        deprecationReasonFromConfig,
        () =>
          new TypeError(
            `Deprecation for enum value ${enumName}.${name} supplied in both schema and config in module ${module.name}. It must only be supplied in one of these.`
          )
      )
        .forEach((deprecationReason) => { config.deprecationReason = deprecationReason; });

      configInForValue.flatMap(c => someOrNone(c.value))
        .forEach((value) => { config.value = value; });

      return {
        ...map,
        [name]: config,
      };
    },
    {}
  );
}

function generateEnumFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  module: Module
): GraphQLNamedType {
  const configIn: Option<EnumConfig> = (namedDefinition.config: any);
  const definition: EnumTypeDefinitionNode = (namedDefinition.definition: any);
  const config: GraphQLEnumTypeConfig = {
    name: namedDefinition.name,
    values: getValues(definition.values, configIn, namedDefinition.name, module),
  };

  const descriptionFromSchema = getDescription(namedDefinition.definition);
  const descriptionFromConfig = configIn.flatMap(c => someOrNone(c.description));
  descriptionFromSchema.xor(
    descriptionFromConfig,
    () =>
      new TypeError(
        `Description for enum ${namedDefinition.name} supplied in both schema and config in module ${module.name}. It must only be supplied in one of these.`
      )
  )
    .forEach((d) => { config.description = d; });

  return new GraphQLEnumType(config);
}

export const generateEnum = ['EnumTypeDefinition', generateEnumFromNamedDefinition];
