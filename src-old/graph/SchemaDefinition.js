// @flow

import type {
  SchemaDefinitionNode,
} from 'graphql';

import {
  Module,
} from '../config';

export class SchemaDefinition {
  module: Module;
  definition: SchemaDefinitionNode;

  constructor(
    module: Module,
    definition: SchemaDefinitionNode,
  ): void {
    this.module = module;
    this.definition = definition;
  }
}
