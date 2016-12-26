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
import type {
  ASTNode,
  DocumentNode,
  DefinitionNode,
  DirectiveDefinitionNode,
  GraphQLNamedType,
  GraphQLType,
  ObjectTypeDefinitionNode,
  SchemaDefinitionNode,
  TypeDefinitionNode,
} from 'graphql';

import {
  Option,
  assert,
  isNonEmptyString,
  none,
  some,
  someOrNone,
} from '../util';

import type {
  TypeConfig,
  TypeConfigMap,
} from './types';

import {
  NamedDefinitionNode,
} from './NamedDefinitionNode';

function isDirective(directive: GraphQLDirective): boolean {
  return directive instanceof GraphQLDirective;
}

function isDirectiveDefinition(node: ASTNode): boolean {
  return node.kind === 'DirectiveDefinition';
}

function isExtensionNode(node: ASTNode): boolean {
  return node.kind === 'TypeExtensionDefinition';
}

function isNamedType(type: GraphQLType): boolean {
  return (
    type instanceof GraphQLScalarType ||
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLInterfaceType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLEnumType ||
    type instanceof GraphQLInputObjectType
  );
}

function isSchemaDefinition(node: ASTNode): boolean {
  return node.kind === 'SchemaDefinition';
}

function isTypeDefinition(node: ASTNode): boolean {
  return node.kind === 'ScalarTypeDefinition' ||
    node.kind === 'ObjectTypeDefinition' ||
    node.kind === 'InterfaceTypeDefinition' ||
    node.kind === 'UnionTypeDefinition' ||
    node.kind === 'EnumTypeDefinition' ||
    node.kind === 'InputObjectTypeDefinition';
}

function maybeName(node: ASTNode): Option<string> {
  return someOrNone(node)
    .map(n => someOrNone((n: any).definition).getOrElse(n))
    .flatMap(n => someOrNone((n: any).name).map(name => name.value));
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

function withDefinitionNode(
  module: Module, // eslint-disable-line no-use-before-define
  node: ASTNode,
  config: Option<TypeConfig>
): Module { // eslint-disable-line no-use-before-define
  if (isExtensionNode(node)) {
    const n: ObjectTypeDefinitionNode = (node: any).definition;
    const name = nodeName(n);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      module.typeDefinitionNodes,
      [...module.extensionDefinitionNodes, new NamedDefinitionNode(name, n, config)],
      module.directives,
      module.directiveDefinitionNodes,
      module.schemaDefinitionNode,
      module.errors,
    );
  } else if (isTypeDefinition(node)) {
    const n: TypeDefinitionNode = (node: any);
    const name = nodeName(n);
    assertNewNamedType(name, module);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      [...module.typeDefinitionNodes, new NamedDefinitionNode(name, n, config)],
      module.extensionDefinitionNodes,
      module.directives,
      module.directiveDefinitionNodes,
      module.schemaDefinitionNode,
      module.errors,
    );
  } else if (isSchemaDefinition(node)) {
    const n: SchemaDefinitionNode = (node: any);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      module.typeDefinitionNodes,
      module.extensionDefinitionNodes,
      module.directives,
      module.directiveDefinitionNodes,
      some(n),
      module.errors,
    );
  } else if (isDirectiveDefinition(node)) {
    const n: DirectiveDefinitionNode = (node: any);
    const name = nodeName(n);
    assertNewDirective(name, module);
    // eslint-disable-next-line no-use-before-define
    return new Module(
      module.name,
      module.types,
      module.typeDefinitionNodes,
      module.extensionDefinitionNodes,
      module.directives,
      [...module.directiveDefinitionNodes, new NamedDefinitionNode(name, n, config)],
      module.schemaDefinitionNode,
      module.errors,
    );
  }
  throw new Error('Parameter node must be a TypeSystemDefinitionNode.');
}

function withDocumentNode(
  module: Module, // eslint-disable-line no-use-before-define
  node: DocumentNode,
  configs: Option<TypeConfigMap>
): Module {  // eslint-disable-line no-use-before-define
  assert(node.kind === 'Document', 'Parameter node must be a DocumentNode.');
  const matchedConfigs = [];
  const definitions: DefinitionNode[] = node.definitions;
  const newModule = definitions
    .reduce(
      // eslint-disable-next-line no-use-before-define
      (m: Module, childNode: DefinitionNode) =>
        maybeName(childNode)
          .flatMap(
            (name) => {
              const matchedConfig = configs.flatMap(r => someOrNone(r[name]));
              matchedConfig.forEach((_) => { matchedConfigs.push(name); });
              return matchedConfig;
            }
          )
          .map(
            (matchedconfig: TypeConfig) =>
              m.withDefinitionNode(childNode, matchedconfig)
          )
          .getOrElse(m.withDefinitionNode(childNode)),
      module,
    );
  configs.forEach(
    (cs) => {
      const configNames = Object.keys(cs);
      if (matchedConfigs.length < configNames.length) {
        const unmatchedConfigNames = configNames.filter(n => !matchedConfigs.includes(n));
        const plural = unmatchedConfigNames.length > 1 ? 's' : '';
        const nameString = unmatchedConfigNames.map(n => `'${n}'`).join(', ');
        throw new Error(`Cannot add config${plural} ${nameString} with no matching type${plural}.`);
      }
    }
  );
  return newModule;
}

export class Module {
  name: string;
  types: GraphQLNamedType[];
  typeDefinitionNodes: NamedDefinitionNode<TypeDefinitionNode>[];
  extensionDefinitionNodes: NamedDefinitionNode<ObjectTypeDefinitionNode>[];
  directives: GraphQLDirective[];
  directiveDefinitionNodes: NamedDefinitionNode<DirectiveDefinitionNode>[];
  schemaDefinitionNode: Option<SchemaDefinitionNode>;
  errors: Error[];

  constructor(
    name: string,
    types: GraphQLNamedType[] = [],
    typeDefinitionNodes: NamedDefinitionNode<TypeDefinitionNode>[] = [],
    extensionDefinitionNodes: NamedDefinitionNode<ObjectTypeDefinitionNode>[] = [],
    directives: GraphQLDirective[] = [],
    directiveDefinitionNodes: NamedDefinitionNode<DirectiveDefinitionNode>[] = [],
    schemaDefinitionNode: Option<SchemaDefinitionNode> = none,
    errors: Error[] = [],
  ): void {
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
        this.schemaDefinitionNode.isNone() &&
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

  withDefinitionNode: (node: DefinitionNode, config: ?TypeConfig) => Module =
    (node, config) =>
      this.captureError(() => withDefinitionNode(this, node, someOrNone(config)));

  withDocumentNode: (node: DocumentNode, configs: ?TypeConfigMap) => Module =
    (node, configs) =>
      this.captureError(() => withDocumentNode(this, node, someOrNone(configs)));

  withSchema: (schema: string, configs: ?TypeConfigMap) => Module =
    (schema, configs) =>
      this.captureError(() => {
        assert(isNonEmptyString(schema), 'Parameter schema must be a non-empty string.');
        return this.withDocumentNode(parse(schema), configs);
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
