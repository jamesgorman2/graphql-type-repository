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

export function assertNoDuplicateDirectives(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.directives.values()
    .filter(directive => directive.definitions.length > 1)
    .reduce(
      (graph, directive) =>
        graph.withError(
          new AssertionError(
            errorInModules(
              `Directive @${directive.name} declared more than once`,
              directive.definitions.map(d => d.module)
            )
          )
        ),
      graphIn
    );
}
