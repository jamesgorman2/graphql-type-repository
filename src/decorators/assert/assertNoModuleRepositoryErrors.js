// @flow

import {
  FlattenedTypeGraph,
} from '../../graph';

export function assertNoModuleRepositoryErrors(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.moduleRepositories
    .reduce(
      (graph, repository) => graph.withErrors(repository.errors),
      graphIn
    );
}
