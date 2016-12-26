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

describe('generateTypes', () => {
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
    expect(generateTypes(g).typeMap.getUnionType('U').getTypes())
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
    expect(generateTypes(g).typeMap.getUnionType('U').description)
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
    expect(generateTypes(g).typeMap.getUnionType('U').description)
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
    expect(generateTypes(g).errors.map(error => error.message))
      .toEqual([
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
    expect(generateTypes(g).typeMap.getUnionType('U').resolveType).toBe(r);
  });
});
