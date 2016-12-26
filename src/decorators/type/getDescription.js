// @flow

import type { ASTNode } from 'graphql';

import { getDescription as gqlGetdescription } from 'graphql/utilities/buildASTSchema';

import {
  Option,
  someOrNone,
} from '../../util';

export function getDescription(node: ASTNode): Option<string> {
  return someOrNone(gqlGetdescription(node));
}
