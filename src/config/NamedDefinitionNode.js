// @flow
import type {
  TypeDefinitionNode, // eslint-disable-line no-unused-vars
  DirectiveDefinitionNode, // eslint-disable-line no-unused-vars
} from 'graphql';

import {
  Option,
  none,
} from '../util';

import type {
  TypeResolverConfig,
} from './types';

export class NamedDefinitionNode<T: TypeDefinitionNode | DirectiveDefinitionNode> {
  name: string;
  definition: T;
  resolvers: Option<TypeResolverConfig>;

  constructor(
    name: string,
    definition: T,
    resolvers: Option<TypeResolverConfig> = none,
  ): void {
    this.name = name;
    this.definition = definition;
    this.resolvers = resolvers;
  }
}
