// @flow

import {
  Appendable,
  AppendableList,
  AppendableMap,
} from '../util';

import { Module } from '../config';

import { SchemaDefinition } from './SchemaDefinition';

import { Type } from './Type';

function maybeAppendTypes(t1: ?Type, t2: ?Type): ?Type {
  if (t1 && t2) {
    return t1.append(t2);
  }
  return t1 || t2;
}

export class Schema extends Appendable<Schema> {
  query: ?Type;
  mutation: ?Type;
  subscription: ?Type;
  directiveRefs: AppendableMap<AppendableList<Module>>;
  definitions: SchemaDefinition[];

  constructor(
    query: ?Type,
    mutation: ?Type,
    subscription: ?Type,
    directiveRefs: AppendableMap<AppendableList<Module>> = new AppendableMap(),
    definitions: SchemaDefinition[] = [],
  ) {
    super();
    this.query = query;
    this.mutation = mutation;
    this.subscription = subscription;
    this.directiveRefs = directiveRefs;
    this.definitions = definitions;
  }

  withQuery: (query: Type) => Schema =
    query =>
      new Schema(query, this.mutation, this.subscription, this.directiveRefs, this.definitions)

  withMutation: (mutation: Type) => Schema =
    mutation =>
      new Schema(this.query, mutation, this.subscription, this.directiveRefs, this.definitions);

  withSubscription: (subscription: Type) => Schema =
    subscription =>
      new Schema(this.query, this.mutation, subscription, this.directiveRefs, this.definitions);

  withDefinition: (definition: SchemaDefinition) => Schema =
    definition =>
      new Schema(
        this.query,
        this.mutation,
        this.subscription,
        this.directiveRefs,
        [...this.definitions, definition],
      );

  withDirectiveRef: (directive: string, module: Module) => Schema =
    (directive, module) =>
      new Schema(
        this.query,
        this.mutation,
        this.subscription,
        this.directiveRefs.put(directive, new AppendableList([module])),
        this.definitions
      );

  append: (other: Schema) => Schema =
    other =>
      new Schema(
        maybeAppendTypes(this.query, other.query),
        maybeAppendTypes(this.mutation, other.mutation),
        maybeAppendTypes(this.subscription, other.subscription),
        this.directiveRefs.append(other.directiveRefs),
        [...this.definitions, ...other.definitions],
      );
}
