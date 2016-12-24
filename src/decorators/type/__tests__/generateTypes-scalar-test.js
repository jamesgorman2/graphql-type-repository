// @flow
/* eslint-env jest */

import {
  GraphQLScalarType,
} from 'graphql';

import stringify from 'json-stable-stringify';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import type {
  ScalarResolverConfig,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import { generateTypes } from '../generateTypes';

describe('generateTypes', () => {
  it('should create basic scalar', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              'scalar S',
            {
              S: {
                name: 'S',
                serialize: t => t,
              },
            },
            )
        )
    );
    const t = new GraphQLScalarType({
      name: 'S',
      serialize: s => s,
    });
    expect(stringify(generateTypes(g).types.get('S').get().type.get()))
      .toEqual(stringify(t));
  });
  it('should create complete scalar', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `#test type
              scalar S`,
            {
              S: {
                name: 'S',
                serialize: _ => 1,
                parseValue: _ => 1,
                parseLiteral: _ => 1,
              },
            },
            )
        )
    );
    const t = new GraphQLScalarType({
      name: 'S',
      description: 'test type',
      serialize: _ => 1,
      parseValue: _ => 1,
      parseLiteral: _ => 1,
    });
    expect(stringify(generateTypes(g).types.get('S').get().type.get()))
      .toEqual(stringify(t));
  });
  it('should throw if missing resolvers', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(new Module('foo').withSchema('scalar S'))
    );
    expect(generateTypes(g).errors.map(error => error.message))
      .toEqual([
        'Scalar type S missing required resolvers in module foo.',
      ]);
  });
  it('should throw if missing serialize', () => {
    const r: ScalarResolverConfig<*, *> = ({}: any);
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('scalar S', { S: r })
        )
    );
    expect(generateTypes(g).errors.map(error => error.message))
      .toEqual([
        'Scalar type S missing required resolver parameter serialize in module foo.',
      ]);
  });
});
