// @flow

import {
  GraphQLInterfaceType,
} from 'graphql';
import type {
  GraphQLNamedType,
  GraphQLInterfaceTypeConfig,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';
import type {
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
  makeFields,
} from './makeFields';
import {
  getDescriptionObject,
} from './getDescription';

function makeInterfaceFromNamedDefinition(
  namedDefinition: NamedDefinitionNode<*>,
  typeMap: TypeMap,
  module: Module
): Try<GraphQLNamedType> {
  const name = namedDefinition.name;
  const configIn: Option<InterfaceConfig> = (namedDefinition.config: any);
  const fields = makeFields(
    namedDefinition.definition.fields,
    configIn.mapOrNone(c => c.fields),
    'interface',
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

export const makeInterface = ['InterfaceTypeDefinition', makeInterfaceFromNamedDefinition];
