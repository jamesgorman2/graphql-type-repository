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
  Try,
} from '../../util';

import {
  getDescription,
  getDescriptionObject,
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
): Try<Thunk<GraphQLFieldConfigMap<*, *>>> {
  const fieldSpecs = definition.fields
    .map(
      (node) => {
        const name = node.name.value;
        const getType = () => getOutputType(node.type, typeMap, referringTypeName, module);
        const description = getDescription(
          node,
          configIn.mapOrNone(c => c[name]).mapOrNone(c => c.description),
          'interface field',
          `${referringTypeName}.${name}`,
          module.name
        );

        return description.map(
          d => ({
            name,
            getType,
            description: d,
          })
        );
      }
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
        fs
          .map(
            (spec) => {
              const type = spec.getType();
              const config: GraphQLFieldConfig<*, *> = { type };
              spec.description.forEach((d) => { config.description = d; });
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

function generateInterfaceFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): Try<GraphQLNamedType> {
  const name = namedDefinition.name;
  const configIn: Option<InterfaceConfig> = (namedDefinition.config: any);
  const fields = getFields(
    namedDefinition.definition,
    configIn.mapOrNone(c => c.fields),
    name,
    typeMap,
    module
  );

  const description = getDescriptionObject(
    namedDefinition.definition,
    configIn.mapOrNone(c => c.description),
    'interface',
    namedDefinition.name,
    module.name
  );

  const config: Try<GraphQLInterfaceTypeConfig<*, *>> =
    fields.map(
      fs => ({
        name,
        fields: fs,
      })
    )
    .map(
      c => ({
        ...c,
        ...(
          configIn.mapOrNone(cIn => cIn.resolveType)
            .map(resolveType => ({ resolveType }))
            .getOrElse({})
        ),
      })
    )
    .mergeWith(
      description,
      (c, enumDescription) =>
        ({ ...c, ...enumDescription })
    );

  return config.map(c => new GraphQLInterfaceType(c));
}

export const generateInterface = ['InterfaceTypeDefinition', generateInterfaceFromNamedDefinition];
