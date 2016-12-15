// @flow

import { flatMap } from '../../util';

import { FlattenedTypeGraph } from '../../graph';

import { errorInModules } from './errorInModules';
import { NestedAssertionError } from './NestedAssertionError';

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
