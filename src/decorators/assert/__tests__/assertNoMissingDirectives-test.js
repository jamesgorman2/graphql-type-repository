// @flow
/* eslint-env jest */

import {
  Module,
  ModuleRepository,
} from '../../../config';

import { FlattenedTypeGraph } from '../../../graph';

import { assertNoMissingDirectives } from '../assertNoMissingDirectives';
import { appendSystemDirectives } from '../../system/appendSystemDirectives';

describe('assertNoMissingDirectives', () => {
  it('should do nothing when no missing directives', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withSchema('type Foo { id: ID @deprecated name: String }')
        )
    )
      .map(appendSystemDirectives);
    expect(assertNoMissingDirectives(g)).toBe(g);
  });
  it('should report types with no definitions', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(`
              type Foo { id: ID @foo name: Bar }
              type Bar @foo { id: ID }
              type Baz { id: ID @bar }
              schema @bar { query: Bar }
            `)
        )
    );
    expect(assertNoMissingDirectives(g).errors.map(e => e.message))
      .toEqual([
        'Undefined directive foo referenced from type Foo in module foo, schema.query in module foo.',
        'Undefined directive bar referenced from type Baz in module foo, schema in module foo.',
      ]);
  });
});
