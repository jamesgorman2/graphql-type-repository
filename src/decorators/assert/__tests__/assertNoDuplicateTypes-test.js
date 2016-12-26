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
  assertNoDuplicateTypes,
} from '../assertNoDuplicateTypes';

describe('assertNoDuplicateTypes', () => {
  it('should do nothing when no duplicate types', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar }')
        )
    );
    expect(assertNoDuplicateTypes(g)).toBe(g);
  });
  it('should ignore multiple extends', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar }')
        )
        .withModule(
          new Module('bar').withSchema('extend type Foo { bar: Bar }')
        )
        .withModule(
          new Module('baz').withSchema('extend type Foo { baz: Bar }')
        )
    );
    expect(assertNoDuplicateTypes(g)).toBe(g);
  });
  it('should detect multiple declarations', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar }')
        )
        .withModule(
          new Module('bar').withSchema('type Foo { bar: Bar }')
        )
        .withModule(
          new Module('baz').withSchema('type Foo { baz: Bar }')
        )
    );
    expect(assertNoDuplicateTypes(g).errors.map(e => e.message))
      .toEqual([
        'Type Foo declared more than once in modules foo, bar, baz.',
      ]);
  });
});
