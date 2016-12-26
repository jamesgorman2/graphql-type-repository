// @flow

import {
  DEFAULT_DEPRECATION_REASON,
  GraphQLDeprecatedDirective,
} from 'graphql';

import type {
  DirectiveNode,
  ValueNode,
} from 'graphql';

import {
  Option,
  some,
  someOrNone,
  none,
} from '../../util';

import { configConflictError } from './configConflictError';

function valueAsString(value: ValueNode): string {
  return value.value && typeof value.value === 'string' ?
    value.value : '';
}

function getReason(directive: DirectiveNode): Option<string> {
  return someOrNone(directive.arguments)
    .flatMap(
      args =>
        args.filter(argument => argument.name.value === 'reason')
          .map(argument => valueAsString(argument.value))
          .reduce(
            (acc, value) => acc.or(some(value)),
            none
          )
    );
}

export function getDeprecationReason(
  directives: Option<DirectiveNode[]>,
  deprecationReasonFromConfig: Option<string>,
  type: string,
  name: string,
  module: string
): Option<string> {
  return directives
    .flatMap(
      ds =>
        ds.filter(d => d.name.value === GraphQLDeprecatedDirective.name)
          .reduce(
            (acc, directive) =>
              acc.or(() => getReason(directive).orSome(DEFAULT_DEPRECATION_REASON)),
            none
          )
    )
    .xor(
      deprecationReasonFromConfig,
      configConflictError('deprecation', type, name, module)
    );
}
