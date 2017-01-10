// @flow

import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import type {
  Module,
  NamedDefinitionNode,
} from '../../config';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

import {
  Option,
  flatMap,
  hasOwnProperty,
} from '../../util';

import {
  AssertionError,
} from './AssertionError';

function assertMissingResolversForDefinition(
  definition: NamedDefinitionNode<any>,
  module: Module,
  label: string
): AssertionError[] {
  if (definition.definition.kind !== 'ObjectTypeDefinition') {
    return [new AssertionError(`Unexpected type ${definition.definition.kind} for ${label} in module ${module.name}. Expected an ObjectTypeDefinition.`)];
  }
  const objectTypeDefinition: ObjectTypeDefinitionNode = definition.definition;
  return objectTypeDefinition.fields
    .map(field => field.name.value)
    .filter(
      field =>
        !(
          definition.config
            .map(
              configs =>
                hasOwnProperty(configs, 'fields') &&
                // flow-disable-next-line
                hasOwnProperty(configs.fields, field)
            )
            .getOrElse(false)
        )
    )
    .map(field => new AssertionError(`Missing config for ${label}.${field} in module ${module.name}.`));
}

function assertMissingResolvers(type: Option<Type>, label: string): AssertionError[] {
  return type.map(
    t =>
      flatMap(
        t.definitions,
        typeDefinition => (
          typeDefinition.definition
            .map(d => assertMissingResolversForDefinition(d, typeDefinition.module, label))
            .getOrElse(
              [new AssertionError(`Missing definition for ${label} in module ${typeDefinition.module.name}.`)]
            )
        )
      )
        .concat(
          flatMap(
            t.extensions,
            extension =>
              assertMissingResolversForDefinition(extension.definition, extension.module, label)
          )
        )
  )
   .getOrElse([]);
}

export function assertNoMissingSchemaResolvers(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return assertMissingResolvers(graphIn.schema.query, 'schema.query')
    .concat(assertMissingResolvers(graphIn.schema.mutation, 'schema.mutation'))
    .concat(assertMissingResolvers(graphIn.schema.subscription, 'schema.subscription'))
    .reduce(
      (graph, error) => graph.withError(error),
      graphIn
    );
}
