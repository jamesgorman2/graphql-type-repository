// @flow

import type { ASTNode } from 'graphql';

import { getDescription as gqlGetDescription } from 'graphql/utilities/buildASTSchema';

import {
  Option,
  Try,
  someOrNone,
} from '../../util';

import { configConflictError } from './configConflictError';

export function getDescription(
  node: ASTNode,
  descriptionFromConfig: Option<string>,
  type: string,
  name: string,
  module: string
): Try<Option<string>> {
  return Try.of(() =>
    someOrNone(gqlGetDescription(node)).xor(
      descriptionFromConfig,
      configConflictError('description', type, name, module)
    )
  );
}

export function getDescriptionObject(
  node: ASTNode,
  descriptionFromConfig: Option<string>,
  type: string,
  name: string,
  module: string
): Try<{ description?: ?string }> {
  return getDescription(node, descriptionFromConfig, type, name, module)
    .map(
      o =>
        o.map(d => ({ description: d }))
          .getOrElse({})
    );
}
