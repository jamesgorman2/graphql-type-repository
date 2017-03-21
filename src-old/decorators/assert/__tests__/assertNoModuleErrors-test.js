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
  NestedAssertionError,
} from '../NestedAssertionError';
import {
  assertNoModuleErrors,
} from '../assertNoModuleErrors';

describe('assertNoModuleErrors', () => {
  it('should do nothing when no module errors', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('type foo { id: ID name: String }')
        )
    );
    expect(assertNoModuleErrors(g).errors.length).toEqual(0);
  });
  it('should append module errors', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(new Module('foo').withError(new Error('bar')))
    );
    expect(assertNoModuleErrors(g).errors[0].stack)
      .toMatch(/Error: Error in module foo.[\s\S]*Caused by: bar/);
    expect(assertNoModuleErrors(g).errors[0])
      .toBeInstanceOf(NestedAssertionError);
  });
});
