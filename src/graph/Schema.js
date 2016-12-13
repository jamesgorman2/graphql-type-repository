// @flow

import { Appendable } from '../util';
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
  definitions: SchemaDefinition[];

  constructor(
    query: ?Type,
    mutation: ?Type,
    subscription: ?Type,
    definitions: SchemaDefinition[] = [],
  ) {
    super();
    this.query = query;
    this.mutation = mutation;
    this.subscription = subscription;
    this.definitions = definitions;
  }

  withQuery: (query: Type) => Schema =
    query => new Schema(query, this.mutation, this.subscription, this.definitions)

  withMutation: (mutation: Type) => Schema =
    mutation => new Schema(this.query, mutation, this.subscription, this.definitions);

  withSubscription: (subscription: Type) => Schema =
    subscription => new Schema(this.query, this.mutation, subscription, this.definitions);

  withDefinition: (definition: SchemaDefinition) => Schema =
    definition =>
      new Schema(
        this.query,
        this.mutation,
        this.subscription,
        [...this.definitions, definition],
      );

  append: (other: Schema) => Schema =
    (other) => {
      const query = maybeAppendTypes(this.query, other.query);
      const mutation = maybeAppendTypes(this.mutation, other.mutation);
      const subscription = maybeAppendTypes(this.subscription, other.subscription);
      const directives = [...this.definitions, ...other.definitions];
      return new Schema(
        query,
        mutation,
        subscription,
        directives,
      );
    };
}
