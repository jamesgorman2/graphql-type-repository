// @flow

import type {
  TypeResolverConfig,
} from './types';

export class NamedDefinitionNode<T> {
  name: string;
  definition: T;
  resolvers: ?TypeResolverConfig;

  constructor(
    name: string,
    definition: T,
    resolvers: ?TypeResolverConfig,
  ) {
    this.name = name;
    this.definition = definition;
    this.resolvers = resolvers;
  }
}
