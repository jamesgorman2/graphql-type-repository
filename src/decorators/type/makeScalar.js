// @flow

import {
  GraphQLScalarType,
} from 'graphql';
import type {
  GraphQLNamedType,
  GraphQLScalarTypeConfig,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';
import type {
  ScalarConfig,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Try,
  someOrNone,
} from '../../util';

import {
  GraphQLTypeError,
} from './GraphQLTypeError';
import {
  getDescriptionObject,
} from './getDescription';

function getConfigIn(
  namedDefinition: NamedDefinitionNode<*>,
  module: Module
): Try<ScalarConfig<*, *>> {
  if (namedDefinition.config.isNone()) {
    return Try.failure(
      new GraphQLTypeError(
        `Scalar ${namedDefinition.name} missing required configs in module ${module.name}.`
      )
    );
  }

  const configIn: ScalarConfig<*, *> = (namedDefinition.config.get(): any);
  if (!configIn.serialize) {
    return Try.failure(
      new GraphQLTypeError(
        `Scalar ${namedDefinition.name} missing required config parameter serialize in module ${module.name}.`
      )
    );
  }
  return Try.of(configIn);
}

export function makeScalarFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): Try<GraphQLNamedType> {
  const configIn = getConfigIn(namedDefinition, module);

  const description = configIn.flatMap(
    cIn =>
      getDescriptionObject(
        namedDefinition.definition,
        someOrNone(cIn.description),
        'scalar',
        namedDefinition.name,
        module.name
      )
  );

  const config: Try<GraphQLScalarTypeConfig<*, *>> = configIn.flatMap(
    cIn =>
      Try.success({
        name: namedDefinition.name,
        serialize: cIn.serialize,
      })
        .map(
          c => (
            cIn.parseValue ?
            { ...c, parseValue: cIn.parseValue } :
            c
          )
        )
        .map(
          c => (
            cIn.parseLiteral ?
            { ...c, parseLiteral: cIn.parseLiteral } :
            c
          )
        )
        .mergeWith(
          description,
          (c, enumDescription) =>
            ({ ...c, ...enumDescription })
        )
  );

  return config.map(c => new GraphQLScalarType(c));
}

export const makeScalar = ['ScalarTypeDefinition', makeScalarFromNamedDefinition];
