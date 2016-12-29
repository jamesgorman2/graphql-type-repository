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
  Try,
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
): Try<Option<string>> {
  return Try.of(() =>
    directives
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
      )
  );
}

export function getDeprecationReasonObject(
  directives: Option<DirectiveNode[]>,
  deprecationReasonFromConfig: Option<string>,
  type: string,
  name: string,
  module: string
): Try<{ deprecationReason?: ?string }> {
  return getDeprecationReason(directives, deprecationReasonFromConfig, type, name, module)
    .map(
      o =>
        o.map(d => ({ deprecationReason: d }))
          .getOrElse({})
    );
}
