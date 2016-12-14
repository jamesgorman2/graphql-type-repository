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
export function appendSystemDirectives(graphIn: FlattenedTypeGraph): FlattenedTypeGraph {
  return specifiedDirectives.reduce(
    (graph, directive) => {
      const name = directive.name;
      if (graph.containsDirective(name)) {
        return graph.withDirective(new Directive(name).setIsSystem().withDirective(directive));
      }
      return graph;
    },
    graphIn,
  );
}
