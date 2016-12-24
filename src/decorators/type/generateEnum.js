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

import { getDescription } from 'graphql/utilities/buildASTSchema';

import {
  Option,
  hasOwnProperty,
  someOrNone,
  none,
} from '../../util';

import {
  NamedDefinitionNode,
} from '../../config';

import {
  Type,
} from '../../graph';

import { getDeprecationReason } from './getDeprecationReason';

function getValues(values: EnumValueDefinitionNode[]): GraphQLEnumValueConfigMap {
  return values.reduce(
    (map, v) => {
      const config = {};
      const name = v.name.value;
      const description = getDescription(v);
      const deprecationReason = getDeprecationReason(someOrNone(v.directives));
      if (description) {
        config.description = description;
      }
      if (deprecationReason) {
        config.deprecationReason = deprecationReason;
      }
      return {
        ...map,
        [name]: config,
      };
    },
    {}
  );
}

function generateEnumFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>
): GraphQLEnumType {
  const definition: EnumTypeDefinitionNode = (namedDefinition.definition: any);
  const config: GraphQLEnumTypeConfig = {
    name: namedDefinition.name,
    values: getValues(definition.values),
    ...namedDefinition.resolvers.getOrElse({}),
  };
  if (!hasOwnProperty(config, 'description')) {
    const description = getDescription(namedDefinition.definition);
    if (description) {
      config.description = description;
    }
  }
  return new GraphQLEnumType(config);
}

export function generateEnum(type: Type): Option<GraphQLNamedType> {
  return type.definitions.reduce(
    (acc, typeDefinition) =>
      acc.or(
        () =>
          typeDefinition.definition
            .filter(namedDefinition => namedDefinition.definition.kind === 'EnumTypeDefinition')
            .map(generateEnumFromNamedDefinition)
      ),
    none
  );
}
