// @flow
/* eslint-env jest */

import {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLError,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  parse,
} from 'graphql';

// eslint-disable-next-line no-duplicate-imports
import type {
  DefinitionNode,
  DocumentNode,
  GraphQLNamedType,
  SchemaDefinitionNode,
} from 'graphql';

import { Module } from '../Module';

describe('module', () => {
  describe('constructor', () => {
    it('should require name', () => {
      // flow-disable-next-line
      expect(() => new Module())
        .toThrowError(/Parameter name must be a non-empty string\./);
    });
    it('should reject undefined name', () => {
      // flow-disable-next-line
      expect(() => new Module(undefined))
        .toThrowError(/Parameter name must be a non-empty string\./);
    });
    it('should reject null name', () => {
      // flow-disable-next-line
      expect(() => new Module(null))
        .toThrowError(/Parameter name must be a non-empty string\./);
    });
    it('should reject non-string name', () => {
      // flow-disable-next-line
      expect(() => new Module(5))
        .toThrowError(/Parameter name must be a non-empty string\./);
    });
    it('should be empty when no values added', () => {
      expect(() => new Module('foo').isEmpty()).toBeTruthy();
    });
  });

  describe('withType', () => {
    it('should return a new object', () => {
      const m = new Module('foo');
      const t = new GraphQLObjectType({
        name: 'Test',
        fields: {
          id: { type: GraphQLID },
        },
      });
      expect(m.withType(t)).not.toBe(m);
    });
    it('should add given type', () => {
      const m = new Module('foo');
      const t = new GraphQLObjectType({
        name: 'Test',
        fields: {
          id: { type: GraphQLID },
        },
      });
      expect(m.withType(t).types).toEqual([t]);
    });
    it('should not mmodify orignal types list', () => {
      const m = new Module('foo');
      const t = new GraphQLObjectType({
        name: 'Test',
        fields: {
          id: { type: GraphQLID },
        },
      });
      const mNew = m.withType(t);
      expect(mNew.types).not.toBe(m.types);
      expect(mNew.types).not.toEqual(m.types);
    });
    it('should not be empty after adding type', () => {
      const m = new Module('foo');
      const t = new GraphQLObjectType({
        name: 'Test',
        fields: {
          id: { type: GraphQLID },
        },
      });
      expect(m.withType(t).isEmpty()).toBeFalsy();
    });
    it('should reject null type', () => {
      const m = new Module('foo');
      const t: GraphQLNamedType = (null: any);
      expect(m.withType(t).errors[0].message).toMatch(/Parameter type must be a GraphQLNamedType\./);
    });
    it('should reject undefined type', () => {
      const m = new Module('foo');
      const t: GraphQLNamedType = (undefined: any);
      expect(m.withType(t).errors[0].message).toMatch(/Parameter type must be a GraphQLNamedType\./);
    });
    it('should reject not a type', () => {
      const m = new Module('foo');
      const t: GraphQLNamedType = ('type': any);
      expect(m.withType(t).errors[0].message).toMatch(/Parameter type must be a GraphQLNamedType\./);
    });
    it('should reject unnamed type', () => {
      const m = new Module('foo');
      const t: GraphQLNamedType = new GraphQLList(
        new GraphQLObjectType({
          name: 'Test',
          fields: {
            id: { type: GraphQLID },
          },
        }),
      );
      expect(m.withType(t).errors[0].message).toMatch(/Parameter type must be a GraphQLNamedType\./);
    });
    it('should throw duplicate type name', () => {
      const m = new Module('foo');
      const t1 = new GraphQLObjectType({
        name: 'Test',
        fields: {
          id: { type: GraphQLID },
        },
      });
      const t2 = new GraphQLObjectType({
        name: 'Test',
        fields: {
          id: { type: GraphQLID },
        },
      });
      expect(m.withType(t1).withType(t2).errors[0].message)
        .toMatch(/Cannot add type with duplicate name 'Test'\./);
    });
  });

  describe('withDirective', () => {
    it('should return a new object', () => {
      const m = new Module('foo');
      const d = new GraphQLDirective({ name: 'foo', locations: [DirectiveLocation.FIELD] });
      expect(m.withDirective(d)).not.toBe(m);
    });
    it('should add given directive', () => {
      const m = new Module('foo');
      const d = new GraphQLDirective({ name: 'foo', locations: [DirectiveLocation.FIELD] });
      expect(m.withDirective(d).directives[0]).toBe(d);
    });
    it('should not modify orignal directives list', () => {
      const m = new Module('foo');
      const d = new GraphQLDirective({ name: 'foo', locations: [DirectiveLocation.FIELD] });
      const mNew = m.withDirective(d);
      expect(mNew.directives).not.toBe(m.directives);
      expect(mNew.directives).not.toEqual(m.directives);
    });
    it('should not be empty after adding directive', () => {
      const m = new Module('foo');
      const d = new GraphQLDirective({ name: 'foo', locations: [DirectiveLocation.FIELD] });
      expect(m.withDirective(d).isEmpty()).toBeFalsy();
    });
    it('should reject null directive', () => {
      const m = new Module('foo');
      const d: GraphQLDirective = (null: any);
      expect(m.withDirective(d).errors[0].message).toMatch(/Parameter directive must be a GraphQLDirective\./);
    });
    it('should reject undefined directive', () => {
      const m = new Module('foo');
      const d: GraphQLDirective = (undefined : any);
      expect(m.withDirective(d).errors[0].message).toMatch(/Parameter directive must be a GraphQLDirective\./);
    });
    it('should reject not a directive', () => {
      const m = new Module('foo');
      const d: GraphQLDirective = ('type' : any);
      expect(m.withDirective(d).errors[0].message).toMatch(/Parameter directive must be a GraphQLDirective\./);
    });
    it('should throw duplicate directive name', () => {
      const m = new Module('foo');
      const d1 = new GraphQLDirective({ name: 'foo', locations: [DirectiveLocation.FIELD] });
      const d2 = new GraphQLDirective({ name: 'foo', locations: [DirectiveLocation.FRAGMENT_SPREAD] });
      expect(m.withDirective(d1).withDirective(d2).errors[0].message)
        .toMatch(/Cannot add directive with duplicate name 'foo'\./);
    });
  });

  describe('withDefinitionNode', () => {
    it('should return a new object', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int }').definitions[0];
      expect(m.withDefinitionNode(n)).not.toBe(m);
    });
    it('should accept new node', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int }').definitions[0];
      expect(m.withDefinitionNode(n).typeDefinitionNodes[0].name).toEqual('Foo');
    });
    it('should not be empty after adding node', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int }').definitions[0];
      expect(m.withDefinitionNode(n).isEmpty()).toBeFalsy();
    });
    it('should not be empty after adding extension node', () => {
      const m = new Module('foo');
      const n = parse('extend type Foo { bar: Int }').definitions[0];
      expect(m.withDefinitionNode(n).isEmpty()).toBeFalsy();
    });
    it('should not be empty after adding directive node', () => {
      const m = new Module('foo');
      const n = parse('directive @skip(if: Boolean!) on FIELD').definitions[0];
      expect(m.withDefinitionNode(n).isEmpty()).toBeFalsy();
    });
    it('should not be empty after adding schema node', () => {
      const m = new Module('foo');
      const n = parse('schema { query: Query }').definitions[0];
      expect(m.withDefinitionNode(n).isEmpty()).toBeFalsy();
    });
    it('should reject duplicate type name', () => {
      const m = new Module('foo');
      const n1 = parse('type Foo { bar: Int }').definitions[0];
      const n2 = parse('type Foo { baz: Int }').definitions[0];
      expect(m.withDefinitionNode(n1).withDefinitionNode(n2).errors[0].message)
        .toMatch(/Cannot add type with duplicate name 'Foo'\./);
    });
    it('should accept duplicate extension nodes', () => {
      const n1 = parse('type Foo { bar: Int }').definitions[0];
      const n2 = parse('extend type Foo { baz: Int }').definitions[0];
      const n3 = parse('extend type Foo { bam: Int }').definitions[0];
      const m = new Module('foo').withDefinitionNode(n1).withDefinitionNode(n2).withDefinitionNode(n3);
      expect(m.typeDefinitionNodes[0].name).toEqual('Foo');
      expect(m.extensionDefinitionNodes[0].name).toEqual('Foo');
      expect(m.extensionDefinitionNodes[1].name).toEqual('Foo');
    });
    it('should accept optional resolver', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int }').definitions[0];
      const r = { fields: {} };
      expect(m.withDefinitionNode(n, r).typeDefinitionNodes[0].resolvers.get()).toBe(r);
    });
    it('should accept schema', () => {
      const n = parse('schema { query: Query }').definitions[0];
      const t: SchemaDefinitionNode = new Module('foo').withDefinitionNode(n).schemaDefinitionNode.get();
      expect(t.operationTypes[0].type.name.value).toEqual('Query');
    });
    it('should accept directive', () => {
      const n = parse('directive @skip(if: Boolean!) on FIELD').definitions[0];
      expect(new Module('foo').withDefinitionNode(n).directiveDefinitionNodes[0].definition.name.value)
        .toEqual('skip');
    });
    it('should reject duplicate directive name', () => {
      const m = new Module('foo');
      const n1 = parse('directive @skip(if: Boolean!) on FIELD').definitions[0];
      const n2 = parse('directive @skip(if: Boolean!) on FRAGMENT_SPREAD ').definitions[0];
      expect(m.withDefinitionNode(n1).withDefinitionNode(n2).errors[0].message)
        .toMatch(/Cannot add directive with duplicate name 'skip'\./);
    });
    it('should reject non-TypeSystemDefinitionNode', () => {
      const m = new Module('foo');
      const n = parse('mutation likeStory { like(story: 123) @defer { story { id } } }').definitions[0];
      expect(m.withDefinitionNode(n).errors[0].message)
        .toMatch(/Parameter node must be a TypeSystemDefinitionNode\./);
    });
    it('should reject non-DefinitionNode', () => {
      const m = new Module('foo');
      const n: DefinitionNode = ('foo': any);
      expect(m.withDefinitionNode(n).errors[0].message)
        .toMatch(/Parameter node must be a TypeSystemDefinitionNode\./);
    });
  });

  describe('withDocumentNode', () => {
    it('should return a new object', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int }');
      expect(m.withDocumentNode(n)).not.toBe(m);
    });
    it('should add all child nodes', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int } type Bar { bar: Int }');
      expect(m.withDocumentNode(n).typeDefinitionNodes[0].name).toEqual('Foo');
      expect(m.withDocumentNode(n).typeDefinitionNodes[1].name).toEqual('Bar');
    });
    it('should accept optional resolvers', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int } type Bar { bar: Int }');
      const r = { fields: {} };
      const rs = { Foo: r };
      expect(m.withDocumentNode(n, rs).typeDefinitionNodes[0].resolvers.get()).toBe(r);
      expect(m.withDocumentNode(n, rs).typeDefinitionNodes[1].resolvers.isNone()).toBeTruthy();
    });
    it('should reject duplicate names', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int } type Foo { baz: Int }');
      expect(m.withDocumentNode(n).errors[0].message)
        .toMatch(/Cannot add type with duplicate name 'Foo'\./);
    });
    it('should reject unnamed types', () => {
      const m = new Module('foo');
      const n = parse('mutation likeStory { like(story: 123) @defer { story { id } } }');
      expect(m.withDocumentNode(n).errors[0].message)
        .toMatch(/Parameter node must be a TypeSystemDefinitionNode\./);
    });
    it('should accept schema', () => {
      const n = parse('schema { query: Query }');
      const t: SchemaDefinitionNode = new Module('foo').withDocumentNode(n).schemaDefinitionNode.get();
      expect(t.operationTypes[0].type.name.value).toEqual('Query');
    });
    it('should reject non-DocumentNote', () => {
      const m = new Module('foo');
      const n: DocumentNode = ('foo': any);
      expect(m.withDocumentNode(n).errors[0].message)
        .toMatch(/Parameter node must be a DocumentNode\./);
    });
    it('should reject resolvers with no matching type', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int } type Bar { bar: Int }');
      const r = { fields: {} };
      const rs = { Foo: r, Baz: r };
      expect(m.withDocumentNode(n, rs).errors[0].message)
        .toMatch(/Cannot add resolver 'Baz' with no matching type\./);
    });
    it('should reject resolvers with no matching type', () => {
      const m = new Module('foo');
      const n = parse('type Foo { bar: Int } type Bar { bar: Int }');
      const r = { fields: {} };
      const rs = { Foo: r, Baz: r, Bim: r };
      expect(m.withDocumentNode(n, rs).errors[0].message)
        .toMatch(/Cannot add resolvers 'Baz', 'Bim' with no matching types\./);
    });
  });

  describe('withSchema', () => {
    it('should return a new object', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int }';
      expect(m.withSchema(n)).not.toBe(m);
    });
    it('should add all child nodes', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int } type Bar { bar: Int }';
      expect(m.withSchema(n).typeDefinitionNodes[0].name).toEqual('Foo');
      expect(m.withSchema(n).typeDefinitionNodes[1].name).toEqual('Bar');
    });
    it('should accept optional resolvers', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int } type Bar { bar: Int }';
      const r = { fields: {} };
      const rs = { Foo: r };
      expect(m.withSchema(n, rs).typeDefinitionNodes[0].resolvers.get()).toBe(r);
      expect(m.withSchema(n, rs).typeDefinitionNodes[1].resolvers.isNone()).toBeTruthy();
    });
    it('should reject malformed schema', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int ';
      expect(m.withSchema(n).errors[0]).toBeInstanceOf(GraphQLError);
    });
    it('should reject duplicate names', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int } type Foo { baz: Int }';
      expect(m.withSchema(n).errors[0].message)
        .toMatch(/Cannot add type with duplicate name 'Foo'\./);
    });
    it('should reject resolvers with no matching type', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int } type Bar { bar: Int }';
      const r = { fields: {} };
      const rs = { Foo: r, Baz: r };
      expect(m.withSchema(n, rs).errors[0].message)
        .toMatch(/Cannot add resolver 'Baz' with no matching type\./);
    });
    it('should reject resolvers with no matching type', () => {
      const m = new Module('foo');
      const n = 'type Foo { bar: Int } type Bar { bar: Int }';
      const r = { fields: {} };
      const rs = { Foo: r, Baz: r, Bim: r };
      expect(m.withSchema(n, rs).errors[0].message)
        .toMatch(/Cannot add resolvers 'Baz', 'Bim' with no matching types\./);
    });
    it('should reject empty string', () => {
      expect(new Module('foo').withSchema('').errors[0].message)
        .toMatch(/schema must be a non-empty string/);
    });
    it('should reject null string', () => {
      const s: string = (null: any);
      expect(new Module('foo').withSchema(s).errors[0].message)
        .toMatch(/schema must be a non-empty string/);
    });
  });
});
