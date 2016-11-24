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
  directiveRefs: string[];
  definitions: TypeDefinition[];
  extensions: ExtensionDefinition[];
  isSystem: boolean;

  constructor(
    name: string,
    typeRefs: string[] = [],
    directiveRefs: string[] = [],
    definitions: TypeDefinition[] = [],
    extensions: ExtensionDefinition[] = [],
    isSystem: boolean = false,
  ) {
    super();
    this.name = name;
    this.typeRefs = typeRefs;
    this.directiveRefs = directiveRefs;
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
        this.directiveRefs,
        [...this.definitions, definition],
        this.extensions,
        this.isSystem,
      );

  withTypeRef: (typeRef: string) => TypeNode =
    typeRef =>
      new TypeNode(
        this.name,
        [...this.typeRefs, typeRef],
        this.directiveRefs,
        this.definitions,
        this.extensions,
        this.isSystem,
      );

  withDirectiveRef: (directiveRef: string) => TypeNode =
    directiveRef =>
      new TypeNode(
        this.name,
        this.typeRefs,
        [...this.directiveRefs, directiveRef],
        this.definitions,
        this.extensions,
        this.isSystem,
      );
}

export class DirectiveNode extends Appendable<DirectiveNode> {
  name: string;
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

function getTypeRefs(type: any): string[] {
  const interfaceRefs: string[] = type.interfaces ? type.interfaces.map(i => i.name.value) : [];
  const fieldRefs: string[] = type.fields ? type.fields.map(f => f.type.name.value) : [];
  return interfaceRefs.concat(fieldRefs);
}

function getDirectivesRefs(type: any): string[] {
  return type.directives ? type.directives.map(i => i.name.value) : [];
}

export function extractTypeDefinition(
  module: Module, type: NamedDefinitionNode<TypeDefinitionNode>,
): FlattenedTypeGraph {  // eslint-disable-line no-use-before-define
  const typeRefs = getTypeRefs(type.definition);
  const directiveRefs = getDirectivesRefs(type.definition);
  const baseTypeNode = new TypeNode(type.name)
    .withDefinition(new TypeDefinition(module).withDefinition(type));
  const typeNodeWithRefs = typeRefs.reduce(
    (typeNode, ref) => typeNode.withTypeRef(ref),
    baseTypeNode,
  );
  const typeNodeWithDirectiveRefs = directiveRefs.reduce(
    (typeNode, ref) => typeNode.withDirectiveRef(ref),
    typeNodeWithRefs,
  );
  const graphWithRefs = typeRefs.reduce(
    (graph, ref) => graph.withType(new TypeNode(ref)),
    new FlattenedTypeGraph().withType(typeNodeWithDirectiveRefs),
  );
  return directiveRefs.reduce(
    (graph, ref) => graph.withDirective(new DirectiveNode(ref)),
    graphWithRefs,
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
  return extractTypes(module)
    .append(extractTypeDefinitions(module));
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

  withDirective: (directiveNode: DirectiveNode) => FlattenedTypeGraph =
    directiveNode =>
      new FlattenedTypeGraph(
        this.types,
        this.directives.put(directiveNode.name, directiveNode),
        this.schema,
      );
}
