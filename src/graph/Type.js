// @flow
import type {
  GraphQLNamedType,
} from 'graphql';

import {
  Module,
} from '../config';

import {
  Appendable,
  AppendableList,
  AppendableMap,
  Option,
  some,
  none,
} from '../util';

import {
  ExtensionDefinition,
} from './ExtensionDefinition';
import {
  TypeDefinition,
} from './TypeDefinition';

export class Type extends Appendable<Type> {
  name: string;
  typeRefs: AppendableMap<AppendableList<Module>>;
  directiveRefs: AppendableMap<AppendableList<Module>>;
  definitions: TypeDefinition[];
  extensions: ExtensionDefinition[];
  type: Option<GraphQLNamedType>;
  isSystem: boolean;

  constructor(
    name: string,
    typeRefs: AppendableMap<AppendableList<Module>> = new AppendableMap(),
    directiveRefs: AppendableMap<AppendableList<Module>> = new AppendableMap(),
    definitions: TypeDefinition[] = [],
    extensions: ExtensionDefinition[] = [],
    type: Option<GraphQLNamedType> = none,
    isSystem: boolean = false,
  ): void {
    super();
    this.name = name;
    this.typeRefs = typeRefs;
    this.directiveRefs = directiveRefs;
    this.definitions = definitions;
    this.extensions = extensions;
    this.type = type;
    this.isSystem = isSystem;
  }

  append: (other: Type) => Type =
    other =>
      new Type(
        this.name,
        this.typeRefs.append(other.typeRefs),
        this.directiveRefs.append(other.directiveRefs),
        [...this.definitions, ...other.definitions],
        [...this.extensions, ...other.extensions],
        this.type.or(other.type),
        this.isSystem || other.isSystem
      );

  setIsSystem: (newIsSystem: ?boolean) => Type =
    newIsSystem =>
      new Type(
        this.name,
        this.typeRefs,
        this.directiveRefs,
        this.definitions,
        this.extensions,
        this.type,
        newIsSystem === undefined || newIsSystem === null ? true : newIsSystem,
      );

  withDefinition: (definition: TypeDefinition) => Type =
    definition =>
      new Type(
        this.name,
        this.typeRefs,
        this.directiveRefs,
        [...this.definitions, definition],
        this.extensions,
        this.type,
        this.isSystem,
      );

  withDirectiveRef: (directiveRef: string, module: Module) => Type =
    (directiveRef, module) =>
      new Type(
        this.name,
        this.typeRefs,
        this.directiveRefs.put(directiveRef, new AppendableList([module])),
        this.definitions,
        this.extensions,
        this.type,
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
        this.type,
        this.isSystem,
      );

  withType: (type: GraphQLNamedType) => Type =
    type =>
      new Type(
        this.name,
        this.typeRefs,
        this.directiveRefs,
        this.definitions,
        this.extensions,
        some(type),
        this.isSystem,
      );

  withTypeRef: (typeRef: string, module: Module) => Type =
    (typeRef, module) =>
      new Type(
        this.name,
        this.typeRefs.put(typeRef, new AppendableList([module])),
        this.directiveRefs,
        this.definitions,
        this.extensions,
        this.type,
        this.isSystem,
      );
}
