// @flow

import {
  Module,
} from '../config';

import {
  Appendable,
  AppendableList,
  AppendableMap,
  Option,
  some,
  none,
} from '../util';

import {
  SchemaDefinition,
} from './SchemaDefinition';
import {
  Type,
} from './Type';

function maybeAppendTypes(o1: Option<Type>, o2: Option<Type>): Option<Type> {
  return o1
    .flatMap(
      t1 =>
        o2.map(t2 => t1.append(t2))
          .orSome(t1)
    )
    .or(o2);
}

export class Schema extends Appendable<Schema> {
  query: Option<Type>;
  mutation: Option<Type>;
  subscription: Option<Type>;
  directiveRefs: AppendableMap<AppendableList<Module>>;
  definitions: SchemaDefinition[];

  constructor(
    query: Option<Type> = none,
    mutation: Option<Type> = none,
    subscription: Option<Type> = none,
    directiveRefs: AppendableMap<AppendableList<Module>> = new AppendableMap(),
    definitions: SchemaDefinition[] = [],
  ): void {
    super();
    this.query = query;
    this.mutation = mutation;
    this.subscription = subscription;
    this.directiveRefs = directiveRefs;
    this.definitions = definitions;
  }

  withQuery: (query: Type) => Schema =
    query =>
      new Schema(
        some(query),
        this.mutation,
        this.subscription,
        this.directiveRefs,
        this.definitions
      );

  withMutation: (mutation: Type) => Schema =
    mutation =>
      new Schema(
        this.query,
        some(mutation),
        this.subscription,
        this.directiveRefs,
        this.definitions
      );

  withSubscription: (subscription: Type) => Schema =
    subscription =>
      new Schema(
        this.query,
        this.mutation,
        some(subscription),
        this.directiveRefs,
        this.definitions
      );

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
