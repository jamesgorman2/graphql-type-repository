// @flow

import type { GraphQLNamedType } from 'graphql';

export interface GraphQLTypeBuilder<
  T: GraphQLNamedType,
  B: GraphQLTypeBuilder<T, *>
> {
  build(): T;
  merge(other: B): B;
  withResolver(): B;
}
