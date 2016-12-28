// @flow
/* eslint-env jest */

import {
  GraphQLID,
  GraphQLObjectType,
} from 'graphql';

import {
  toHaveErrors,
} from '../../__tests__';

import {
  ModuleRepository,
} from '../ModuleRepository';
import {
  Module,
} from '../Module';

expect.extend({ toHaveErrors });

const type: GraphQLObjectType = new GraphQLObjectType({
  name: 'Test',
  fields: {
    id: { type: GraphQLID },
  },
});

describe('', () => {
  describe('constructor', () => {
    it('should be empty when initialised', () => {
      expect(new ModuleRepository().isEmpty()).toEqual(true);
    });
  });
  describe('withModule', () => {
    it('should add new module', () => {
      const m = new Module('foo').withType(type);
      const r = new ModuleRepository();
      expect(r.withModule(m).modules).toEqual([m]);
    });
    it('should return new repository', () => {
      const m = new Module('foo').withType(type);
      const r = new ModuleRepository();
      expect(r.withModule(m)).not.toBe(r);
    });
    it('should not modify original module list', () => {
      const m = new Module('foo').withType(type);
      const r = new ModuleRepository();
      expect(r.withModule(m).modules).not.toEqual(r.modules);
    });
    it('should reject duplicate names', () => {
      const m1 = new Module('foo').withType(type);
      const m2 = new Module('foo').withType(type);
      const r = new ModuleRepository();
      expect(r.withModule(m1).withModule(m2))
        .toHaveErrors([/cannot add module with duplicate name 'foo'/]);
    });
    it('should not be empty after adding module', () => {
      const m = new Module('foo').withType(type);
      const r = new ModuleRepository();
      expect(r.withModule(m).isEmpty()).toEqual(false);
    });
    it('should reject empty module', () => {
      const m = new Module('foo');
      const r = new ModuleRepository();
      expect(r.withModule(m))
        .toHaveErrors([/cannot add empty module 'foo'/]);
    });
  });
});
