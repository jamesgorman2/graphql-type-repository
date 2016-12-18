// @flow

import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import {
  flatMap,
  hasOwnProperty,
} from '../../util';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

import type {
  Module,
  NamedDefinitionNode,
} from '../../config';

import { AssertionError } from './AssertionError';

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
          definition.resolvers &&
          hasOwnProperty(definition.resolvers, 'fields') &&
          // flow-disable-next-line
          hasOwnProperty(definition.resolvers.fields, field)
        )
    )
    .map(field => new AssertionError(`Missing resolver for ${label}.${field} in module ${module.name}.`));
}

function assertMissingResolvers(type: ?Type, label: string): AssertionError[] {
  return type ?
    flatMap(
      type.definitions,
      definition => (
        definition.definition ?
          assertMissingResolversForDefinition(definition.definition, definition.module, label) :
          [new AssertionError(`Missing definition for ${label} in module ${definition.module.name}.`)]
      )
    )
      .concat(
        flatMap(
          type.extensions,
          extension =>
            assertMissingResolversForDefinition(extension.definition, extension.module, label)
        )
      ) :
    [];
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
