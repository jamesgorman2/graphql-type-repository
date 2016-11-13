// @flow

import {
  GraphQLDirective,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  parse,
} from 'graphql';

// eslint-disable-next-line no-duplicate-imports
import type {
  DocumentNode,
  DefinitionNode,
  DirectiveDefinitionNode,
  GraphQLFieldResolver,
  GraphQLIsTypeOfFn,
  GraphQLNamedType,
  GraphQLTypeResolver,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  SchemaDefinitionNode,
  ValueNode,
} from 'graphql';

import {
  assert,
  assertNonEmptyString,
} from '../util/assert';

export type FieldResolverConfig = {
  [fieldName: string]: GraphQLFieldResolver<*>;
};

export type ScalarResolverConfig<TInternal, TExternal> = {
  serialize: (value: mixed) => ?TExternal;
  parseValue?: (value: mixed) => ?TInternal;
  parseLiteral?: (valueNode: ValueNode) => ?TInternal;
};

export type ObjectResolverConfig = {
  fields: FieldResolverConfig;
  isTypeOf?: ?GraphQLIsTypeOfFn;
};

export type InterfaceResolverConfig = {
  fields: FieldResolverConfig;
  resolveType?: ?GraphQLTypeResolver;
};

export type UnionResolverConfig = {
  resolveType?: ?GraphQLTypeResolver;
};

export type TypeResolverConfig =
  ObjectResolverConfig |
  InterfaceResolverConfig |
  UnionResolverConfig |
  ScalarResolverConfig<*, *>;

export type TypeResolverConfigMap = {
  [typeName: string]: TypeResolverConfig;
};

export class NamedDefinitionNode<T> {
  name: string;
  definition: T;
  resolvers: ?TypeResolverConfig;

  constructor(
    name: string,
    definition: T,
    resolvers: ?TypeResolverConfig,
  ) {
    this.name = name;
    this.definition = definition;
    this.resolvers = resolvers;
  }
}

function isDirective(directive: any): boolean {
  return directive instanceof GraphQLDirective;
}

function isDirectiveDefinition(node: any): boolean {
  return node.kind === 'DirectiveDefinition';
}

function isExtensionNode(node: any): boolean {
  return node.kind === 'TypeExtensionDefinition';
}

function isNamedType(type: any): boolean {
  return (
    type instanceof GraphQLScalarType ||
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLInterfaceType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLEnumType ||
    type instanceof GraphQLInputObjectType
  );
}

function isSchemaDefinition(node: any): boolean {
  return node.kind === 'SchemaDefinition';
}

function isTypeDefinition(node: any): boolean {
  return node.kind === 'ScalarTypeDefinition' ||
    node.kind === 'ObjectTypeDefinition' ||
    node.kind === 'InterfaceTypeDefinition' ||
    node.kind === 'UnionTypeDefinition' ||
    node.kind === 'EnumTypeDefinition' ||
    node.kind === 'InputObjectTypeDefinition';
}

function maybeName(node: any): ?string {
  const n = node && node.definition ? node.definition : node;
  return n && node.name ? n.name.value : null;
}

// eslint-disable-next-line no-use-before-define
function newDirective(name: string, module: Module): boolean {
  return !module.directives.find(t => t.name === name) &&
  !module.directiveDefinitionNodes.find(t => t.name === name);
}

// eslint-disable-next-line no-use-before-define
function newNamedType(name: string, module: Module): boolean {
  return !module.types.find(t => t.name === name) &&
    !module.typeDefinitionNodes.find(n => n.name === name);
}

function nodeName(node: TypeDefinitionNode | DirectiveDefinitionNode): string {
  return node.name.value;
}

// eslint-disable-next-line no-use-before-define
function assertNewNamedType(name: string, module: Module): void {
  assert(
    newNamedType(name, module),
    `cannot add type with duplicate name '${name}'`,
  );
}

// eslint-disable-next-line no-use-before-define
function assertNewDirective(name: string, module: Module): void {
  assert(
    newDirective(name, module),
    `cannot add directive with duplicate name '${name}'`,
  );
}

// eslint-disable-next-line no-use-before-define
function withDefinitionNode(module: Module, node: any, resolvers: ?TypeResolverConfig): Module {
  if (isExtensionNode(node)) {
    const n: ObjectTypeDefinitionNode = node.definition;
    const name = nodeName(n);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      module.typeDefinitionNodes,
      [...module.extensionDefinitionNodes, new NamedDefinitionNode(name, n, resolvers)],
      module.directives,
      module.directiveDefinitionNodes,
      module.schemaDefinitionNode,
    );
  } else if (isTypeDefinition(node)) {
    const n: TypeDefinitionNode = node;
    const name = nodeName(n);
    assertNewNamedType(name, module);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      [...module.typeDefinitionNodes, new NamedDefinitionNode(name, n, resolvers)],
      module.extensionDefinitionNodes,
      module.directives,
      module.directiveDefinitionNodes,
      module.schemaDefinitionNode,
    );
  } else if (isSchemaDefinition(node)) {
    const n: SchemaDefinitionNode = node;
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      module.typeDefinitionNodes,
      module.extensionDefinitionNodes,
      module.directives,
      module.directiveDefinitionNodes,
      n,
    );
  } else if (isDirectiveDefinition(node)) {
    const n: DirectiveDefinitionNode = node;
    const name = nodeName(n);
    assertNewDirective(name, module);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      module.typeDefinitionNodes,
      module.extensionDefinitionNodes,
      module.directives,
      [...module.directiveDefinitionNodes, new NamedDefinitionNode(name, n, resolvers)],
      module.schemaDefinitionNode,
    );
  }
  throw new Error('node must be a TypeSystemDefinitionNode');
}

// eslint-disable-next-line no-use-before-define
function withDocumentNode(module: Module, node: any, resolvers: ?TypeResolverConfigMap): Module {
  assert(node.kind === 'Document', 'node must be a DocumentNode');
  const matchedResolvers = [];
  const m = node.definitions
    .reduce(
      // eslint-disable-next-line no-use-before-define
      (newModule: Module, childNode: DefinitionNode) => {
        const name = maybeName(childNode);
        if (name) {
          const r = resolvers ? resolvers[name] : null;
          if (r) {
            matchedResolvers.push(name);
          }
          return newModule.withDefinitionNode(childNode, r);
        }
        return newModule.withDefinitionNode(childNode);
      },
      module,
    );
  if (resolvers) {
    const resolverNames = Object.keys(resolvers);
    if (matchedResolvers.length < resolverNames.length) {
      const unmatchedResolverNames = resolverNames.filter(n => !matchedResolvers.includes(n));
      const plural = unmatchedResolverNames.length > 1 ? 's' : '';
      const nameString = unmatchedResolverNames.map(n => `'${n}'`).join(', ');
      throw new Error(`cannot add resolver${plural} ${nameString} with no matching type${plural}`);
    }
  }
  return m;
}

export class Module {
  name: string;
  types: GraphQLNamedType[];
  typeDefinitionNodes: NamedDefinitionNode<TypeDefinitionNode>[];
  extensionDefinitionNodes: NamedDefinitionNode<ObjectTypeDefinitionNode>[];
  directives: GraphQLDirective[];
  directiveDefinitionNodes: NamedDefinitionNode<DirectiveDefinitionNode>[];
  schemaDefinitionNode: ?SchemaDefinitionNode;

  constructor(
    name: string,
    types: GraphQLNamedType[] = [],
    typeDefinitionNodes: NamedDefinitionNode<TypeDefinitionNode>[] = [],
    extensionDefinitionNodes: NamedDefinitionNode<ObjectTypeDefinitionNode>[] = [],
    directives: GraphQLDirective[] = [],
    directiveDefinitionNodes: NamedDefinitionNode<DirectiveDefinitionNode>[] = [],
    schemaDefinitionNode: ?SchemaDefinitionNode = null,
  ) {
    assertNonEmptyString(name, 'name must be a non-empty string');
    this.name = name;
    this.types = types;
    this.typeDefinitionNodes = typeDefinitionNodes;
    this.extensionDefinitionNodes = extensionDefinitionNodes;
    this.directives = directives;
    this.directiveDefinitionNodes = directiveDefinitionNodes;
    this.schemaDefinitionNode = schemaDefinitionNode;
  }

  isEmpty: () => boolean = () =>
    this.types.length === 0 &&
      this.directives.length === 0 &&
      this.typeDefinitionNodes.length === 0 &&
      this.extensionDefinitionNodes.length === 0 &&
      this.directiveDefinitionNodes.length === 0 &&
      !this.schemaDefinitionNode;

  withType: (type: GraphQLNamedType) => Module = (type) => {
    assert(isNamedType(type), 'type must be a GraphQLNamedType');
    assertNewNamedType(type.name, this);
    return new Module(
      this.name,
      [...this.types, type],
      this.typeDefinitionNodes,
      this.extensionDefinitionNodes,
      this.directives,
      this.directiveDefinitionNodes,
      this.schemaDefinitionNode,
    );
  }

  withDirective: (directive: GraphQLDirective) => Module = (directive) => {
    assert(isDirective(directive), 'directive must be a GraphQLDirective');
    assertNewDirective(directive.name, this);
    return new Module(
      this.name,
      this.types,
      this.typeDefinitionNodes,
      this.extensionDefinitionNodes,
      [...this.directives, directive],
      this.directiveDefinitionNodes,
      this.schemaDefinitionNode,
    );
  };

  withDefinitionNode: (node: DefinitionNode, resolvers: ?TypeResolverConfig) => Module =
    (node, resolvers) => withDefinitionNode(this, node, resolvers);

  withDocumentNode: (node: DocumentNode, resolvers: ?TypeResolverConfigMap) => Module =
    (node, resolvers) => withDocumentNode(this, node, resolvers);

  withSchema: (schema: string, resolvers: ?TypeResolverConfigMap) => Module =
    (schema, resolvers) => {
      assertNonEmptyString(schema, 'schema must be a non-empty string');
      return this.withDocumentNode(parse(schema), resolvers);
    };
}
