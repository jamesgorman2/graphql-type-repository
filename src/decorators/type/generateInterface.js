// @flow

import {
  GraphQLInterfaceType,
} from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLNamedType,
  GraphQLInterfaceTypeConfig,
  InterfaceTypeDefinitionNode,
  Thunk,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';
import type {
  FieldConfig,
  InterfaceConfig,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Option,
} from '../../util';

import {
  getDescription,
} from './getDescription';
import {
  getOutputType,
} from './getOutputType';

function getFields(
  definition: InterfaceTypeDefinitionNode,
  configIn: Option<FieldConfig>,
  referringTypeName: string,
  typeMap: TypeMap,
  module: Module
): Thunk<GraphQLFieldConfigMap<*, *>> {
  const fieldSpecs = definition.fields
    .map(
      (node) => {
        const name = node.name.value;
        const getType = () => getOutputType(node.type, typeMap, referringTypeName, module);
        const description =
          getDescription(
            node,
            configIn.mapOrNone(c => c[name]).mapOrNone(c => c.description),
            'interface field',
            `${referringTypeName}.${name}`,
            module.name
          );

        return {
          name,
          getType,
          description,
        };
      }
    );

  return () =>
    fieldSpecs
      .map(
        (spec) => {
          const type = spec.getType();
          const config: GraphQLFieldConfig<*, *> = { type };
          spec.description.forEach((d) => { config.description = d; });
          return [spec.name, config];
        }
      )
      .reduce(
        (acc, [name, config]) => { // eslint-disable-line arrow-body-style
          return {
            ...acc,
            [name]: config,
          };
        },
        {}
      );
}

function generateInterfaceFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): GraphQLNamedType {
  const name = namedDefinition.name;
  const configIn: Option<InterfaceConfig> = (namedDefinition.config: any);
  const fields = getFields(
    namedDefinition.definition,
    configIn.mapOrNone(c => c.fields),
    name,
    typeMap,
    module
  );

  const config: GraphQLInterfaceTypeConfig<*, *> = {
    name,
    fields,
  };

  getDescription(
    namedDefinition.definition,
    configIn.mapOrNone(c => c.description),
    'interface',
    namedDefinition.name,
    module.name
  )
    .forEach((d) => { config.description = d; });

  configIn
    .mapOrNone(c => c.resolveType)
    .forEach((resolveType) => { config.resolveType = resolveType; });

  return new GraphQLInterfaceType(config);
}

export const generateInterface = ['InterfaceTypeDefinition', generateInterfaceFromNamedDefinition];
