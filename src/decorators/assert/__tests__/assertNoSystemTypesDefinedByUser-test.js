// @flow
/* eslint-env jest */

import { parse } from 'graphql';

import {
  ExtensionDefinition,
  FlattenedTypeGraph,
  Type,
  TypeDefinition,
} from '../../../graph';

import {
  Module,
  NamedDefinitionNode,
} from '../../../config';

import { assertNoSystemTypesDefinedByUser } from '../assertNoSystemTypesDefinedByUser';

describe('assertNoSystemTypesDefinedByUser', () => {
  it('should ignore non system types', () => {
    const def: any = parse('extend type Foo { bar: Int }').definitions[0];
    const g = new FlattenedTypeGraph()
      .withType(
        new Type('Foo')
          .withDefinition(
            new TypeDefinition(new Module('foo')),
          )
          .withExtension(
            new ExtensionDefinition(
              new Module('foo'),
              new NamedDefinitionNode('Int', def)
            )
          )
      );
    expect(assertNoSystemTypesDefinedByUser(g).errors).toEqual([]);
  });
  it('should ignore type with system name if not flagged is system', () => {
    const def: any = parse('extend type Foo { bar: Int }').definitions[0];
    const g = new FlattenedTypeGraph()
      .withType(
        new Type('Int')
          .withDefinition(
            new TypeDefinition(new Module('foo')),
          )
          .withExtension(
            new ExtensionDefinition(
              new Module('foo'),
              new NamedDefinitionNode('Int', def)
            )
          )
      );
    expect(assertNoSystemTypesDefinedByUser(g).errors).toEqual([]);
  });
  it('should report definitions and extensions', () => {
    const def: any = parse('extend type Foo { bar: Int }').definitions[0];
    const g = new FlattenedTypeGraph()
      .withType(
        new Type('Int')
          .withDefinition(
            new TypeDefinition(new Module('foo')),
          )
          .withExtension(
            new ExtensionDefinition(
              new Module('foo'),
              new NamedDefinitionNode('Int', def)
            )
          )
          .setIsSystem()
      );
    expect(assertNoSystemTypesDefinedByUser(g).errors.map(e => e.message))
      .toEqual([
        'System type Int cannot be defined by user in module foo.',
        'System type Int cannot be extended by user in module foo.',
      ]);
  });
});
