// @flow

export function hasOwnProperty(o: any, p: string): boolean {
  return Object.prototype.hasOwnProperty.call(o, p);
}
