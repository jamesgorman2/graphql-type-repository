// @flow

import {
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import type {
  GraphQLOutputType,
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
      .orSome(() => getNamedOutputType((typeNode: any).type, typeMap, referringTypeName, module))
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
      .orSome(() => getNamedOutputType((typeNode: any).type, typeMap, referringTypeName, module))
      .map(inner => new GraphQLNonNull(inner));
  }
  return none;
}

function getNamedOutputType(
  typeNode: TypeNode,
  typeMap: TypeMap,
  referringTypeName: string,
  module: Module
): GraphQLOutputType {
  return typeMap.getOutputType((typeNode: any).name.value, referringTypeName, module);
}


export function getOutputType(
  typeNode: TypeNode,
  typeMap: TypeMap,
  referringTypeName: string,
  module: Module
): GraphQLOutputType {
  const t: GraphQLOutputType =
    getList(typeNode, typeMap, referringTypeName, module)
      .or(() => getNonNull(typeNode, typeMap, referringTypeName, module))
      .getOrElse(() => getNamedOutputType(typeNode, typeMap, referringTypeName, module));
  return t;
}
