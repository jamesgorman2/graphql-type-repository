// @flow
/* eslint-env jest */

import {
  GraphQLID,
  GraphQLObjectType,
} from 'graphql';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
  Type,
} from '../../../graph';

import {
  makeTypes,
} from '../makeTypes';

describe('makeTypes', () => {
  it('should not change system types', () => {
    const g = new FlattenedTypeGraph()
      .withType(
        new Type(GraphQLID.name)
          .withType(GraphQLID)
      );
    expect(makeTypes(g).types.get(GraphQLID.name).get().type.get())
      .toBe(GraphQLID);
  });

  it('should copy raw type def to type', () => {
    const t: GraphQLObjectType = new GraphQLObjectType({
      name: 'Test',
      fields: {
        id: { type: GraphQLID },
      },
    });
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo').withType(t)
        )
    );
    expect(makeTypes(g).types.get('Test').get().type.get()).toBe(t);
  });
});
