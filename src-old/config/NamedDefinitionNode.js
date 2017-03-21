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
  TypeConfig,
} from './types';

export class NamedDefinitionNode<T: TypeDefinitionNode | DirectiveDefinitionNode> {
  name: string;
  definition: T;
  config: Option<TypeConfig>;

  constructor(
    name: string,
    definition: T,
    config: Option<TypeConfig> = none,
  ): void {
    this.name = name;
    this.definition = definition;
    this.config = config;
  }
}
