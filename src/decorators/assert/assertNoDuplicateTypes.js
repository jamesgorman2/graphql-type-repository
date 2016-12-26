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

export function assertNoDuplicateTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .filter(type => type.definitions.length > 1)
    .reduce(
      (graph, type) =>
        graph.withError(
          new AssertionError(
            errorInModules(
              `Type ${type.name} declared more than once`,
              type.definitions.map(d => d.module)
            )
          )
        ),
      graphIn
    );
}
