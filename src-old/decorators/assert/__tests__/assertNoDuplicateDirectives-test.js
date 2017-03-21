// @flow
/* eslint-env jest */

import {
  toHaveErrors,
} from '../../../__tests__';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import {
  assertNoDuplicateDirectives,
} from '../assertNoDuplicateDirectives';

expect.extend({ toHaveErrors });

describe('assertNoDisconnectedSubgraphs', () => {
  it('should do nothing when no duplicates', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(new Module('foo').withSchema('directive @foo(if: Boolean!) on FIELD'))
    );
    expect(assertNoDuplicateDirectives(g)).toBe(g);
  });
  it('should reject duplicate directive', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(new Module('foo').withSchema('directive @foo(if: Boolean!) on FIELD'))
        .withModule(new Module('bar').withSchema('directive @foo(if: Boolean!) on FIELD'))
        .withModule(new Module('baz').withSchema('directive @foo(if: Boolean!) on FIELD'))
    );
    expect(assertNoDuplicateDirectives(g))
      .toHaveErrors([
        'Directive @foo declared more than once in modules foo, bar, baz.',
      ]);
  });
});
