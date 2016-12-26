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
import { TypeMap } from '../../graph';

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

      getDescription(
        v,
        configInForValue.flatMap(c => someOrNone(c.description)),
        'enum value',
        `${enumName}.${name}`,
        module.name
      )
        .forEach((description) => { config.description = description; });

      getDeprecationReason(
        someOrNone(v.directives),
        configInForValue.flatMap(c => someOrNone(c.deprecationReason)),
        'enum value',
        `${enumName}.${name}`,
        module.name
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
  typeMap: TypeMap,
  module: Module
): GraphQLNamedType {
  const configIn: Option<EnumConfig> = (namedDefinition.config: any);
  const definition: EnumTypeDefinitionNode = (namedDefinition.definition: any);
  const config: GraphQLEnumTypeConfig = {
    name: namedDefinition.name,
    values: getValues(definition.values, configIn, namedDefinition.name, module),
  };

  getDescription(
    namedDefinition.definition,
    configIn.flatMap(c => someOrNone(c.description)),
    'enum',
    namedDefinition.name,
    module.name
  )
    .forEach((d) => { config.description = d; });

  return new GraphQLEnumType(config);
}

export const generateEnum = ['EnumTypeDefinition', generateEnumFromNamedDefinition];
