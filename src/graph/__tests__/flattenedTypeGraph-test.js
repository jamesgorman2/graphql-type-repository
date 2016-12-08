// @flow
/* eslint-env jest */

import {
  GraphQLID,
  GraphQLObjectType,
  parse,
} from 'graphql';

// eslint-disable-next-line no-duplicate-imports
import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import stringify from 'json-stable-stringify';

import AppendableMap from '../../util/AppendableMap';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import {
  ExtensionDefinition,
  FlattenedTypeGraph,
  TypeDefinition,
  Type,
  extractTypeExtensions,
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
                  new Type('Test').withDefinition(new TypeDefinition(m).withType(t)),
                ),
            ),
          ),
        );
    });
  });

  describe('extractTypeDefinitions', () => {
    it('should get type and refs', () => {
      const t = parse('type Test {id: ID}').definitions[0];
      const m = new Module('foo').withSchema('type Test {id: ID}');
      expect(stringify(extractTypeDefinitions(m)))
        .toEqual(
          stringify(
            new FlattenedTypeGraph(
              new AppendableMap()
                .put(
                  'Test',
                  new Type('Test')
                    .withDefinition(
                      new TypeDefinition(m).withDefinition(
                        new NamedDefinitionNode('Test', t, null),
                      ),
                    )
                    .withTypeRef('ID'),
                )
                .put('ID', new Type('ID')),
            ),
          ),
        );
    });
    it('should extract schema types to schema', () => {
      const m = new Module('foo')
        .withSchema(
          `type Foo { bar: Int }
           type Bar { bar: Int }
           type Baz { bar: Int }
           type Bim { bar: Int }
           schema { query: Foo mutation: Bar subscription: Baz }`,
        );
      expect(Object.keys(extractTypeDefinitions(m).types.data)).toEqual(['Int', 'Bim']);
      // flow-disable-next-line
      expect(extractTypeDefinitions(m).schema.query.name).toEqual('Foo');
      // flow-disable-next-line
      expect(extractTypeDefinitions(m).schema.mutation.name).toEqual('Bar');
      // flow-disable-next-line
      expect(extractTypeDefinitions(m).schema.subscription.name).toEqual('Baz');
    });
  });

  describe('extractTypeExtensions', () => {
    it('should get type and refs', () => {
      const t: ObjectTypeDefinitionNode = (parse('extend type Test {id: ID}').definitions[0] : any).definition;
      const m = new Module('foo').withSchema('extend type Test {id: ID}');
      expect(stringify(extractTypeExtensions(m)))
        .toEqual(
          stringify(
            new FlattenedTypeGraph(
              new AppendableMap()
                .put(
                  'Test',
                  new Type('Test')
                    .withExtension(
                      new ExtensionDefinition(m, new NamedDefinitionNode('Test', t)),
                    )
                    .withTypeRef('ID'),
                )
                .put('ID', new Type('ID')),
            ),
          ),
        );
    });
  });
});
