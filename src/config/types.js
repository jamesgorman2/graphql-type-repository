// @flow

// eslint-disable-next-line no-duplicate-imports
import type {
  GraphQLFieldResolver,
  GraphQLIsTypeOfFn,
  GraphQLTypeResolver,
  ValueNode,
} from 'graphql';

export type EnumConfig = {
  description?: string;
  values? : {
    [valueName: string]: {
      description?: ?string,
      deprecationReason?: ?string,
      value?: ?any,
    }
  }
};

export type FieldConfig = {
  [fieldName: string]: {
    description?: string;
    resolver?: GraphQLFieldResolver<*>;
  }
};

export type InterfaceConfig = {
  description?: string;
  fields?: FieldConfig;
  resolveType?: GraphQLTypeResolver<*, *>;
};

export type ObjectConfig = {
  description?: string;
  fields: FieldConfig;
  isTypeOf?: GraphQLIsTypeOfFn<*, *>;
};

export type ScalarConfig<TInternal, TExternal> = {
  description?: string;
  serialize: (value: mixed) => ?TExternal;
  parseValue?: (value: mixed) => ?TInternal;
  parseLiteral?: (valueNode: ValueNode) => ?TInternal;
};

export type UnionConfig = {
  description?: string;
  resolveType?: GraphQLTypeResolver<*, *>;
};

export type TypeConfig =
  EnumConfig |
  ObjectConfig |
  InterfaceConfig |
  UnionConfig |
  ScalarConfig<*, *>;

export type TypeConfigMap = {
  [typeName: string]: TypeConfig;
};
