// @flow

import type {
  DirectiveDefinitionNode,
  DirectiveNode,
  GraphQLDirective,
  GraphQLNamedType,
  ObjectTypeDefinitionNode,
  SchemaDefinitionNode,
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
  definition: NamedDefinitionNode<ObjectTypeDefinitionNode>;

  constructor(
    module: Module,
    definition: NamedDefinitionNode<ObjectTypeDefinitionNode>,
  ) {
    this.module = module;
    this.definition = definition;
  }
}

export class DirectiveDefinition {
  module: Module;
  definition: ?NamedDefinitionNode<DirectiveDefinitionNode>;
  directive: ?GraphQLDirective;

  constructor(
    module: Module,
    definition: ?NamedDefinitionNode<DirectiveDefinitionNode> = null,
    directive: ?GraphQLDirective = null,
  ) {
    this.module = module;
    this.definition = definition;
    this.directive = directive;
  }

  withDirective: (type: GraphQLDirective) => DirectiveDefinition =
    directive => new DirectiveDefinition(this.module, this.definition, directive);

  withDefinition: (
    definition: NamedDefinitionNode<DirectiveDefinitionNode>
  ) => DirectiveDefinition =
    definition => new DirectiveDefinition(this.module, definition, this.directive);
}

export class Type extends Appendable<Type> {
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

  append: (other: Type) => Type =
    other => other;

  withDefinition: (definition: TypeDefinition) => Type =
    definition =>
      new Type(
        this.name,
        this.typeRefs,
        this.directiveRefs,
        [...this.definitions, definition],
        this.extensions,
        this.isSystem,
      );

  withExtension: (extension: ExtensionDefinition) => Type =
    extension =>
      new Type(
        this.name,
        this.typeRefs,
        this.directiveRefs,
        this.definitions,
        [...this.extensions, extension],
        this.isSystem,
      );

  withTypeRef: (typeRef: string) => Type =
    typeRef =>
      new Type(
        this.name,
        [...this.typeRefs, typeRef],
        this.directiveRefs,
        this.definitions,
        this.extensions,
        this.isSystem,
      );

  withDirectiveRef: (directiveRef: string) => Type =
    directiveRef =>
      new Type(
        this.name,
        this.typeRefs,
        [...this.directiveRefs, directiveRef],
        this.definitions,
        this.extensions,
        this.isSystem,
      );
}

function maybeAppendTypes(t1: ?Type, t2: ?Type): ?Type {
  if (t1 && t2) {
    return t1.append(t2);
  }
  return t1 || t2;
}

export class Schema extends Appendable<Schema> {
  query: ?Type;
  mutation: ?Type;
  subscription: ?Type;
  directives: DirectiveNode[];

  constructor(
    query: ?Type,
    mutation: ?Type,
    subscription: ?Type,
    directives: DirectiveNode[] = [],
  ) {
    super();
    this.query = query;
    this.mutation = mutation;
    this.subscription = subscription;
    this.directives = directives;
  }

  withQuery: (query: Type) => Schema =
    query => new Schema(query, this.mutation, this.subscription, this.directives)

  withMutation: (mutation: Type) => Schema =
    mutation => new Schema(this.query, mutation, this.subscription, this.directives);

  withSubscription: (subscription: Type) => Schema =
    subscription => new Schema(this.query, this.mutation, subscription, this.directives);

  withDirective: (directive: DirectiveNode) => Schema =
    directive =>
      new Schema(
        this.query,
        this.mutation,
        this.subscription,
        [...this.directives, directive],
      );

  append: (other: Schema) => Schema =
    (other) => {
      const query = maybeAppendTypes(this.query, other.query);
      const mutation = maybeAppendTypes(this.mutation, other.mutation);
      const subscription = maybeAppendTypes(this.subscription, other.subscription);
      const directives = [...this.directives, ...other.directives];
      return new Schema(
        query,
        mutation,
        subscription,
        directives,
      );
    };
}

export class Directive extends Appendable<Directive> {
  name: string;
  definitions: DirectiveDefinition[];
  isSystem: boolean;

  constructor(
    name: string,
    definitions: DirectiveDefinition[] = [],
    isSystem: boolean = false,
  ) {
    super();
    this.name = name;
    this.definitions = definitions;
    this.isSystem = isSystem;
  }

  withDefinition: (directive: DirectiveDefinition) => Directive =
    directive =>
      new Directive(
        this.name,
        [...this.definitions, directive],
        this.isSystem,
      );
}

// eslint-disable-next-line no-use-before-define
export function extractType(module: Module, type: GraphQLNamedType): Type {
  return new Type(type.name)
    .withDefinition(new TypeDefinition(module).withType(type));
}

// eslint-disable-next-line no-use-before-define
export function extractTypes(module: Module): FlattenedTypeGraph {
  return module.types
    .reduce(
      (graph, type) => graph.withType(extractType(module, type)),
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

function getTypeDefintionBaseGraph(
  module: Module,
  type: Type,
): FlattenedTypeGraph { // eslint-disable-line no-use-before-define
  const operation = module.schemaDefinitionNode ?
    module.schemaDefinitionNode.operationTypes
      .filter(t => t.type.name.value === type.name)
      .map(t => t.operation)[0] :
    '';
  if (operation === 'query') {
    return new FlattenedTypeGraph().withSchema(new Schema().withQuery(type));
  }
  if (operation === 'mutation') {
    return new FlattenedTypeGraph().withSchema(new Schema().withMutation(type));
  }
  if (operation === 'subscription') {
    return new FlattenedTypeGraph().withSchema(
      new Schema().withSubscription(type),
    );
  }
  return new FlattenedTypeGraph().withType(type);
}

export function extractTypeDefinition(
  module: Module,
  typeDefinition: NamedDefinitionNode<TypeDefinitionNode>,
): FlattenedTypeGraph {  // eslint-disable-line no-use-before-define
  const typeRefs = getTypeRefs(typeDefinition.definition);
  const directiveRefs = getDirectivesRefs(typeDefinition.definition);
  const baseType = new Type(typeDefinition.name)
    .withDefinition(new TypeDefinition(module).withDefinition(typeDefinition));
  const typeWithRefs = typeRefs.reduce(
    (type, ref) => type.withTypeRef(ref),
    baseType,
  );
  const typeWithDirectiveRefs = directiveRefs.reduce(
    (type, ref) => type.withDirectiveRef(ref),
    typeWithRefs,
  );
  const baseGraph = getTypeDefintionBaseGraph(module, typeWithDirectiveRefs);
  const graphWithRefs = typeRefs.reduce(
    (graph, ref) => graph.withType(new Type(ref)),
    baseGraph,
  );
  return directiveRefs.reduce(
    (graph, ref) => graph.withDirective(new Directive(ref)),
    graphWithRefs,
  );
}

// eslint-disable-next-line no-use-before-define
export function extractTypeDefinitions(module: Module): FlattenedTypeGraph {
  // TODO - skip if in schema
  return module.typeDefinitionNodes
    .reduce(
      (graph, type) => graph.append(extractTypeDefinition(module, type)),
      new FlattenedTypeGraph(),
    );
}

export function extractTypeExtension(
  module: Module,
  extensionDefinition: NamedDefinitionNode<ObjectTypeDefinitionNode>,
): FlattenedTypeGraph { // eslint-disable-line no-use-before-define
  const typeRefs = getTypeRefs(extensionDefinition.definition);
  const directiveRefs = getDirectivesRefs(extensionDefinition.definition);
  const baseType = new Type(extensionDefinition.name)
    .withExtension(new ExtensionDefinition(module, extensionDefinition));
  const typeWithRefs = typeRefs.reduce(
    (type, ref) => type.withTypeRef(ref),
    baseType,
  );
  const typeWithDirectiveRefs = directiveRefs.reduce(
    (type, ref) => type.withDirectiveRef(ref),
    typeWithRefs,
  );
  const graphWithRefs = typeRefs.reduce(
    (graph, ref) => graph.withType(new Type(ref)),
    new FlattenedTypeGraph().withType(typeWithDirectiveRefs),
  );
  return directiveRefs.reduce(
    (graph, ref) => graph.withDirective(new Directive(ref)),
    graphWithRefs,
  );
}

// eslint-disable-next-line no-use-before-define
export function extractTypeExtensions(module: Module): FlattenedTypeGraph {
  // TODO - skip if in schema
  return module.extensionDefinitionNodes
    .reduce(
      (graph, type) => graph.append(extractTypeExtension(module, type)),
      new FlattenedTypeGraph(),
    );
}

// eslint-disable-next-line no-use-before-define
export function extractDirective(module: Module, directive: GraphQLDirective): Directive {
  return new Directive(directive.name)
    .withDefinition(new DirectiveDefinition(module).withDirective(directive));
}

// eslint-disable-next-line no-use-before-define
export function extractDirectives(module: Module): FlattenedTypeGraph {
  return module.directives
    .reduce(
      (graph, directive) => graph.withDirective(extractDirective(module, directive)),
      new FlattenedTypeGraph(),
    );
}

// eslint-disable-next-line no-use-before-define
export function extractDirectiveDefinition(
  module: Module,
  directive: NamedDefinitionNode<DirectiveDefinitionNode>,
): Directive {
  return new Directive(directive.name)
    .withDefinition(new DirectiveDefinition(module).withDefinition(directive));
}

// eslint-disable-next-line no-use-before-define
export function extractDirectiveDefinitions(module: Module): FlattenedTypeGraph {
  return module.directiveDefinitionNodes
    .reduce(
      (graph, directive) => graph.withDirective(extractDirectiveDefinition(module, directive)),
      new FlattenedTypeGraph(),
    );
}

// eslint-disable-next-line no-use-before-define
export function extractSchema(module: Module): FlattenedTypeGraph {
  if (!module.schema) {
    return new FlattenedTypeGraph();
  }
  // TODO - get bits
  return new FlattenedTypeGraph()
    .withSchema(new Schema());
}

// eslint-disable-next-line no-use-before-define
function fromModule(module: Module): FlattenedTypeGraph {
  return extractTypes(module)
    .append(extractTypeDefinitions(module))
    .append(extractTypeExtensions(module))
    .append(extractDirectives(module))
    .append(extractDirectiveDefinitions(module))
    .append(extractSchema(module));
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
  types: AppendableMap<Type>;
  directives: AppendableMap<Directive>;
  schema: Schema;

  static from(moduleRepository: ModuleRepository): FlattenedTypeGraph {
    return fromModuleRepository(moduleRepository);
  }

  constructor(
    types: AppendableMap<Type> = new AppendableMap(),
    directives: AppendableMap<Directive> = new AppendableMap(),
    schema: Schema = new Schema(),
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

  withType: (type: Type) => FlattenedTypeGraph =
    type =>
      new FlattenedTypeGraph(
        this.types.put(type.name, type),
        this.directives,
        this.schema,
      );

  withDirective: (directive: Directive) => FlattenedTypeGraph =
    directive =>
      new FlattenedTypeGraph(
        this.types,
        this.directives.put(directive.name, directive),
        this.schema,
      );
  withSchema: (schema: Schema) => FlattenedTypeGraph =
    schema =>
      new FlattenedTypeGraph(
        this.types,
        this.directives,
        this.schema.append(schema),
      );
}
