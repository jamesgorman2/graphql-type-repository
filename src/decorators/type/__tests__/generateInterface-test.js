// @flow
/* eslint-env jest */

import {
  GraphQLID,
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
  appendSystemTypes,
} from '../../system';

import {
  generateTypes,
} from '../generateTypes';

expect.extend({ toHaveErrors });

describe('generateInterface', () => {
  it('should create basic interface', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('interface I { id: ID }')
        )
    )
      .map(appendSystemTypes);
    expect(generateTypes(g).typeMap.getInterfaceType('I').name)
      .toEqual('I');
  });
  it('should use description from schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# description
              interface I { id: ID }`
            )
        )
    )
      .map(appendSystemTypes);
    expect(generateTypes(g).typeMap.getInterfaceType('I').description)
      .toEqual('description');
  });
  it('should use description from config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              'interface I { id: ID }',
            {
              I: {
                description: 'description',
              },
            }
            )
        )
    )
      .map(appendSystemTypes);
    expect(generateTypes(g).typeMap.getInterfaceType('I').description)
      .toEqual('description');
  });
  it('should error when description for supplied in both schema and config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# description
              interface I { id: ID }`,
            {
              I: {
                description: 'description',
              },
            }
            )
        )
    );
    expect(generateTypes(g))
      .toHaveErrors([
        'Description for interface I supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
  it('should attach basic field', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# description
              interface I { id: ID }`
            )
        )
    )
      .map(appendSystemTypes);
    expect(generateTypes(g).typeMap.getInterfaceType('I').getFields().id.type)
      .toBe(GraphQLID);
  });
  it('should attach argument map', () => {

  });
  it('should attach field resolver', () => {

  });
  it('should attach field description from schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `interface I {
                # an id
                id: ID
              }`
            )
        )
    )
      .map(appendSystemTypes);
    expect(generateTypes(g).typeMap.getInterfaceType('I').getFields().id.description)
      .toEqual('an id');
  });
  it('should attach field description from config', () => {

  });
  it('should error on field description from schema and config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `interface I {
                # an id
                id: ID
              }`,
            {
              I: {
                fields: {
                  id: {
                    description: 'an id',
                  },
                },
              },
            }
            )
        )
    )
      .map(appendSystemTypes);
    expect(generateTypes(g))
      .toHaveErrors([
        'Description for interface field I.id supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
  it('should attach field default deprecation reason from schema', () => {

  });
  it('should attach field deprecation reason from schema', () => {

  });
  it('should attach field deprecation reason from config', () => {

  });
  it('should error on field deprecation reason from schema and config', () => {

  });
  it('should append resolve type', () => {
    const r = (_1, _2, _3) => '';
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# description
              interface I { id: ID }`,
            {
              I: {
                resolveType: r,
              },
            }
            )
        )
    );
    expect(generateTypes(g).typeMap.getInterfaceType('I').resolveType).toBe(r);
  });
});
