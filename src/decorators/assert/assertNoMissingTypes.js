// @flow

import {
  FlattenedTypeGraph,
  Type,
 } from '../../graph';

import { AssertionError } from './AssertionError';
import { inModules } from './errorInModules';

function notDefined(type: Type): boolean {
  return !type.type && type.definitions.length === 0;
}

function findReferrants(typeName: string, allTypes: Type[]): AssertionError {
  return new AssertionError(
    `Undefined type ${typeName} referenced from ${
    allTypes
      .filter(referrant => referrant.typeRefs.keys().includes(typeName))
      .map(referrant => referrant)
      .reduce(
        (acc, referrant) =>
          acc.concat(
            `type ${referrant.name} ${inModules(referrant.typeRefs.get(typeName).asArray())}`
          ),
        []
      )
      .join(', ')
    }.`
  );
}

export function assertNoMissingTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .filter(notDefined)
    .map(type => type.name)
    .map(type => findReferrants(type, graphIn.types.values()))
    .reduce(
      (graph, error) => graph.withError(error),
      graphIn
    );
}
