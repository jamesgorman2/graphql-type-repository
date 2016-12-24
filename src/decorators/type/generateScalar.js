// @flow

import {
  GraphQLScalarType,
} from 'graphql';

import type {
  GraphQLNamedType,
  GraphQLScalarTypeConfig,
} from 'graphql';

import { getDescription } from 'graphql/utilities/buildASTSchema';

import {
  Option,
  hasOwnProperty,
  none,
} from '../../util';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import {
  Type,
} from '../../graph';

import { ConfigurationError } from './ConfigurationError';

function generateScalarFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  module: Module
): GraphQLScalarType {
  if (namedDefinition.resolvers.isNone()) {
    throw new ConfigurationError(
      `Scalar type ${namedDefinition.name} missing required resolvers in module ${module.name}.`
    );
  }
  if (!namedDefinition.resolvers.get().serialize) {
    throw new ConfigurationError(
      `Scalar type ${namedDefinition.name} missing required resolver parameter serialize in module ${module.name}.`
    );
  }

  const config: GraphQLScalarTypeConfig<*, *> = {
    name: namedDefinition.name,
    ...namedDefinition.resolvers.get(),
  };
  if (!hasOwnProperty(config, 'description')) {
    const description = getDescription(namedDefinition.definition);
    if (description) {
      config.description = description;
    }
  }
  return new GraphQLScalarType(config);
}

export function generateScalar(type: Type): Option<GraphQLNamedType> {
  return type.definitions.reduce(
    (acc, typeDefinition) =>
      acc.or(
        () =>
          typeDefinition.definition
            .filter(namedDefinition => namedDefinition.definition.kind === 'ScalarTypeDefinition')
            .map(d => generateScalarFromNamedDefinition(d, typeDefinition.module))
      ),
    none
  );
}
