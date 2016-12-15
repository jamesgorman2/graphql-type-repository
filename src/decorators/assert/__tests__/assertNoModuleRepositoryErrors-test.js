// @flow
/* eslint-env jest */

import { ModuleRepository } from '../../../config';

import { FlattenedTypeGraph } from '../../../graph';

import { assertNoModuleRepositoryErrors } from '../assertNoModuleRepositoryErrors';

describe('assertNoModuleRepositoryErrors', () => {
  it('should do nothing when no errors', () => {
    const g = new FlattenedTypeGraph();
    expect(assertNoModuleRepositoryErrors(g)).toBe(g);
  });
  it('should report all errors in repository', () => {
    const e1 = new Error('1');
    const e2 = new Error('2');
    const r = new ModuleRepository()
      .withError(e1)
      .withError(e2);
    const g = new FlattenedTypeGraph()
      .withRepository(r);
    expect(assertNoModuleRepositoryErrors(g).errors).toEqual([e1, e2]);
  });
  it('should report all errors in all repositories', () => {
    const e1 = new Error('1');
    const e2 = new Error('2');
    const g = new FlattenedTypeGraph()
      .withRepository(new ModuleRepository().withError(e1))
      .withRepository(new ModuleRepository().withError(e2));
    expect(assertNoModuleRepositoryErrors(g).errors).toEqual([e1, e2]);
  });
});
