// @flow

import {
  Option,
  none,
} from '../util';

import type {
  TypeResolverConfig,
} from './types';

export class NamedDefinitionNode<T> {
  name: string;
  definition: T;
  resolvers: Option<TypeResolverConfig>;

  constructor(
    name: string,
    definition: T,
    resolvers: Option<TypeResolverConfig> = none,
  ) {
    this.name = name;
    this.definition = definition;
    this.resolvers = resolvers;
  }
}
