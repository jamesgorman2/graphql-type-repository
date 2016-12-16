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
    );
    expect(assertNoMissingTypes(g).errors.map(e => e.message))
      .toEqual([
        'Undefined type ID referenced from type Foo in module foo, type Baz in module foo, type Bim in module bar.',
        'Undefined type Bar referenced from type Foo in module foo, type Baz in module bar.',
      ]);
  });
});
