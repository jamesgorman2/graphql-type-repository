// @flow

import { entries } from '../../util';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

import { AssertionError } from './AssertionError';
import { errorInModules } from './errorInModules';
import { extractFieldsAndModules } from './extractFieldsAndModules';

function typeToExtensionFieldErrors(type: Type): Error[] {
  return entries(extractFieldsAndModules(type))
    .filter(([, modules]) => modules.length > 1)
    .map(
      ([fieldName, modules]) =>
        new AssertionError(
          errorInModules(
            `Field ${type.name}.${fieldName} declared more than once`,
            modules
          )
        )
    );
}

export function assertNoDuplicateExtensionFields(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .map(typeToExtensionFieldErrors)
    .filter(errors => errors.length > 0)
    .reduce(
      (graph, error) => graph.withErrors(error),
      graphIn
    );
}
