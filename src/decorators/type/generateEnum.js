// @flow
import {
  GraphQLEnumType,
} from 'graphql';
import type {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  GraphQLEnumTypeConfig,
  GraphQLEnumValueConfigMap,
  GraphQLNamedType,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';
import type {
  EnumConfig,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Option,
  Try,
  someOrNone,
} from '../../util';

import {
  getDeprecationReasonObject,
} from './getDeprecationReason';
import {
  getDescriptionObject,
} from './getDescription';

function getValues(
  values: EnumValueDefinitionNode[],
  configIn: Option<EnumConfig>,
  enumName: string,
  module: Module
): Try<GraphQLEnumValueConfigMap> {
  return values.reduce(
    (acc, v) => {
      const name = v.name.value;

      const configInForValue = configIn
        .mapOrNone(c => c.values)
        .mapOrNone(c => c[name]);

      const description = getDescriptionObject(
        v,
        configInForValue.mapOrNone(c => c.description),
        'enum value',
        `${enumName}.${name}`,
        module.name
      );

      const deprecationReason = getDeprecationReasonObject(
        someOrNone(v.directives),
        configInForValue.mapOrNone(c => c.deprecationReason),
        'enum value',
        `${enumName}.${name}`,
        module.name
      );

      const config = Try.of(
        configInForValue.mapOrNone(c => c.value)
          .map(value => ({ value }))
          .getOrElse({})
      )
        .mergeWith(
          description,
          (c1, c2) => ({ ...c1, ...c2 })
        )
        .mergeWith(
          deprecationReason,
          (c1, c2) => ({ ...c1, ...c2 })
        );

      return acc.mergeWith(
        config,
        (accumulatedConfig, newValueConfig) => ({
          ...accumulatedConfig,
          [name]: newValueConfig,
        }
        )
      );
    },
    Try.of({})
  );
}

function generateEnumFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): Try<GraphQLNamedType> {
  const configIn: Option<EnumConfig> = (namedDefinition.config: any);
  const definition: EnumTypeDefinitionNode = (namedDefinition.definition: any);
  const values = getValues(definition.values, configIn, namedDefinition.name, module);
  const description = getDescriptionObject(
    namedDefinition.definition,
    configIn.mapOrNone(cIn => cIn.description),
    'enum',
    namedDefinition.name,
    module.name
  );

  const config: Try<GraphQLEnumTypeConfig> = values.map(
    vs => ({
      name: namedDefinition.name,
      values: vs,
    })
  )
    .mergeWith(
      description,
      (enumConfig: GraphQLEnumTypeConfig, enumDescription) =>
        ({ ...enumConfig, ...enumDescription })
    );

  return config.map(c => new GraphQLEnumType(c));
}

export const generateEnum = ['EnumTypeDefinition', generateEnumFromNamedDefinition];
