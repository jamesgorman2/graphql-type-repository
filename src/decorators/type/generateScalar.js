// @flow

import {
  GraphQLScalarType,
} from 'graphql';

import type {
  GraphQLNamedType,
  GraphQLScalarTypeConfig,
} from 'graphql';

import {
  someOrNone,
} from '../../util';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import type {
  ScalarConfig,
} from '../../config';

import { getDescription } from './getDescription';
import { TypeError } from './TypeError';

export function generateScalarFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  module: Module
): GraphQLNamedType {
  namedDefinition.config.ifNone(
    () => {
      throw new TypeError(
        `Scalar ${namedDefinition.name} missing required configs in module ${module.name}.`
      );
    }
  );
  const configIn: ScalarConfig<*, *> = (namedDefinition.config.get(): any);

  if (!configIn.serialize) {
    throw new TypeError(
      `Scalar ${namedDefinition.name} missing required config parameter serialize in module ${module.name}.`
    );
  }

  const config: GraphQLScalarTypeConfig<*, *> = {
    name: namedDefinition.name,
    serialize: configIn.serialize,
  };

  if (configIn.parseValue) {
    config.parseValue = configIn.parseValue;
  }
  if (configIn.parseLiteral) {
    config.parseLiteral = configIn.parseLiteral;
  }

  const descriptionFromSchema = getDescription(namedDefinition.definition);
  const descriptionFromConfig = someOrNone(configIn.description);
  descriptionFromSchema.xor(
    descriptionFromConfig,
    () =>
      new TypeError(
        `Description for scalar ${namedDefinition.name} supplied in both schema and config in module ${module.name}. It must only be supplied in one of these.`
      )
  )
    .forEach((d) => { config.description = d; });

  return new GraphQLScalarType(config);
}

export const generateScalar = ['ScalarTypeDefinition', generateScalarFromNamedDefinition];
