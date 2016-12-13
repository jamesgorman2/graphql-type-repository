// @flow

import type {
  DirectiveDefinitionNode,
  GraphQLDirective,
} from 'graphql';

import {
  Module,
  NamedDefinitionNode,
} from '../config';

export class DirectiveDefinition {
  module: Module;
  definition: ?NamedDefinitionNode<DirectiveDefinitionNode>;
  directive: ?GraphQLDirective;

  constructor(
    module: Module,
    definition: ?NamedDefinitionNode<DirectiveDefinitionNode> = null,
    directive: ?GraphQLDirective = null,
  ) {
    this.module = module;
    this.definition = definition;
    this.directive = directive;
  }

  withDirective: (type: GraphQLDirective) => DirectiveDefinition =
    directive => new DirectiveDefinition(this.module, this.definition, directive);

  withDefinition: (
    definition: NamedDefinitionNode<DirectiveDefinitionNode>
  ) => DirectiveDefinition =
    definition => new DirectiveDefinition(this.module, definition, this.directive);
}
