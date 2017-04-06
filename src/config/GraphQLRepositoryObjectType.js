// @flow

import { GraphQLObjectType } from 'graphql';
import type { GraphQLRepositoryObjectTypeConfig } from './definitions';
import type { GraphQLTypeBuilder } from './GraphQLTypeBuilder';

export class GraphQLRepositoryObjectTypeBuilder<TSource, TContext>
implements GraphQLTypeBuilder<
  GraphQLObjectType,
  GraphQLRepositoryObjectTypeBuilder<TSource, TContext>
> {
  config: GraphQLRepositoryObjectTypeConfig<TSource, TContext>;

  constructor(config: GraphQLRepositoryObjectTypeConfig<TSource, TContext>) {
    this.config = config;
  }

  build: () => GraphQLObjectType =
    () =>
      new GraphQLObjectType();

  merge: (other: GraphQLRepositoryObjectTypeBuilder<TSource, TContext>)
    => GraphQLRepositoryObjectTypeBuilder<TSource, TContext> =
    (other: GraphQLRepositoryObjectTypeBuilder<TSource, TContext>) =>
      other;

  withResolver: () => GraphQLRepositoryObjectTypeBuilder<TSource, TContext> =
    () =>
      this;
}
