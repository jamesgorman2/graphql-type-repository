// @flow

import {
  specifiedDirectives,
} from 'graphql';

import {
  Directive,
  FlattenedTypeGraph,
} from '../../graph';

/**
 * Append all system directives used in the FlattenedTypeGraph.
 * Unused system directives will be ignored.
 */
export function appendSystemDirectives(graph: FlattenedTypeGraph): FlattenedTypeGraph {
  return specifiedDirectives.reduce(
    (g, directive) => {
      const name = directive.name;
      if (g.containsDirective(name)) {
        return g.withDirective(new Directive(name).isSystem().withDirective(directive));
      }
      return g;
    },
    graph,
  );
}
