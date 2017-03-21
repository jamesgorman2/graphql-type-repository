// @flow
/* eslint-env jest */

import {
  GraphQLID,
  GraphQLObjectType,
} from 'graphql';

import {
  toHaveErrors,
} from '../../../__tests__';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import {
  makeTypes,
} from '../makeTypes';

const a = new GraphQLObjectType({
  name: 'A',
  fields: {
    id: { type: GraphQLID },
  },
  isTypeOf: _ => true,
});
const b = new GraphQLObjectType({
  name: 'B',
  fields: {
    id: { type: GraphQLID },
  },
  isTypeOf: _ => true,
});

expect.extend({ toHaveErrors });

describe('makeUnion', () => {
  it('should create basic union', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withType(a)
            .withType(b)
            .withSchema('union U = A | B')
        )
    );
    expect(makeTypes(g).typeMap.getUnionType('U').getTypes())
      .toEqual([a, b]);
  });
  it('should use description from schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withType(a)
            .withType(b)
            .withSchema(
              `# description
              union U = A | B`
            )
        )
    );
    expect(makeTypes(g).typeMap.getUnionType('U').description)
      .toEqual('description');
  });
  it('should use description from config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withType(a)
            .withType(b)
            .withSchema(
              'union U = A | B',
            {
              U: {
                description: 'description',
              },
            }
            )
        )
    );
    expect(makeTypes(g).typeMap.getUnionType('U').description)
      .toEqual('description');
  });
  it('should error when description for supplied in both schema and config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withType(a)
            .withType(b)
            .withSchema(
              `# description
              union U = A | B`,
            {
              U: {
                description: 'description',
              },
            }
            )
        )
    );
    expect(makeTypes(g))
      .toHaveErrors([
        'Description for union U supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
  it('should append resolve type', () => {
    const r = (_1, _2, _3) => '';
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withType(a)
            .withType(b)
            .withSchema(
              `# description
              union U = A | B`,
            {
              U: {
                resolveType: r,
              },
            }
            )
        )
    );
    expect(makeTypes(g).typeMap.getUnionType('U').resolveType).toBe(r);
  });
});
