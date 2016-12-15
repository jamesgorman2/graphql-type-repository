// @flow

export function flatMap<T, R>(ts: T[], f: (t: T) => R[]): R[] {
  return [].concat(...ts.map(f));
}
