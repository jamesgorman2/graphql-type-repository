// @flow

import type { GraphQLFieldResolver, GraphQLInterfaceType, GraphQLInputType, GraphQLIsTypeOfFn, GraphQLOutputType, Thunk } from 'graphql';

export type GraphQLRepositoryTypeName<TRaw> = string | TRaw;

export type GraphQLRepositoryArgumentConfig = {
  type: GraphQLRepositoryTypeName<GraphQLInputType>;
  defaultValue?: mixed;
  description?: ?string;
};

export type GraphQLRepositoryFieldConfig<TSource, TContext> = {
  type: GraphQLRepositoryTypeName<GraphQLOutputType>;
  args?: GraphQLRepositoryFieldConfigArgumentMap;
  resolve?: GraphQLFieldResolver<TSource, TContext>;
  deprecationReason?: ?string;
  description?: ?string;
};

export type GraphQLRepositoryFieldConfigArgumentMap = {
  [argName: string]: GraphQLRepositoryArgumentConfig;
};

export type GraphQLRepositoryFieldConfigMap<TSource, TContext> = {
  [fieldName: string]: GraphQLRepositoryFieldConfig<TSource, TContext>;
};

export type GraphQLRepositoryObjectTypeConfig<TSource, TContext> = {
  name: string;
  interfaces?: Thunk<?Array<GraphQLRepositoryTypeName<GraphQLInterfaceType>>>;
  fields: Thunk<GraphQLRepositoryFieldConfigMap<TSource, TContext>>;
  isTypeOf?: ?GraphQLIsTypeOfFn<TSource, TContext>;
  description?: ?string;
  isIntrospection?: boolean;
};
