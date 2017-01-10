// @flow

import {
  Try,
} from './Try';

export function assert(test: boolean, msg: string): Try<void> {
  if (!test) {
    return Try.failure(new Error(msg));
  }
  return Try.success();
}
