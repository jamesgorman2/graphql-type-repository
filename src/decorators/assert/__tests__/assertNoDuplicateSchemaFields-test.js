// @flow
/* eslint-env jest */

import {
  Module,
  ModuleRepository,
} from '../../../config';

import { FlattenedTypeGraph } from '../../../graph';

import { assertNoDuplicateSchemaFields } from '../assertNoDuplicateSchemaFields';

describe('assertNoDuplicateSchemaFields', () => {
  it('should do nothing when no duplicates', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar } schema { query: Foo }')
        )
    );
    expect(assertNoDuplicateSchemaFields(g)).toBe(g);
  });
  it('should report duplicate definitions', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar } schema { query: Foo }')
        )
        .withModule(
          new Module('bar').withSchema('type Bar { id: ID name: Bar } schema { query: Bar }')
        )
        .withModule(
          new Module('baz').withSchema('type Baz { name: Foo } schema { query: Baz }')
        )
    );
    expect(assertNoDuplicateSchemaFields(g).errors.map(error => error.message))
      .toEqual([
        'Field schema.query.id declared more than once in modules foo, bar.',
        'Field schema.query.name declared more than once in modules foo, bar, baz.',
      ]);
  });
});
