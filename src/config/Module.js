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
  GraphQLNamedType,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  SchemaDefinitionNode,
} from 'graphql';

import {
  assert,
  isNonEmptyString,
} from '../util';

import type {
  TypeResolverConfig,
  TypeResolverConfigMap,
} from './types';

import { NamedDefinitionNode } from './NamedDefinitionNode';

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
    `Cannot add type with duplicate name '${name}'.`,
  );
}

// eslint-disable-next-line no-use-before-define
function assertNewDirective(name: string, module: Module): void {
  assert(
    newDirective(name, module),
    `Cannot add directive with duplicate name '${name}'.`,
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
      module.errors,
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
      module.errors,
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
      module.errors,
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
      module.errors,
    );
  }
  throw new Error('Parameter node must be a TypeSystemDefinitionNode.');
}

// eslint-disable-next-line no-use-before-define
function withDocumentNode(module: Module, node: any, resolvers: ?TypeResolverConfigMap): Module {
  assert(node.kind === 'Document', 'Parameter node must be a DocumentNode.');
  const matchedResolvers = [];
  const newModule = node.definitions
    .reduce(
      // eslint-disable-next-line no-use-before-define
      (m: Module, childNode: DefinitionNode) => {
        const name = maybeName(childNode);
        if (name) {
          const r = resolvers ? resolvers[name] : null;
          if (r) {
            matchedResolvers.push(name);
          }
          return m.withDefinitionNode(childNode, r);
        }
        return m.withDefinitionNode(childNode);
      },
      module,
    );
  if (resolvers) {
    const resolverNames = Object.keys(resolvers);
    if (matchedResolvers.length < resolverNames.length) {
      const unmatchedResolverNames = resolverNames.filter(n => !matchedResolvers.includes(n));
      const plural = unmatchedResolverNames.length > 1 ? 's' : '';
      const nameString = unmatchedResolverNames.map(n => `'${n}'`).join(', ');
      throw new Error(`Cannot add resolver${plural} ${nameString} with no matching type${plural}.`);
    }
  }
  return newModule;
}

export class Module {
  name: string;
  types: GraphQLNamedType[];
  typeDefinitionNodes: NamedDefinitionNode<TypeDefinitionNode>[];
  extensionDefinitionNodes: NamedDefinitionNode<ObjectTypeDefinitionNode>[];
  directives: GraphQLDirective[];
  directiveDefinitionNodes: NamedDefinitionNode<DirectiveDefinitionNode>[];
  schemaDefinitionNode: ?SchemaDefinitionNode;
  errors: Error[];

  constructor(
    name: string,
    types: GraphQLNamedType[] = [],
    typeDefinitionNodes: NamedDefinitionNode<TypeDefinitionNode>[] = [],
    extensionDefinitionNodes: NamedDefinitionNode<ObjectTypeDefinitionNode>[] = [],
    directives: GraphQLDirective[] = [],
    directiveDefinitionNodes: NamedDefinitionNode<DirectiveDefinitionNode>[] = [],
    schemaDefinitionNode: ?SchemaDefinitionNode = null,
    errors: Error[] = [],
  ) {
    assert(isNonEmptyString(name), 'Parameter name must be a non-empty string.');
    this.name = name;
    this.types = types;
    this.typeDefinitionNodes = typeDefinitionNodes;
    this.extensionDefinitionNodes = extensionDefinitionNodes;
    this.directives = directives;
    this.directiveDefinitionNodes = directiveDefinitionNodes;
    this.schemaDefinitionNode = schemaDefinitionNode;
    this.errors = errors;
  }

  isEmpty: () => boolean =
    () =>
      this.types.length === 0 &&
        this.directives.length === 0 &&
        this.typeDefinitionNodes.length === 0 &&
        this.extensionDefinitionNodes.length === 0 &&
        this.directiveDefinitionNodes.length === 0 &&
        !this.schemaDefinitionNode &&
        this.errors.length === 0;

  withError: (error: Error) => Module =
    error =>
      new Module(
        this.name,
        this.types,
        this.typeDefinitionNodes,
        this.extensionDefinitionNodes,
        this.directives,
        this.directiveDefinitionNodes,
        this.schemaDefinitionNode,
        [...this.errors, error],
      );

  withType: (type: GraphQLNamedType) => Module =
    type =>
      this.captureError(() => {
        assert(isNamedType(type), 'Parameter type must be a GraphQLNamedType.');
        assertNewNamedType(type.name, this);
        return new Module(
          this.name,
          [...this.types, type],
          this.typeDefinitionNodes,
          this.extensionDefinitionNodes,
          this.directives,
          this.directiveDefinitionNodes,
          this.schemaDefinitionNode,
          this.errors,
        );
      });

  withDirective: (directive: GraphQLDirective) => Module =
    directive =>
      this.captureError(() => {
        assert(isDirective(directive), 'Parameter directive must be a GraphQLDirective.');
        assertNewDirective(directive.name, this);
        return new Module(
          this.name,
          this.types,
          this.typeDefinitionNodes,
          this.extensionDefinitionNodes,
          [...this.directives, directive],
          this.directiveDefinitionNodes,
          this.schemaDefinitionNode,
          this.errors,
        );
      });

  withDefinitionNode: (node: DefinitionNode, resolvers: ?TypeResolverConfig) => Module =
    (node, resolvers) => this.captureError(() => withDefinitionNode(this, node, resolvers));

  withDocumentNode: (node: DocumentNode, resolvers: ?TypeResolverConfigMap) => Module =
    (node, resolvers) =>
      this.captureError(() => withDocumentNode(this, node, resolvers));

  withSchema: (schema: string, resolvers: ?TypeResolverConfigMap) => Module =
    (schema, resolvers) =>
      this.captureError(() => {
        assert(isNonEmptyString(schema), 'Parameter schema must be a non-empty string.');
        return this.withDocumentNode(parse(schema), resolvers);
      });

  captureError: (f: () => Module) => Module =
    (f) => {
      try {
        return f();
      } catch (e) {
        return this.withError(e);
      }
    }
}
