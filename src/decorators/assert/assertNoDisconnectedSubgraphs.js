// @flow

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

import { AssertionError } from './AssertionError';
import { errorInModules } from './errorInModules';

function getRefs(type: ?Type): string[] {
  return type ? type.typeRefs.keys() : [];
}

export function assertNoDisconnectedSubgraphs(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  const reachableFromSchema: string[] = [];
  const typesToCheck: string[] =
    getRefs(graphIn.schema.query)
      .concat(getRefs(graphIn.schema.mutation))
      .concat(getRefs(graphIn.schema.subscription));

  if (typesToCheck.length === 0) {
    return graphIn;
  }

  while (typesToCheck.length > 0) {
    const t = typesToCheck.pop();
    if (!reachableFromSchema.includes(t)) {
      reachableFromSchema.push(t);
      typesToCheck.push(...getRefs(graphIn.types.get(t)));
    }
  }

  return graphIn.types.values()
    .filter(type => !reachableFromSchema.includes(type.name))
    .reduce(
      (graph, type) =>
        graph.withError(
          new AssertionError(
            errorInModules(
              `Type ${type.name} not reachable from schema`,
              type.definitions.map(definition => definition.module)
            )
          )
        ),
      graphIn
    );
}
