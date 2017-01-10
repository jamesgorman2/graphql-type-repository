// @flow

import type {
  FieldDefinitionNode,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  Thunk,
} from 'graphql';

import {
  Module,
} from '../../config';
import type {
  FieldConfig,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Option,
  Try,
  resolveThunk,
  someOrNone,
} from '../../util';

import {
  getDeprecationReasonObject,
} from './getDeprecationReason';
import {
  getDescriptionObject,
} from './getDescription';
import {
  getOutputType,
} from './getOutputType';
import {
  makeArguments,
} from './makeArguments';

function makeFieldSpec(
  fieldNode: FieldDefinitionNode,
  configIn: Option<FieldConfig>,
  referringType: string,
  referringTypeName: string,
  typeMap: TypeMap,
  module: Module
) {
  const name = fieldNode.name.value;
  const getType = () => getOutputType(fieldNode.type, typeMap, referringTypeName, module);

  const configInForValue = configIn
    .mapOrNone(c => c[name]);

  const description = getDescriptionObject(
    fieldNode,
    configInForValue.mapOrNone(c => c.description),
    `${referringType} field`,
    `${referringTypeName}.${name}`,
    module.name
  );
  const deprecationReason = getDeprecationReasonObject(
    someOrNone(fieldNode.directives),
    configInForValue.mapOrNone(c => c.deprecationReason),
    `${referringType} field`,
    `${referringTypeName}.${name}`,
    module.name
  );
  const getArgs = someOrNone(fieldNode.arguments)
    .map(
      argumentsNode =>
        makeArguments(
          argumentsNode,
          configInForValue.mapOrNone(c => c.arguments),
          referringType,
          name,
          referringTypeName,
          typeMap,
          module
        )
    )
    .getOrElse(
      Try.success({})
    );

  return description.map(
    d => ({
      name,
      getType,
      description: d,
    })
  )
    .mergeWith(
      deprecationReason,
      (c, d) => ({ ...c, deprecationReason: d })
    )
    .mergeWith(
      getArgs,
      (c, a) => ({ ...c, getArgs: a })
    );
}

export function makeFields(
  fieldNodes: FieldDefinitionNode[],
  configIn: Option<FieldConfig>,
  referringType: string,
  referringTypeName: string,
  typeMap: TypeMap,
  module: Module
): Try<Thunk<GraphQLFieldConfigMap<*, *>>> {
  const fieldSpecs = fieldNodes.map(
    fieldNode =>
      makeFieldSpec(
        fieldNode,
        configIn,
        referringType,
        referringTypeName,
        typeMap,
        module
      )
  )
    .reduce(
      (acc, trySpec) =>
        acc.mergeWith(
          trySpec,
          (previousSpecs, spec) => [...previousSpecs, spec]
        ),
      Try.of([])
    );

  return fieldSpecs.map(
    fs =>
      () =>
        fs.map(
          (spec) => {
            const type = spec.getType();
            const args = resolveThunk(spec.getArgs);
            const config: GraphQLFieldConfig<*, *> = {
              type,
              ...args,
              ...spec.description,
              ...spec.deprecationReason,
            };
            return [spec.name, config];
          }
        )
          .reduce(
            (acc, [name, config]) => ({
              ...acc,
              [name]: config,
            }),
            {}
          )
    );
}
