// @flow
import {
  GraphQLObjectType,
  GraphQLUnionType,
} from 'graphql';
import type {
  GraphQLNamedType,
} from 'graphql';

import { Module } from '../config';
import {
  Option,
  someOrNone,
} from '../util';

import { FlattenedTypeGraph } from './FlattenedTypeGraph';

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

  getObjectType: (name: string, referringTypeName?: string, module?: Module) => GraphQLObjectType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!(type instanceof GraphQLObjectType)) {
        throw new Error(`Type ${name} not a GraphQLObjectType${getErrorReferrence(someOrNone(referringTypeName), someOrNone(module))}.`);
      }
      return type;
    }

  getUnionType: (name: string, referringTypeName?: string, module?: Module) => GraphQLUnionType =
    (name, referringTypeName, module) => {
      const type = this.getType(name, referringTypeName, module);
      if (!(type instanceof GraphQLUnionType)) {
        throw new Error(`Type ${name} not a GraphQLUnionType${getErrorReferrence(someOrNone(referringTypeName), someOrNone(module))}.`);
      }
      return type;
    }
}
