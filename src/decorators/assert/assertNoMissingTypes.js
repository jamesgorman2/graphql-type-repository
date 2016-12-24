// @flow

import {
  ExtensionDefinition,
  FlattenedTypeGraph,
  Schema,
  Type,
 } from '../../graph';

import { Option } from '../../util';

import { AssertionError } from './AssertionError';
import { inModules } from './errorInModules';

function notDefined(type: Type): boolean {
  return type.type.isNone() && type.definitions.length === 0;
}

function findSchemaTypes(typeName: string, schemaType: Option<Type>, label: string): string[] {
  return schemaType
      .filter(referrant => referrant.typeRefs.keys().includes(typeName))
      .map(
        referrant =>
          `${label} ${
            inModules(
              referrant.typeRefs.get(typeName)
                .map(ms => ms.toArray())
                .getOrElse([])
            )
          }`
      )
      .toArray();
}

function findErrorsFromReferents(
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
              `type ${referrant.name} ${
                inModules(
                  referrant.typeRefs.get(typeName)
                    .map(ms => ms.toArray())
                    .getOrElse([])
                )
              }`
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
    .map(
      type =>
        findErrorsFromReferents(type.name, type.extensions, graphIn.types.values(), graphIn.schema)
    )
    .reduce(
      (graph, error) => graph.withError(error),
      graphIn
    );
}
