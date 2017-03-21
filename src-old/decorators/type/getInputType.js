// @flow

import {
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import type {
  GraphQLInputType,
  TypeNode,
} from 'graphql';

import {
  Module,
} from '../../config';

import {
  TypeMap,
} from '../../graph';

import {
  Option,
  none,
} from '../../util';

function getList(
  typeNode: TypeNode,
  typeMap: TypeMap,
  referringTypeName: string,
  module: Module
): Option<any> {
  if (typeNode.kind === 'ListType') {
    return getNonNull(typeNode.type, typeMap, referringTypeName, module)
      .orSome(() => getNamedInputType((typeNode: any).type, typeMap, referringTypeName, module))
      .map(inner => new GraphQLList(inner));
  }
  return none;
}

function getNonNull(
  typeNode: TypeNode,
  typeMap: TypeMap,
  referringTypeName: string,
  module: Module
): Option<any> {
  if (typeNode.kind === 'NonNullType') {
    return getList(typeNode.type, typeMap, referringTypeName, module)
      .orSome(() => getNamedInputType((typeNode: any).type, typeMap, referringTypeName, module))
      .map(inner => new GraphQLNonNull(inner));
  }
  return none;
}

function getNamedInputType(
  typeNode: TypeNode,
  typeMap: TypeMap,
  referringTypeName: string,
  module: Module
): GraphQLInputType {
  return typeMap.getInutType((typeNode: any).name.value, referringTypeName, module);
}


export function getInputType(
  typeNode: TypeNode,
  typeMap: TypeMap,
  referringTypeName: string,
  module: Module
): GraphQLInputType {
  const t: GraphQLInputType =
    getList(typeNode, typeMap, referringTypeName, module)
      .or(() => getNonNull(typeNode, typeMap, referringTypeName, module))
      .getOrElse(() => getNamedInputType(typeNode, typeMap, referringTypeName, module));
  return t;
}
