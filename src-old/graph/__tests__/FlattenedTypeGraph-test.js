// @flow
/* eslint-env jest */

import {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLID,
  GraphQLObjectType,
  parse,
} from 'graphql';
import type {
  ObjectTypeDefinitionNode,
} from 'graphql';

import {
  toEqualIgnoreFunctions,
} from '../../__tests__';

import {
  Module,
  NamedDefinitionNode,
} from '../../config';

import {
  AppendableList,
  AppendableMap,
} from '../../util';
import {
  DirectiveDefinition,
} from '../DirectiveDefinition';
import {
  ExtensionDefinition,
} from '../ExtensionDefinition';

import {
  FlattenedTypeGraph,
  extractDirectiveDefinitions,
  extractDirectives,
  extractSchema,
  extractTypeDefinitions,
  extractTypeExtensions,
  extractTypes,
} from '../FlattenedTypeGraph';
import {
  SchemaDefinition,
} from '../SchemaDefinition';
import {
  Type,
} from '../Type';
import {
  TypeDefinition,
} from '../TypeDefinition';

expect.extend({ toEqualIgnoreFunctions });

// TODO test - append, directive refs, ???

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
      expect(extractTypes(m).types)
        .toEqualIgnoreFunctions(
          new AppendableMap()
            .put(
              'Test',
              new Type('Test').withDefinition(new TypeDefinition(m).withType(t)),
            )
        );
    });
  });

  describe('extractTypeDefinitions', () => {
    it('should get type and refs', () => {
      const t: any = parse('type Test {id(i: Int): ID}').definitions[0];
      const m = new Module('foo').withSchema('type Test {id(i: Int): ID}');
      expect(extractTypeDefinitions(m).types)
        .toEqualIgnoreFunctions(
          new AppendableMap()
            .put(
              'Test',
              new Type('Test')
                .withDefinition(
                  new TypeDefinition(m).withDefinition(
                    new NamedDefinitionNode('Test', t),
                  ),
                )
                .withTypeRef('Int', m)
                .withTypeRef('ID', m)
            )
            .put('ID', new Type('ID'))
            .put('Int', new Type('Int'))
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
      const t: ObjectTypeDefinitionNode =
        (parse('extend type Test {id(i: Int): ID}').definitions[0] : any).definition;
      const m = new Module('foo').withSchema('extend type Test {id(i: Int): ID}');
      expect(extractTypeExtensions(m).types)
        .toEqualIgnoreFunctions(
          new AppendableMap()
            .put(
              'Test',
              new Type('Test')
                .withExtension(
                  new ExtensionDefinition(m, new NamedDefinitionNode('Test', t)),
                )
                .withTypeRef('ID', m)
                .withTypeRef('Int', m),
            )
            .put('ID', new Type('ID'))
            .put('Int', new Type('Int'))
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
      expect(extractDirectiveDefinitions(m).directives.data.bar.definitions[0])
        .toEqualIgnoreFunctions(
          new DirectiveDefinition(m).withDefinition(
            new NamedDefinitionNode('bar', d),
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
      expect(extractSchema(m).schema.directiveRefs)
        .toEqualIgnoreFunctions(
          new AppendableMap().put('foo', new AppendableList().push(m))
        );
    });
  });
});
