// @flow

import type {
  DirectiveDefinitionNode,
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

import {
  Appendable,
  AppendableMap,
  flatMap,
} from '../util';

import { TypeDefinition } from './TypeDefinition';
import { ExtensionDefinition } from './ExtensionDefinition';
import { DirectiveDefinition } from './DirectiveDefinition';
import { SchemaDefinition } from './SchemaDefinition';
import { Type } from './Type';
import { Schema } from './Schema';
import { Directive } from './Directive';

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
  return (type.directives ? type.directives.map(i => i.name.value) : [])
    .concat(
      flatMap(
        type.fields ? type.fields : [],
        f => f.directives.map(d => d.name.value)
      )
    );
}

function getTypeBaseGraph(
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
    (type, ref) => type.withTypeRef(ref, module),
    baseType,
  );
  const typeWithDirectiveRefs = directiveRefs.reduce(
    (type, ref) => type.withDirectiveRef(ref, module),
    typeWithRefs,
  );
  const baseGraph = getTypeBaseGraph(module, typeWithDirectiveRefs);
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
    (type, ref) => type.withTypeRef(ref, module),
    baseType,
  );
  const typeWithDirectiveRefs = directiveRefs.reduce(
    (type, ref) => type.withDirectiveRef(ref, module),
    typeWithRefs,
  );
  const baseGraph = getTypeBaseGraph(module, typeWithDirectiveRefs);
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
  if (!module.schemaDefinitionNode) {
    return new FlattenedTypeGraph();
  }
  const schema: SchemaDefinitionNode = module.schemaDefinitionNode;
  return new FlattenedTypeGraph()
    .withSchema(
      schema.directives
        .map(directive => directive.name.value)
        .reduce(
          (s, directive) => s.withDirectiveRef(directive, module),
          new Schema().withDefinition(new SchemaDefinition(module, schema))
        )
    );
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
    )
    .withRepository(moduleRepository);
}

export class FlattenedTypeGraph extends Appendable<FlattenedTypeGraph> {
  types: AppendableMap<Type>;
  directives: AppendableMap<Directive>;
  schema: Schema;
  errors: Error[];
  moduleRepositories: ModuleRepository[];

  static from(moduleRepository: ModuleRepository): FlattenedTypeGraph {
    return fromModuleRepository(moduleRepository);
  }

  constructor(
    types: AppendableMap<Type> = new AppendableMap(),
    directives: AppendableMap<Directive> = new AppendableMap(),
    schema: Schema = new Schema(),
    errors: Error[] = [],
    moduleRepositories: ModuleRepository[] = []
  ) {
    super();
    this.types = types;
    this.directives = directives;
    this.schema = schema;
    this.errors = errors;
    this.moduleRepositories = moduleRepositories;
  }

  append: (other: FlattenedTypeGraph) => FlattenedTypeGraph =
    other =>
      new FlattenedTypeGraph(
        this.types.append(other.types),
        this.directives.append(other.directives),
        this.schema.append(other.schema),
        [...this.errors, ...other.errors],
        [...this.moduleRepositories, ...other.moduleRepositories]
      );

  map: (decorator: (FlattenedTypeGraph) => FlattenedTypeGraph) => FlattenedTypeGraph =
    decorator => decorator(this);

  withType: (type: Type) => FlattenedTypeGraph =
    type =>
      new FlattenedTypeGraph(
        this.types.put(type.name, type),
        this.directives,
        this.schema,
        this.errors,
        this.moduleRepositories
      );

  withDirective: (directive: Directive) => FlattenedTypeGraph =
    directive =>
      new FlattenedTypeGraph(
        this.types,
        this.directives.put(directive.name, directive),
        this.schema,
        this.errors,
        this.moduleRepositories
      );

  withRepository: (moduleRepository: ModuleRepository) => FlattenedTypeGraph =
    moduleRepository =>
      new FlattenedTypeGraph(
        this.types,
        this.directives,
        this.schema,
        this.errors,
        [...this.moduleRepositories, moduleRepository]
      );

  withSchema: (schema: Schema) => FlattenedTypeGraph =
    schema =>
      new FlattenedTypeGraph(
        this.types,
        this.directives,
        this.schema.append(schema),
        this.errors,
        this.moduleRepositories
      );

  withError: (error: Error) => FlattenedTypeGraph =
    error =>
      new FlattenedTypeGraph(
        this.types,
        this.directives,
        this.schema,
        [...this.errors, error],
        this.moduleRepositories
      );

  withErrors: (errors: Error[]) => FlattenedTypeGraph =
    errors => (
      errors.length > 0 ?
        new FlattenedTypeGraph(
          this.types,
          this.directives,
          this.schema,
          [...this.errors, ...errors],
          this.moduleRepositories
        ) :
        this
    );
}
