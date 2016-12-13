// @flow

export function assert(test: boolean, msg: string): void {
  if (!test) {
    throw new Error(msg);
  }
}
