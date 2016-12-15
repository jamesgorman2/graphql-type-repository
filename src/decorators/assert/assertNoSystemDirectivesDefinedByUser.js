// @flow

import {
  FlattenedTypeGraph,
} from '../../graph';

import { errorInModules } from './errorInModules';

/**
 * Assert that no Directives flagged as system directives also
 * have user definitions. This include both raw and
 * schema-defined directives.
 */
export function assertNoSystemDirectivesDefinedByUser(
  graphIn: FlattenedTypeGraph
): FlattenedTypeGraph {
  return graphIn.directives.values()
    .filter(d => d.isSystem)
    .reduce(
      (graph, directive) => {
        const errors = [];
        if (directive.definitions.length > 0) {
          errors.push(
            errorInModules(
              `System directive ${directive.name} cannot be defined by user`,
              directive.definitions.map(d => d.module),
            )
          );
        }
        return graph.withErrors(errors);
      },
      graphIn,
    );
}
