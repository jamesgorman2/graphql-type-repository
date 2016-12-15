// @flow
/* eslint-env jest */

import {
  GraphQLString,
  GraphQLID,
} from 'graphql';

import { FlattenedTypeGraph } from '../../../graph';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import { appendSystemTypes } from '../appendSystemTypes';

describe('appendSystemTypes', () => {
  it('should append type', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('type foo { id: ID name: String }')
        )
    );
    expect(appendSystemTypes(g).types.values().map(t => t.name))
      .toEqual(['foo', 'ID', 'String']);
    expect(appendSystemTypes(g).types.values().map(t => t.type).filter(t => t))
      .toEqual([GraphQLID, GraphQLString]);
  });
});
