// @flow

import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../config';

export class ExtensionDefinition {
  module: Module;
  definition: NamedDefinitionNode<ObjectTypeDefinitionNode>;

  constructor(
    module: Module,
    definition: NamedDefinitionNode<ObjectTypeDefinitionNode>,
  ): void {
    this.module = module;
    this.definition = definition;
  }
}
