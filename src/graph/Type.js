// @flow
import type {
  GraphQLNamedType,
} from 'graphql';

import { Appendable } from '../util';

import { TypeDefinition } from './TypeDefinition';
import { ExtensionDefinition } from './ExtensionDefinition';

export class Type extends Appendable<Type> {
  name: string;
  typeRefs: string[];
  directiveRefs: string[];
  definitions: TypeDefinition[];
  extensions: ExtensionDefinition[];
  type: ?GraphQLNamedType;
  isSystem: boolean;

  constructor(
    name: string,
    typeRefs: string[] = [],
    directiveRefs: string[] = [],
    definitions: TypeDefinition[] = [],
    extensions: ExtensionDefinition[] = [],
    type: ?GraphQLNamedType = null,
    isSystem: boolean = false,
  ) {
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
        [...this.typeRefs, ...other.typeRefs],
        [...this.directiveRefs, ...other.directiveRefs],
        [...this.definitions, ...other.definitions],
        [...this.extensions, ...other.extensions],
        this.type ? this.type : other.type,
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

  withDirectiveRef: (directiveRef: string) => Type =
    directiveRef =>
      new Type(
        this.name,
        this.typeRefs,
        [...this.directiveRefs, directiveRef],
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
        type,
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
        this.type,
        this.isSystem,
      );
}
