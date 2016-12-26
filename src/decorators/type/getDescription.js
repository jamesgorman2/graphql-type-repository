// @flow

import type { ASTNode } from 'graphql';

import { getDescription as gqlGetdescription } from 'graphql/utilities/buildASTSchema';

import {
  Option,
  someOrNone,
} from '../../util';

import { configConflictError } from './configConflictError';

export function getDescription(
  node: ASTNode,
  descriptionFromConfig: Option<string>,
  type: string,
  name: string,
  module: string
): Option<string> {
  return someOrNone(gqlGetdescription(node)).xor(
    descriptionFromConfig,
    configConflictError('description', type, name, module)
  );
}
