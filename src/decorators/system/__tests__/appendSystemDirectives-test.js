// @flow
/* eslint-env jest */

import {
  GraphQLDeprecatedDirective,
} from 'graphql';

import {
  Module,
  ModuleRepository,
} from '../../../config';

import {
  FlattenedTypeGraph,
} from '../../../graph';

import {
  appendSystemDirectives,
} from '../appendSystemDirectives';

describe('appendSystemDirectives', () => {
  it('should append type', () => {
    const g = FlattenedTypeGraph.from(
      new ModuleRepository()
        .withModule(
          new Module('foo')
            .withSchema('type foo { id: ID @bar name: String @deprecated }')
        )
    );
    expect(appendSystemDirectives(g).directives.values().map(d => d.name))
      .toEqual(['bar', 'deprecated']);
    expect(
      appendSystemDirectives(g).directives.values()
        .map(d => d.directive)
        .filter(d => d.isSome())
        .map(d => d.get())
      )
      .toEqual([GraphQLDeprecatedDirective]);
  });
});
