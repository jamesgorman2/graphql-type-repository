// @flow

import { Appendable } from '../util';
import { DirectiveDefinition } from './DirectiveDefinition';

export class Directive extends Appendable<Directive> {
  name: string;
  definitions: DirectiveDefinition[];
  isSystem: boolean;

  constructor(
    name: string,
    definitions: DirectiveDefinition[] = [],
    isSystem: boolean = false,
  ) {
    super();
    this.name = name;
    this.definitions = definitions;
    this.isSystem = isSystem;
  }

  withDefinition: (directive: DirectiveDefinition) => Directive =
    directive =>
      new Directive(
        this.name,
        [...this.definitions, directive],
        this.isSystem,
      );
}
