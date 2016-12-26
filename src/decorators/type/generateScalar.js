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
import { TypeMap } from '../../graph';

import { getDescription } from './getDescription';
import { GraphQLTypeError } from './GraphQLTypeError';

export function generateScalarFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): GraphQLNamedType {
  namedDefinition.config.ifNone(
    () => {
      throw new GraphQLTypeError(
        `Scalar ${namedDefinition.name} missing required configs in module ${module.name}.`
      );
    }
  );
  const configIn: ScalarConfig<*, *> = (namedDefinition.config.get(): any);

  if (!configIn.serialize) {
    throw new GraphQLTypeError(
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

  getDescription(
    namedDefinition.definition,
    someOrNone(configIn.description),
    'scalar',
    namedDefinition.name,
    module.name
  )
    .forEach((d) => { config.description = d; });

  return new GraphQLScalarType(config);
}

export const generateScalar = ['ScalarTypeDefinition', generateScalarFromNamedDefinition];
