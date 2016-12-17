// @flow
/* eslint-env jest */

import {
  Module,
  ModuleRepository,
} from '../../../config';

import { FlattenedTypeGraph } from '../../../graph';

import { assertNoMissingTypes } from '../assertNoMissingTypes';
import { appendSystemTypes } from '../../system/appendSystemTypes';

describe('assertNoMissingTypes', () => {
  it('should do nothing when no missing types', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: String }')
        )
    )
      .map(appendSystemTypes);
    expect(assertNoMissingTypes(g)).toBe(g);
  });
  it('should report types with no definitions', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar } type Baz { id: ID }')
        )
        .withModule(
          new Module('bar').withSchema('type Bim { id: ID } extend type Baz { name: Bar }')
        )
        .withModule(
          new Module('baz').withSchema('extend type Bar { name: Baz } extend type Foo { othername: Bar }')
        )
    );
    expect(assertNoMissingTypes(g).errors.map(e => e.message))
      .toEqual([
        'Undefined type ID referenced from type Foo in module foo, type Baz in module foo, type Bim in module bar.',
        'Undefined type Bar referenced from type Foo in modules foo, baz, type Baz in module bar, extended in module baz.',
      ]);
  });
  it('should report types with no definitions in the schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { name: Bim } schema { query: Foo }')
        )
        .withModule(
          new Module('bar').withSchema('type Foo { name: Bim } type Bar { name: ID } schema { query: Bar mutation: Foo }')
        )
        .withModule(
          new Module('baz').withSchema('type Foo { name: Bim } type Baz { name: Bim } schema { query: Foo subscription: Baz }')
        )
    )
      .map(appendSystemTypes);
    expect(assertNoMissingTypes(g).errors.map(e => e.message))
      .toEqual([
        'Undefined type Bim referenced from schema.query in modules foo, baz, schema.mutation in module bar, schema.subscription in module baz.',
      ]);
  });
});
