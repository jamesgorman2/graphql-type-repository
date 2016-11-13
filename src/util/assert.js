// @flow

export function assert(test: boolean, msg: string): void {
  if (!test) {
    throw new Error(msg);
  }
}

export function assertNonEmptyString(o: any, msg: string): void {
  if (!o || typeof o !== 'string') {
    throw new Error(msg);
  }
}
