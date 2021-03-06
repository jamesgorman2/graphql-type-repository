// @flow

import {
  FlattenedTypeGraph,
} from '../../graph';

import {
  AssertionError,
} from './AssertionError';
import {
  errorInModules,
} from './errorInModules';

/**
 * Assert that no Types flagged as system types also
 * have user definitions. This include both raw and
 * schema-defined types.
 */
export function assertNoSystemTypesDefinedByUser(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .filter(t => t.isSystem)
    .reduce(
      (graph, type) => {
        const errors = [];
        if (type.definitions.length > 0) {
          errors.push(
            new AssertionError(
              errorInModules(
                `System type ${type.name} cannot be defined by user`,
                type.definitions.map(d => d.module),
              )
            )
          );
        }
        if (type.extensions.length > 0) {
          errors.push(
            new AssertionError(
              errorInModules(
                `System type ${type.name} cannot be extended by user`,
                type.definitions.map(d => d.module),
              )
            )
          );
        }
        return graph.withErrors(errors);
      },
      graphIn,
    );
}
