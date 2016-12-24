// @flow
/* eslint-env jest */

import {
  DEFAULT_DEPRECATION_REASON,
  GraphQLEnumType,
} from 'graphql';

import stringify from 'json-stable-stringify';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import { generateTypes } from '../generateTypes';

describe('generateTypes', () => {
  it('should create basic enum', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A
                B
                C
              }`)
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: { value: 'A' },
        B: { value: 'B' },
        C: { value: 'C' },
      },
    });
    expect(stringify(generateTypes(g).types.get('E').get().type.get()))
      .toEqual(stringify(t));
  });
  it('should create complete scalar', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# test type
              enum E {
                # description a
                A @deprecated
                # description b
                B @deprecated(reason: "a good one")
                # description c
                C
              }`)
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      description: 'test type',
      values: {
        A: {
          value: 'A',
          description: 'description a',
          deprecationReason: DEFAULT_DEPRECATION_REASON,
        },
        B: {
          value: 'B',
          description: 'description b',
          deprecationReason: 'a good one',
        },
        C: {
          value: 'C',
          description: 'description c',
        },
      },
    });
    expect(stringify(generateTypes(g).types.get('E').get().type.get()))
      .toEqual(stringify(t));
  });
});
