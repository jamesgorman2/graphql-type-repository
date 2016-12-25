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

export type ScalarConfig<TInternal, TExternal> = {
  description?: string;
  serialize: (value: mixed) => ?TExternal;
  parseValue?: (value: mixed) => ?TInternal;
  parseLiteral?: (valueNode: ValueNode) => ?TInternal;
};

export type ObjectConfig = {
  fields: FieldResolverConfig;
  isTypeOf?: GraphQLIsTypeOfFn<*, *>;
};

export type InterfaceConfig = {
  fields: FieldResolverConfig;
  resolveType?: GraphQLTypeResolver<*, *>;
};

export type UnionConfig = {
  resolveType?: GraphQLTypeResolver<*, *>;
};

export type TypeConfig =
  ObjectConfig |
  InterfaceConfig |
  UnionConfig |
  ScalarConfig<*, *>;

export type TypeConfigMap = {
  [typeName: string]: TypeConfig;
};
