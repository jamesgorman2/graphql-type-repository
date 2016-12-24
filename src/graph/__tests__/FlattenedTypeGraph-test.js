// @flow
/* eslint-env jest */

import {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLID,
  GraphQLObjectType,
  parse,
} from 'graphql';

// eslint-disable-next-line no-duplicate-imports
import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import stringify from 'json-stable-stringify';

import {
  AppendableList,
  AppendableMap,
} from '../../util';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import {
  FlattenedTypeGraph,
  extractDirectiveDefinitions,
  extractDirectives,
  extractSchema,
  extractTypeDefinitions,
  extractTypeExtensions,
  extractTypes,
} from '../FlattenedTypeGraph';

import { DirectiveDefinition } from '../DirectiveDefinition';
import { ExtensionDefinition } from '../ExtensionDefinition';
import { SchemaDefinition } from '../SchemaDefinition';
import { Type } from '../Type';
import { TypeDefinition } from '../TypeDefinition';

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
      const t: any = parse('type Test {id: ID}').definitions[0];
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
                        new NamedDefinitionNode('Test', t),
                      ),
                    )
                    .withTypeRef('ID', m),
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
      expect(extractTypeDefinitions(m).schema.query.get().name).toEqual('Foo');
      expect(extractTypeDefinitions(m).schema.mutation.get().name).toEqual('Bar');
      expect(extractTypeDefinitions(m).schema.subscription.get().name).toEqual('Baz');
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
                    .withTypeRef('ID', m),
                )
                .put('ID', new Type('ID')),
            ),
          ),
        );
    });
    it('should extract schema type extensions to schema', () => {
      const m = new Module('foo')
        .withSchema(
          `extend type Foo { bar: Int }
           extend type Bar { bar: Int }
           extend type Baz { bar: Int }
           extend type Bim { bar: Int }
           schema { query: Foo mutation: Bar subscription: Baz }`,
        );
      expect(Object.keys(extractTypeExtensions(m).types.data)).toEqual(['Int', 'Bim']);
      expect(extractTypeExtensions(m).schema.query.get().name).toEqual('Foo');
      expect(extractTypeExtensions(m).schema.mutation.get().name).toEqual('Bar');
      expect(extractTypeExtensions(m).schema.subscription.get().name).toEqual('Baz');
    });
  });

  describe('extractDirectives', () => {
    it('should get directive', () => {
      const d = new GraphQLDirective({ name: 'bar', locations: [DirectiveLocation.FIELD] });
      const m = new Module('foo')
        .withDirective(d);
      expect(extractDirectives(m).directives.data.bar.name).toEqual('bar');
      expect(extractDirectives(m).directives.data.bar.definitions[0].module).toBe(m);
      expect(extractDirectives(m).directives.data.bar.definitions[0].directive.get()).toBe(d);
    });
  });

  describe('extractDirectiveDefinitionss', () => {
    it('should get directive', () => {
      const d: any = parse('directive @bar(baz: Boolean!) on FIELD').definitions[0];
      const m = new Module('foo')
        .withSchema('directive @bar(baz: Boolean!) on FIELD');
      expect(extractDirectiveDefinitions(m).directives.data.bar.name).toEqual('bar');
      expect(extractDirectiveDefinitions(m).directives.data.bar.definitions[0].module).toBe(m);
      expect(stringify(extractDirectiveDefinitions(m).directives.data.bar.definitions[0]))
        .toEqual(
          stringify(
            new DirectiveDefinition(m).withDefinition(
              new NamedDefinitionNode('bar', d),
            ),
          ),
        );
    });
  });

  describe('extractSchema', () => {
    it('should get definition', () => {
      const d: any = parse('schema @foo { query: bar }').definitions[0];
      const m = new Module('foo').withSchema('schema @foo { query: bar }');
      expect(extractSchema(m).schema.definitions)
        .toEqual([new SchemaDefinition(m, d)]);
    });
    it('should get directive refs', () => {
      const m = new Module('foo').withSchema('schema @foo { query: bar }');
      expect(stringify(extractSchema(m).schema.directiveRefs))
        .toEqual(
          stringify(new AppendableMap().put('foo', new AppendableList().push(m)))
        );
    });
  });
});
