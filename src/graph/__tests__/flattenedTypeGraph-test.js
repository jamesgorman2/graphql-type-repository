// @flow
/* eslint-env jest */

import {
  GraphQLID,
  GraphQLObjectType,
  parse,
} from 'graphql';

import stringify from 'json-stable-stringify';

import AppendableMap from '../../util/AppendableMap';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import {
  FlattenedTypeGraph,
  TypeDefinition,
  TypeNode,
  extractTypes,
  extractTypeDefinitions,
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

describe('extractTypes', () => {
  it('should get type', () => {
    const t = new GraphQLObjectType({
      name: 'Test',
      fields: {
        id: { type: GraphQLID },
      },
    });
    const m = new Module('foo').withType(t);
    expect(stringify(extractTypes(m)))
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

  describe('extractTypeDefinitions', () => {
    it('should get type', () => {
      const t = parse('type Test {id: ID}').definitions[0];
      const m = new Module('foo').withSchema('type Test {id: ID}');
      expect(stringify(extractTypeDefinitions(m)))
        .toEqual(
          stringify(
            new FlattenedTypeGraph(
              new AppendableMap()
                .put(
                  'Test',
                  new TypeNode('Test')
                    .withDefinition(
                      new TypeDefinition(m).withDefinition(
                        new NamedDefinitionNode('Test', t, null),
                      ),
                    ),
                ),
            ),
          ),
        );
    });
  });

  describe('extractTypeExtensions', () => {
    //
  });
});
