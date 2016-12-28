// @flow
/* eslint-env jest */

import {
  GraphQLScalarType,
} from 'graphql';

import {
  toEqualIgnoreFunctions,
  toHaveErrors,
} from '../../../__tests__';

import {
  Module,
  ModuleRepository,
} from '../../../config';
import type {
  ScalarConfig,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import {
  generateTypes,
} from '../generateTypes';

expect.extend({ toEqualIgnoreFunctions, toHaveErrors });

describe('generateScalar', () => {
  it('should create basic scalar', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              'scalar S',
            {
              S: {
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
    expect(generateTypes(g).typeMap.getType('S'))
      .toEqualIgnoreFunctions(t);
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
    expect(generateTypes(g).typeMap.getType('S'))
      .toEqualIgnoreFunctions(t);
  });
  it('should throw if missing configs', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(new Module('foo').withSchema('scalar S'))
    );
    expect(generateTypes(g))
      .toHaveErrors([
        'Scalar S missing required configs in module foo.',
      ]);
  });
  it('should throw if missing serialize', () => {
    const r: ScalarConfig<*, *> = ({}: any);
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('scalar S', { S: r })
        )
    );
    expect(generateTypes(g))
      .toHaveErrors([
        'Scalar S missing required config parameter serialize in module foo.',
      ]);
  });
  it('should throw when given description in both schema and config ', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# a scalar
              scalar S`,
            {
              S: {
                description: 'a scalar',
                serialize: t => t,
              },
            },
            )
        )
    );
    expect(generateTypes(g))
      .toHaveErrors([
        'Description for scalar S supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
});
