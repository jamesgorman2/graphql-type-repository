// @flow

import { AssertionError } from './AssertionError';
import { errorInModules } from './errorInModules';

import { FlattenedTypeGraph } from '../../graph';

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
