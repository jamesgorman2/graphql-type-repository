// @flow
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  getNamedType,
  isInputType,
} from 'graphql';
import type {
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLOutputType,
  GraphQLType,
} from 'graphql';

import {
  Module,
} from '../config';

import {
  Option,
  someOrNone,
} from '../util';

import {
  FlattenedTypeGraph,
} from './FlattenedTypeGraph';

function isOutputType(type: ?GraphQLType): boolean {
  const namedType = getNamedType(type);
  return (
    namedType instanceof GraphQLScalarType ||
    namedType instanceof GraphQLObjectType ||
    namedType instanceof GraphQLInterfaceType ||
    namedType instanceof GraphQLUnionType ||
    namedType instanceof GraphQLEnumType
  );
}

function isNamedType(type: ?GraphQLType): boolean {
  return (
    type instanceof GraphQLScalarType ||
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLInterfaceType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLEnumType ||
    type instanceof GraphQLInputObjectType
  );
}

function getErrorReferrence(referringTypeName: Option<string>, module: Option<Module>): string {
  return referringTypeName
    .map(n => ` for type ${n}`)
    .orSome('')
    .flatMap(
      s =>
        module.map(m => m.name)
          .map(n => `${s} in module ${n}`)
    )
    .getOrElse('');
}

function errorInstanceOf(
  type: GraphQLNamedType,
  expected: string,
  referringTypeName?: string,
  module?: Module
): Error {
  return new Error(`Type ${type.name} not a ${expected}${getErrorReferrence(someOrNone(referringTypeName), someOrNone(module))}.`);
}

export class TypeMap {
  graph: FlattenedTypeGraph;

  getType: (name: string, referringTypeName?: string, module?: Module) => GraphQLNamedType =
    (name, referringTypeName, module) => {
      const type = this.graph.types.get(name)
        .flatMap(t => t.type);
      type.ifNone(() => {
        throw new Error(`Type ${name} not found${getErrorReferrence(someOrNone(referringTypeName), someOrNone(module))}.`);
      });
      return type.get();
    };

  getInutType: (name: string, referringTypeName?: string, module?: Module) => GraphQLInputType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!isInputType(type)) {
        throw errorInstanceOf(type, 'GraphQLInputType', referringTypeName, module);
      }
      return (type: any);
    }

  getInterfaceType: (
    name: string,
    referringTypeName?: string,
    module?: Module
  ) => GraphQLInterfaceType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!(type instanceof GraphQLInterfaceType)) {
        throw errorInstanceOf(type, 'GraphQLInterfaceType', referringTypeName, module);
      }
      return type;
    }

  getNamedType: (name: string, referringTypeName?: string, module?: Module) => GraphQLNamedType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!isNamedType(type)) {
        throw errorInstanceOf(type, 'GraphQLNamedType', referringTypeName, module);
      }
      return type;
    }

  getObjectType: (name: string, referringTypeName?: string, module?: Module) => GraphQLObjectType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!(type instanceof GraphQLObjectType)) {
        throw errorInstanceOf(type, 'GraphQLObjectType', referringTypeName, module);
      }
      return type;
    }

  getOutputType: (name: string, referringTypeName?: string, module?: Module) => GraphQLOutputType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!isOutputType(type)) {
        throw errorInstanceOf(type, 'GraphQLOutputType', referringTypeName, module);
      }
      return (type: any);
    }

  getUnionType: (name: string, referringTypeName?: string, module?: Module) => GraphQLUnionType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!(type instanceof GraphQLUnionType)) {
        throw errorInstanceOf(type, 'GraphQLUnionType', referringTypeName, module);
      }
      return type;
    }
}
