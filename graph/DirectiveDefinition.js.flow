// @flow

import type {
  DirectiveDefinitionNode,
  GraphQLDirective,
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

export class DirectiveDefinition {
  module: Module;
  definition: Option<NamedDefinitionNode<DirectiveDefinitionNode>>;
  directive: Option<GraphQLDirective>;

  constructor(
    module: Module,
    definition: Option<NamedDefinitionNode<DirectiveDefinitionNode>> = none,
    directive: Option<GraphQLDirective> = none,
  ): void {
    this.module = module;
    this.definition = definition;
    this.directive = directive;
  }

  withDirective: (type: GraphQLDirective) => DirectiveDefinition =
    directive =>
      new DirectiveDefinition(this.module, this.definition, some(directive));

  withDefinition: (
    definition: NamedDefinitionNode<DirectiveDefinitionNode>
  ) => DirectiveDefinition =
    definition =>
      new DirectiveDefinition(this.module, some(definition), this.directive);
}
