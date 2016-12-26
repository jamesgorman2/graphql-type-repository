// @flow
/* eslint-env jest */

import {
  DEFAULT_DEPRECATION_REASON,
  GraphQLEnumType,
} from 'graphql';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import { generateTypes } from '../generateTypes';

describe('generateTypes', () => {
  it('should create basic enum', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A
                B
                C
              }`)
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: { },
        B: { },
        C: { },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should use description for enum from schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# description for E
              enum E {
                A
              }`
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      description: 'description for E',
      values: {
        A: { },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should use description for enum from config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A
              }`,
            {
              E: {
                description: 'description for E',
              },
            }
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      description: 'description for E',
      values: {
        A: { },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should error when description for enum supplied in both schema and config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `# description for E
              enum E {
                A
              }`,
            {
              E: {
                description: 'description for E',
              },
            }
            )
        )
    );
    expect(generateTypes(g).errors.map(error => error.message))
      .toEqual([
        'Description for enum E supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
  it('should use description for value from schema', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                # description for A
                A
              }`
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: {
          description: 'description for A',
        },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should use description for value from config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A
              }`,
            {
              E: {
                values: {
                  A: {
                    description: 'description for A',
                  },
                },
              },
            }
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: {
          description: 'description for A',
        },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should error when description for value supplied in both schema and config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                # description for A
                A
              }`,
            {
              E: {
                values: {
                  A: {
                    description: 'description for A',
                  },
                },
              },
            }
            )
        )
    );
    expect(generateTypes(g).errors.map(error => error.message))
      .toEqual([
        'Description for enum value E.A supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
  it('should use bare deprecated directive with default description', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A @deprecated
              }`
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: {
          deprecationReason: DEFAULT_DEPRECATION_REASON,
        },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should use reason from deprecated directive', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A @deprecated(reason: "very good reason")
              }`
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: {
          deprecationReason: 'very good reason',
        },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should use deprecationReason from config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A
              }`,
            {
              E: {
                values: {
                  A: {
                    deprecationReason: 'very good reason',
                  },
                },
              },
            }
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: {
          deprecationReason: 'very good reason',
        },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
  it('should throw when given deprecated directive and deprecationReason', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A @deprecated
              }`,
            {
              E: {
                values: {
                  A: {
                    deprecationReason: 'very good reason',
                  },
                },
              },
            }
            )
        )
    );
    expect(generateTypes(g).errors.map(error => error.message))
      .toEqual([
        'Deprecation for enum value E.A supplied in both schema and config in module foo. It must only be supplied in one of these locations.',
      ]);
  });
  it('should accept values from config', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema(
              `enum E {
                A
                B
                C
              }`,
            {
              E: {
                values: {
                  A: {
                    value: 5,
                  },
                  B: {
                    value: 'value',
                  },
                  C: {
                    value: {
                      a: [7],
                    },
                  },
                },
              },
            }
            )
        )
    );
    const t = new GraphQLEnumType({
      name: 'E',
      values: {
        A: {
          value: 5,
        },
        B: {
          value: 'value',
        },
        C: {
          value: {
            a: [7],
          },
        },
      },
    });
    expect(generateTypes(g).typeMap.getType('E'))
      .toEqual(t);
  });
});
