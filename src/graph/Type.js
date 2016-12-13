// @flow

import { Appendable } from '../util';

import { TypeDefinition } from './TypeDefinition';
import { ExtensionDefinition } from './ExtensionDefinition';

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
