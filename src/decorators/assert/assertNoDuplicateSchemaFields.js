// @flow

import {
  Option,
  entries,
} from '../../util';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

import { AssertionError } from './AssertionError';
import { errorInModules } from './errorInModules';
import { extractFieldsAndModules } from './extractFieldsAndModules';

function typeToExtensionFieldErrors(type: Option<Type>, label: string): Error[] {
  return type.map(t => entries(extractFieldsAndModules(t))).getOrElse([])
    .filter(([, modules]) => modules.length > 1)
    .map(
      ([fieldName, modules]) =>
        new AssertionError(
          errorInModules(
            `Field ${label}.${fieldName} declared more than once`,
            modules
          )
        )
    );
}

export function assertNoDuplicateSchemaFields(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return typeToExtensionFieldErrors(graphIn.schema.query, 'schema.query')
    .concat(typeToExtensionFieldErrors(graphIn.schema.mutation, 'schema.mutation'))
    .concat(typeToExtensionFieldErrors(graphIn.schema.subscription, 'schema.subscription'))
    .reduce(
      (graph, error) => graph.withError(error),
      graphIn
    );
}
