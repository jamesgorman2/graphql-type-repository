// @flow

import {
  FlattenedTypeGraph,
} from '../../graph';

import {
  flatMap,
} from '../../util';

import {
  NestedAssertionError,
} from './NestedAssertionError';
import {
  errorInModules,
} from './errorInModules';

export function assertNoModuleErrors(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return flatMap(
    graphIn.moduleRepositories,
    moduleRepository => moduleRepository.modules
  )
    .reduce(
      (graph, module) =>
        graph.withErrors(
          module.errors.map(error => new NestedAssertionError(errorInModules('Error', [module]), error))
        ),
      graphIn
    );
}
