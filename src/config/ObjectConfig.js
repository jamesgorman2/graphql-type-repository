// @flow

import type { GraphQLInterfaceType, GraphQLIsTypeOfFn } from 'graphql';
import type { GraphQLRepositoryFieldConfigMap, GraphQLRepositoryTypeName } from './definitions';

export type GraphQLRepositoryObjectTypeConfig<TSource, TContext> = {
  name: string;
  interfaces?: Array<GraphQLRepositoryTypeName<GraphQLInterfaceType>>;
  fields: GraphQLRepositoryFieldConfigMap<TSource, TContext>;
  isTypeOf?: ?GraphQLIsTypeOfFn<TSource, TContext>;
  description?: ?string;
  isIntrospection?: boolean;
};
