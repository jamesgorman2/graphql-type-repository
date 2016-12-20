// @flow
/* eslint-env jest */

import {
  FlattenedTypeGraph,
  Directive,
  DirectiveDefinition,
} from '../../../graph';

import {
  Module,
} from '../../../config';

import { assertNoSystemDirectivesDefinedByUser } from '../assertNoSystemDirectivesDefinedByUser';

describe('assertNoSystemDirectivesDefinedByUser', () => {
  it('should ignore non system directives', () => {
    const g = new FlattenedTypeGraph()
      .withDirective(
        new Directive('foo')
          .withDefinition(
            new DirectiveDefinition(new Module('foo')),
          )
      );
    expect(assertNoSystemDirectivesDefinedByUser(g).errors).toEqual([]);
  });
  it('should ignore directive with system name if not flagged is system', () => {
    const g = new FlattenedTypeGraph()
      .withDirective(
        new Directive('skip')
          .withDefinition(
            new DirectiveDefinition(new Module('foo')),
          )
      );
    expect(assertNoSystemDirectivesDefinedByUser(g).errors).toEqual([]);
  });
  it('should report definitions', () => {
    const g = new FlattenedTypeGraph()
      .withDirective(
        new Directive('skip')
          .withDefinition(
            new DirectiveDefinition(new Module('foo')),
          )
          .setIsSystem()
      );
    expect(assertNoSystemDirectivesDefinedByUser(g).errors.map(e => e.message))
      .toEqual([
        'System directive @skip cannot be defined by user in module foo.',
      ]);
  });
});
