// @flow

import {
  flatMap,
  hasOwnProperty,
} from '../../util';

import { Module } from '../../config';

import {
  Type,
} from '../../graph';

export function extractFieldsAndModules(type: Type): { [fieldName: string]: Module[] } {
  return flatMap(
    type.definitions,
    definition => (
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
