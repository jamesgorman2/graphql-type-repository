// @flow

import type {
  GraphQLNamedType,
  TypeDefinitionNode,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../config';

import {
  Option,
  some,
  none,
} from '../util';

export class TypeDefinition {
  module: Module;
  definition: Option<NamedDefinitionNode<TypeDefinitionNode>>;
  type: Option<GraphQLNamedType>;

  constructor(
    module: Module,
    definition: Option<NamedDefinitionNode<TypeDefinitionNode>> = none,
    type: Option<GraphQLNamedType> = none,
  ): void {
    this.module = module;
    this.definition = definition;
    this.type = type;
  }

  withType: (type: GraphQLNamedType) => TypeDefinition =
    type => new TypeDefinition(this.module, this.definition, some(type));

  withDefinition: (definition: NamedDefinitionNode<TypeDefinitionNode>) => TypeDefinition =
    definition => new TypeDefinition(this.module, some(definition), this.type);
}
