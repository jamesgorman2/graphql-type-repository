// @flow

import {
  valueFromAST,
} from 'graphql';
import type {
  InputValueDefinitionNode,
  GraphQLArgumentConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  Thunk,
} from 'graphql';

import {
  Module,
} from '../../config';
import type {
  ArgumentConfig,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Option,
  Try,
  someOrNone,
} from '../../util';

import {
  GraphQLTypeError,
} from './GraphQLTypeError';
import {
  getDescriptionObject,
} from './getDescription';
import {
  getInputType,
} from './getInputType';


function makeArgument(
  argumentNode: InputValueDefinitionNode,
  configIn: Option<ArgumentConfig>,
  referringType: string,
  referringFieldName: string,
  referringTypeName: string,
  typeMap: TypeMap,
  module: Module
) {
  const name = argumentNode.name.value;
  const getType = () => getInputType(argumentNode.type, typeMap, referringTypeName, module);

  const configInForValue = configIn
    .mapOrNone(c => c[name]);

  const description = getDescriptionObject(
    argumentNode,
    configInForValue.mapOrNone(c => c.description),
    `${referringType} argument`,
    `${referringTypeName}.${name}.${referringFieldName}`,
    module.name
  );
  const defaultValue = // TODO also from config
    (type: GraphQLInputType) =>
      someOrNone(argumentNode.defaultValue).map(
        (v) => {
          const value = valueFromAST(v, type);
          if (value === undefined) {
            throw new GraphQLTypeError(
              `Invalid default value in argument for ${referringType} ${referringTypeName}.${name}.${referringFieldName} in module ${module.name}.`
            );
          }
          return value;
        }
      )
        .map(d => ({ defaultValue: d }))
        .getOrElse({});

  return description.map(
    d => ({
      name,
      getType,
      defaultValue,
      description: d,
    })
  );
}

export function makeArguments(
  argumentNodes: InputValueDefinitionNode[],
  configIn: Option<ArgumentConfig>,
  referringType: string,
  referringFieldName: string,
  referringTypeName: string,
  typeMap: TypeMap,
  module: Module
): Try<Thunk<GraphQLFieldConfigArgumentMap>> {
  const argumentSpecs = argumentNodes.map(
    argumentNode =>
      makeArgument(
        argumentNode,
        configIn,
        referringType,
        referringFieldName,
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

  return argumentSpecs.map(
    as =>
      () =>
        as.map(
          (spec) => {
            const type = spec.getType();
            const config: GraphQLArgumentConfig = {
              type,
              ...spec.defaultValue,
              ...spec.description,
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
