// @flow

import type {
  DirectiveDefinitionNode,
  GraphQLNamedType,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
} from 'graphql';

import {
  Module,
  ModuleRepository,
  NamedDefinitionNode,
} from '../config';

import Appendable from '../util/Appendable';
import AppendableMap from '../util/AppendableMap';

export class TypeDefinition {
  module: Module;
  definition: ?NamedDefinitionNode<TypeDefinitionNode>;
  type: ?GraphQLNamedType;

  constructor(
    module: Module,
    definition: ?NamedDefinitionNode<TypeDefinitionNode> = null,
    type: ?GraphQLNamedType = null,
  ) {
    this.module = module;
    this.definition = definition;
    this.type = type;
  }

  withType: (type: GraphQLNamedType) => TypeDefinition =
    type => new TypeDefinition(this.module, this.definition, type);

  withDefinition: (definition: NamedDefinitionNode<TypeDefinitionNode>) => TypeDefinition =
    definition => new TypeDefinition(this.module, definition, this.type);
}

export class ExtensionDefinition {
  module: Module;
  definition: ?NamedDefinitionNode<ObjectTypeDefinitionNode>;
}

export class DirectiveDefinition {
  module: Module;
  definition: ?NamedDefinitionNode<DirectiveDefinitionNode>;
}

export class TypeNode extends Appendable<TypeNode> {
  name: string;
  typeRefs: string[];
  directives: string[];
  definitions: TypeDefinition[];
  extensions: ExtensionDefinition[];
  isSystem: boolean;

  constructor(
    name: string,
    typeRefs: string[] = [],
    directives: string[] = [],
    definitions: TypeDefinition[] = [],
    extensions: ExtensionDefinition[] = [],
    isSystem: boolean = false,
  ) {
    super();
    this.name = name;
    this.typeRefs = typeRefs;
    this.directives = directives;
    this.definitions = definitions;
    this.extensions = extensions;
    this.isSystem = isSystem;
  }

  append: (other: TypeNode) => TypeNode =
    other => other;

  withDefinition: (definition: TypeDefinition) => TypeNode =
    definition =>
      new TypeNode(
        this.name,
        this.typeRefs,
        this.directives,
        [...this.definitions, definition],
        this.extensions,
        this.isSystem,
      );
}

export class DirectiveNode extends Appendable<DirectiveNode> {
  declarations: DirectiveDefinition[];
  isSystem: boolean;
}

// eslint-disable-next-line no-use-before-define
export function extractType(module: Module, type: GraphQLNamedType): FlattenedTypeGraph {
  return new FlattenedTypeGraph()
    .withType(
      new TypeNode(type.name).withDefinition(new TypeDefinition(module).withType(type)),
    );
}

// eslint-disable-next-line no-use-before-define
export function extractTypes(module: Module): FlattenedTypeGraph {
  return module.types
    .reduce(
      (graph, type) => graph.append(extractType(module, type)),
      new FlattenedTypeGraph(),
    );
}


export function extractTypeDefinition(
  module: Module, type: NamedDefinitionNode<TypeDefinitionNode>,
): FlattenedTypeGraph {  // eslint-disable-line no-use-before-define
  return new FlattenedTypeGraph()
    .withType(
      new TypeNode(type.name).withDefinition(new TypeDefinition(module).withDefinition(type)),
    );
}

// eslint-disable-next-line no-use-before-define
export function extractTypeDefinitions(module: Module): FlattenedTypeGraph {
  return module.typeDefinitionNodes
    .reduce(
      (graph, type) => graph.append(extractTypeDefinition(module, type)),
      new FlattenedTypeGraph(),
    );
}

// eslint-disable-next-line no-use-before-define
function fromModule(module: Module): FlattenedTypeGraph {
  return extractTypes(module);
}

// eslint-disable-next-line no-use-before-define
function fromModuleRepository(moduleRepository: ModuleRepository): FlattenedTypeGraph {
  return moduleRepository.modules
    .reduce(
      (map, module) => map.append(fromModule(module)),
      new FlattenedTypeGraph(),
    );
}

export class FlattenedTypeGraph extends Appendable<FlattenedTypeGraph> {
  types: AppendableMap<TypeNode>;
  directives: AppendableMap<DirectiveNode>;
  schema: TypeNode;

  static from(moduleRepository: ModuleRepository): FlattenedTypeGraph {
    return fromModuleRepository(moduleRepository);
  }

  constructor(
    types: AppendableMap<TypeNode> = new AppendableMap(),
    directives: AppendableMap<DirectiveNode> = new AppendableMap(),
    schema: TypeNode = new TypeNode('__schema'),
  ) {
    super();
    this.types = types;
    this.directives = directives;
    this.schema = schema;
  }

  append: (other: FlattenedTypeGraph) => FlattenedTypeGraph =
    other =>
      new FlattenedTypeGraph(
        this.types.append(other.types),
        this.directives.append(other.directives),
        this.schema.append(other.schema),
      );

  withType: (typeNode: TypeNode) => FlattenedTypeGraph =
    typeNode =>
      new FlattenedTypeGraph(
        this.types.put(typeNode.name, typeNode),
        this.directives,
        this.schema,
      );
}
