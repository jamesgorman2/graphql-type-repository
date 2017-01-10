// @flow

import { GraphQLTypeError } from './GraphQLTypeError';

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function configConflictError(
  field: string,
  type: string,
  name: string,
  module: string
): () => GraphQLTypeError {
  return () =>
    new GraphQLTypeError(
      `${titleCase(field)} for ${type} ${name} supplied in both schema and config in module ${module}. It must only be supplied in one of these locations.`
    );
}
