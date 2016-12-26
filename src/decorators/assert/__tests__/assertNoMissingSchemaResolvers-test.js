// @flow
/* eslint-env jest */

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import {
  assertNoMissingSchemaResolvers,
} from '../assertNoMissingSchemaResolvers';

describe('assertNoMissingSchemaResolvers', () => {
  it('should do nothing when no schema', () => {
    const g = new FlattenedTypeGraph();
    expect(assertNoMissingSchemaResolvers(g)).toBe(g);
  });
  it('should do nothing when no missing configs', () => {
    const r = {
      Foo: {
        fields: {
          id: (source, args, context, info) => `${source} ${args} ${context} ${info}`,
          name: (source, args, context, info) => `${source} ${args} ${context} ${info}`,
        },
      },
    };
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('type Foo { id: ID name: String } schema { query: Foo }', r)
        )
    );
    expect(assertNoMissingSchemaResolvers(g)).toBe(g);
  });
  it('should report invalid schema types', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(`
              interface Foo { id: ID }
              enum Bar { A B C }
              scalar Baz
              schema { query: Foo mutation: Bar subscription: Baz }
            `)
        )
        .withModule(
          new Module('bar')
            .withSchema(`
              input Foo { id: ID }
              union Bar = Foo | Baz
              schema { query: Foo mutation: Bar }
            `)
        )
    );
    expect(assertNoMissingSchemaResolvers(g).errors.map(error => error.message))
      .toEqual([
        'Unexpected type InterfaceTypeDefinition for schema.query in module foo. Expected an ObjectTypeDefinition.',
        'Unexpected type InputObjectTypeDefinition for schema.query in module bar. Expected an ObjectTypeDefinition.',
        'Unexpected type EnumTypeDefinition for schema.mutation in module foo. Expected an ObjectTypeDefinition.',
        'Unexpected type UnionTypeDefinition for schema.mutation in module bar. Expected an ObjectTypeDefinition.',
        'Unexpected type ScalarTypeDefinition for schema.subscription in module foo. Expected an ObjectTypeDefinition.',
      ]);
  });
  it('should report missing configs', () => {
    const r1 = {
      Foo: {
        fields: {
          name: (source, args, context, info) => `${source} ${args} ${context} ${info}`,
        },
      },
    };
    const r2 = {
      Foo: {
        fields: {
          id: (source, args, context, info) => `${source} ${args} ${context} ${info}`,
        },
      },
    };
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
          .withSchema('type Foo { id: ID name: String } type Bar { id: ID name: String } schema { query: Foo mutation: Bar }', r1)
        )
        .withModule(
          new Module('bar')
          .withSchema('type Foo { id: ID name: String } schema { mutation: Foo }', r2)
        )
        .withModule(
          new Module('baz')
          .withSchema('type Foo { id: ID name: String } schema { subscription: Foo }')
        )
    );
    expect(assertNoMissingSchemaResolvers(g).errors.map(error => error.message))
      .toEqual([
        'Missing config for schema.query.id in module foo.',
        'Missing config for schema.mutation.id in module foo.',
        'Missing config for schema.mutation.name in module foo.',
        'Missing config for schema.mutation.name in module bar.',
        'Missing config for schema.subscription.id in module baz.',
        'Missing config for schema.subscription.name in module baz.',
      ]);
  });
});
