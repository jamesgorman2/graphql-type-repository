// @flow

import {
  ExtensionDefinition,
  FlattenedTypeGraph,
  Schema,
  Type,
 } from '../../graph';

import { AssertionError } from './AssertionError';
import { inModules } from './errorInModules';

function notDefined(type: Type): boolean {
  return !type.type && type.definitions.length === 0;
}

function findSchemaTypes(typeName: string, schemaType: ?Type, label: string): string[] {
  return schemaType ?
    [schemaType]
      .filter(referrant => referrant && referrant.typeRefs.keys().includes(typeName))
      .map(referrant => `${label} ${inModules(referrant.typeRefs.get(typeName).asArray())}`) :
    [];
}

function findReferrants(
  typeName: string,
  extensions: ExtensionDefinition[],
  allTypes: Type[],
  schema: Schema
): AssertionError {
  return new AssertionError(
    `Undefined type ${typeName} referenced from ${
      allTypes
        .filter(referrant => referrant.typeRefs.keys().includes(typeName))
        .reduce(
          (acc, referrant) =>
            acc.concat(
              `type ${referrant.name} ${inModules(referrant.typeRefs.get(typeName).asArray())}`
            ),
          []
        )
        .concat(
          extensions.length ?
            [`extended ${inModules(extensions.map(e => e.module))}`] :
            []
        )
        .concat(findSchemaTypes(typeName, schema.query, 'schema.query'))
        .concat(findSchemaTypes(typeName, schema.mutation, 'schema.mutation'))
        .concat(findSchemaTypes(typeName, schema.subscription, 'schema.subscription'))
        .join(', ')
    }.`
  );
}

export function assertNoMissingTypes(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .filter(notDefined)
    .map(type => findReferrants(type.name, type.extensions, graphIn.types.values(), graphIn.schema))
    .reduce(
      (graph, error) => graph.withError(error),
      graphIn
    );
}
