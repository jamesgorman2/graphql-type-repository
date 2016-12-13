// @flow

import type {
  GraphQLNamedType,
  TypeDefinitionNode,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../config';

export class TypeDefinition {
  module: Module;
  definition: ?NamedDefinitionNode<TypeDefinitionNode>;
  type: ?GraphQLNamedType;

  constructor(
    module: Module,
    definition: ?NamedDefinitionNode<TypeDefinitionNode> = null,
    type: ?GraphQLNamedType = null,
  ) {
    this.module = module;
    this.definition = definition;
    this.type = type;
  }

  withType: (type: GraphQLNamedType) => TypeDefinition =
    type => new TypeDefinition(this.module, this.definition, type);

  withDefinition: (definition: NamedDefinitionNode<TypeDefinitionNode>) => TypeDefinition =
    definition => new TypeDefinition(this.module, definition, this.type);
}
