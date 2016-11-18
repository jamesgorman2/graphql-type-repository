// @flow
/* eslint-env jest */

import {
  GraphQLID,
  GraphQLObjectType,
} from 'graphql';

import stringify from 'json-stable-stringify';

import AppendableMap from '../../util/AppendableMap';

import {
  Module,
} from '../../config';

import {
  FlattenedTypeGraph,
  TypeDefinition,
  TypeNode,
  extractType,
} from '../flattenedTypeGraph';

describe('FlattenedTypeGraph', () => {
  describe('append', () => {
    it('should return new object', () => {
      const g1 = new FlattenedTypeGraph();
      const g2 = new FlattenedTypeGraph();
      expect(g1.append(g2)).not.toBe(g1);
      expect(g1.append(g2)).not.toBe(g2);
    });
    it('shoud append recusively', () => {

    });
  });
});

describe('extractType', () => {
  it('should get type', () => {
    const m = new Module('foo');
    const t = new GraphQLObjectType({
      name: 'Test',
      fields: {
        id: { type: GraphQLID },
      },
    });
    expect(stringify(extractType(m, t)))
      .toEqual(
        stringify(
          new FlattenedTypeGraph(
            new AppendableMap()
              .put(
                'Test',
                new TypeNode('Test').withDefinition(new TypeDefinition(m).withType(t)),
              ),
          ),
        ),
      );
  });
});
