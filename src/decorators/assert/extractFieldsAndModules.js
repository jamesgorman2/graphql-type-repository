// @flow

import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import {
  Module,
} from '../../config';

import {
  Type,
} from '../../graph';

import {
  flatMap,
  hasOwnProperty,
  someOrNone,
} from '../../util';

export function extractFieldsAndModules(type: Type): { [fieldName: string]: Module[] } {
  return flatMap(
    type.definitions,
    typeDefinition =>
      typeDefinition.definition
        .map(namedDefintionNode => namedDefintionNode.definition)
        .filter(d => d.kind === 'ObjectTypeDefinition')
        .map(d => ((d: any): ObjectTypeDefinitionNode))
        .flatMap(
          d =>
            someOrNone(d.fields)
              .map(
                fs =>
                  fs.map(field => [field.name.value, typeDefinition.module])
              )
        )
        .getOrElse([])
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
      ({}: {[key:string]: Module[]})
    );
}
