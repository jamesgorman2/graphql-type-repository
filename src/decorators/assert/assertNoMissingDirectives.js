// @flow

import {
  Directive,
  FlattenedTypeGraph,
  Schema,
  Type,
 } from '../../graph';

import { AssertionError } from './AssertionError';
import { inModules } from './errorInModules';

function notDefined(directive: Directive): boolean {
  return !directive.directive && directive.definitions.length === 0;
}

function findSchemaTypes(directiveName: string, schemaType: ?Type, label: string): string[] {
  return schemaType ?
    [schemaType]
      .filter(referrant => referrant && referrant.directiveRefs.keys().includes(directiveName))
      .map(referrant => `${label} ${inModules(referrant.directiveRefs.get(directiveName).asArray())}`) :
    [];
}

function findReferrants(
  directiveName: string,
  allTypes: Type[],
  schema: Schema
): AssertionError {
  return new AssertionError(
    `Undefined directive ${directiveName} referenced from ${
      allTypes
        .filter(referrant => referrant.directiveRefs.keys().includes(directiveName))
        .reduce(
          (acc, referrant) =>
            acc.concat(
              `type ${referrant.name} ${inModules(referrant.directiveRefs.get(directiveName).asArray())}`
            ),
          []
        )
        .concat(
          schema.directiveRefs.keys().includes(directiveName) ?
            `schema ${inModules(schema.directiveRefs.get(directiveName).asArray())}` :
            []
        )
        .concat(findSchemaTypes(directiveName, schema.query, 'schema.query'))
        .concat(findSchemaTypes(directiveName, schema.mutation, 'schema.mutation'))
        .concat(findSchemaTypes(directiveName, schema.subscription, 'schema.subscription'))
        .join(', ')
    }.`
  );
}

export function assertNoMissingDirectives(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.directives.values()
    .filter(notDefined)
    .map(directive => findReferrants(directive.name, graphIn.types.values(), graphIn.schema))
    .reduce(
      (graph, error) => graph.withError(error),
      graphIn
    );
}
