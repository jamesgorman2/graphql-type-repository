// @flow
/* eslint-env jest */

import {
  Module,
  ModuleRepository,
} from '../../../config';

import { FlattenedTypeGraph } from '../../../graph';

import { assertNoDisconnectedSubgraphs } from '../assertNoDisconnectedSubgraphs';

describe('assertNoDisconnectedSubgraphs', () => {
  it('should do nothing when no duplicates', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(`
              type Foo { id: ID name: Bar }
              type Bar { name: Baz }
              type Baz { id: ID }
              type Query { foo: Foo }
              schema { query: Query }
            `)
        )
    );
    expect(assertNoDisconnectedSubgraphs(g)).toBe(g);
  });
  it('should not report if no schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(`
              type Foo { id: ID }
              type Bar { id: ID }
              type Baz { id: ID }
            `)
        )
    );
    expect(assertNoDisconnectedSubgraphs(g)).toBe(g);
  });
  it('should not report disconnected types', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(`
              type D1 { d2: D2 }
              type D2 { d1: D1 }
              type D3 { id: ID }
              type Foo { id: ID name: Bar }
              type Bar { name: Baz }
              type Baz { id: ID }
              type Query { foo: Foo }
              schema { query: Query }
            `)
        )
    );
    expect(assertNoDisconnectedSubgraphs(g).errors.map(error => error.message))
      .toEqual([
        'Type D1 not reachable from schema in module foo.',
        'Type D2 not reachable from schema in module foo.',
        'Type D3 not reachable from schema in module foo.',
      ]);
  });
});
