// @flow

import { AssertionError } from './AssertionError';
import { errorInModules } from './errorInModules';

import {
  flatMap,
  hasOwnProperty,
} from '../../util';

import { Module } from '../../config';

import {
  FlattenedTypeGraph,
  Type,
} from '../../graph';

function extractFieldsAndModules(type: Type): { [fieldName: string]: Module[] } {
  return flatMap(
    type.definitions,
    definition =>
      (
        definition.definition &&
        definition.definition.definition &&
        definition.definition.definition.kind === 'ObjectTypeDefinition' ?
          definition.definition.definition.fields
            .map(
              field =>
                [field.name.value, definition.module]
            ) :
          []
      )
  )
    .concat(
      flatMap(
        type.extensions,
        extension =>
          extension.definition.definition.fields
            .map(
              field =>
                [field.name.value, extension.module]
            )
      )
    )
    .reduce(
      (acc, [fieldName, module]) => {
        if (hasOwnProperty(acc, fieldName)) {
          acc[fieldName].push(module);
        } else {
          acc[fieldName] = [module]; // eslint-disable-line no-param-reassign
        }
        return acc;
      },
      {}
    );
}

function typeToExtensionFieldErrors(type: Type): Error[] {
  const fields = extractFieldsAndModules(type);
  return Object.keys(fields)
    .filter(fieldName => fields[fieldName].length > 1)
    .map(
      fieldName =>
        new AssertionError(
          errorInModules(
            `Field ${type.name}.${fieldName} declared more than once`,
            fields[fieldName]
          )
        )
    );
}

export function assertNoDuplicateExtensionFields(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return graphIn.types.values()
    .map(typeToExtensionFieldErrors)
    .filter(errors => errors.length > 0)
    .reduce(
      (graph, error) => graph.withErrors(error),
      graphIn
    );
}
