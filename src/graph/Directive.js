// @flow

import type {
  GraphQLDirective,
} from 'graphql';

import { Appendable } from '../util';
import { DirectiveDefinition } from './DirectiveDefinition';

export class Directive extends Appendable<Directive> {
  name: string;
  definitions: DirectiveDefinition[];
  directive: ?GraphQLDirective;
  isSystem: boolean;

  constructor(
    name: string,
    definitions: DirectiveDefinition[] = [],
    directive: ?GraphQLDirective = null,
    isSystem: boolean = false,
  ) {
    super();
    this.name = name;
    this.definitions = definitions;
    this.isSystem = isSystem;
  }

  setIsSystem: (newIsSystem: ?boolean) => Directive =
    newIsSystem =>
      new Directive(
        this.name,
        this.definitions,
        this.directive,
        newIsSystem === undefined || newIsSystem === null ? true : newIsSystem,
      );

  withDefinition: (directive: DirectiveDefinition) => Directive =
    directive =>
      new Directive(
        this.name,
        [...this.definitions, directive],
        this.directive,
        this.isSystem,
      );

  withDirective: (directive: GraphQLDirective) => Directive =
    directive =>
      new Directive(
        this.name,
        this.definitions,
        directive,
        this.isSystem,
      );
}
