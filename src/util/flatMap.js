// @flow

export function flatMap<T, R>(ts: T[], f: (t: T) => R[]): T[] {
  return [].concat(...ts.map(f));
}
