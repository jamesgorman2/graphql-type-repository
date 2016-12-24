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

import { FlattenedTypeGraph } from '../../../graph';

import { generateTypes } from '../generateTypes';

describe('generateTypes', () => {
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
    expect(generateTypes(g).types.get('Test').get().type.get()).toBe(t);
  });
});
