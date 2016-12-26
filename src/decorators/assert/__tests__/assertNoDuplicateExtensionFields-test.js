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
  assertNoDuplicateExtensionFields,
} from '../assertNoDuplicateExtensionFields';

describe('assertNoDuplicateExtensionFields', () => {
  it('should do nothing when no duplicates', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar }')
        )
    );
    expect(assertNoDuplicateExtensionFields(g)).toBe(g);
  });
  it('should report duplicate definitions', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID name: Bar }')
        )
        .withModule(
          new Module('bar').withSchema('extend type Foo { id: ID name: Bar }')
        )
        .withModule(
          new Module('baz').withSchema('extend type Foo { name: Foo }')
        )
    );
    expect(assertNoDuplicateExtensionFields(g).errors.map(error => error.message))
      .toEqual([
        'Field Foo.id declared more than once in modules foo, bar.',
        'Field Foo.name declared more than once in modules foo, bar, baz.',
      ]);
  });
});
