// @flow

// eslint-disable-next-line no-duplicate-imports
import type {
  GraphQLFieldResolver,
  GraphQLIsTypeOfFn,
  GraphQLTypeResolver,
  ValueNode,
} from 'graphql';

export type FieldResolverConfig = {
  [fieldName: string]: GraphQLFieldResolver<*>;
};

export type ScalarResolverConfig<TInternal, TExternal> = {
  description?: string;
  serialize: (value: mixed) => ?TExternal;
  parseValue?: (value: mixed) => ?TInternal;
  parseLiteral?: (valueNode: ValueNode) => ?TInternal;
};

export type ObjectResolverConfig = {
  fields: FieldResolverConfig;
  isTypeOf?: GraphQLIsTypeOfFn<*, *>;
};

export type InterfaceResolverConfig = {
  fields: FieldResolverConfig;
  resolveType?: GraphQLTypeResolver<*, *>;
};

export type UnionResolverConfig = {
  resolveType?: GraphQLTypeResolver<*, *>;
};

export type TypeResolverConfig =
  ObjectResolverConfig |
  InterfaceResolverConfig |
  UnionResolverConfig |
  ScalarResolverConfig<*, *>;

export type TypeResolverConfigMap = {
  [typeName: string]: TypeResolverConfig;
};
