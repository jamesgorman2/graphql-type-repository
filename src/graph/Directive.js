// @flow

import type {
  GraphQLDirective,
} from 'graphql';

import {
  Appendable,
  Option,
  some,
  none,
} from '../util';
import { DirectiveDefinition } from './DirectiveDefinition';

export class Directive extends Appendable<Directive> {
  name: string;
  definitions: DirectiveDefinition[];
  directive: Option<GraphQLDirective>;
  isSystem: boolean;

  constructor(
    name: string,
    definitions: DirectiveDefinition[] = [],
    directive: Option<GraphQLDirective> = none,
    isSystem: boolean = false,
  ): void {
    super();
    this.name = name;
    this.definitions = definitions;
    this.directive = directive;
    this.isSystem = isSystem;
  }

  append: (other: Directive) => Directive =
    other =>
      new Directive(
        this.name,
        [...this.definitions, ...other.definitions],
        this.directive.or(other.directive),
        this.isSystem || other.isSystem
      );

  setIsSystem: (newIsSystem: ?boolean) => Directive =
    newIsSystem =>
      new Directive(
        this.name,
        this.definitions,
        this.directive,
        newIsSystem === undefined || newIsSystem === null ? true : newIsSystem
      );

  withDefinition: (directive: DirectiveDefinition) => Directive =
    directive =>
      new Directive(
        this.name,
        [...this.definitions, directive],
        this.directive,
        this.isSystem
      );

  withDirective: (directive: GraphQLDirective) => Directive =
    directive =>
      new Directive(
        this.name,
        this.definitions,
        some(directive),
        this.isSystem
      );
}
