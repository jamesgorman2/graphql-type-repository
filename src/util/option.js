// @flow

import type { Thunk } from 'graphql';
import { resolveThunk } from './resolveThunk';

export class Option<T> {
  isNone: () => boolean;
  isSome: () => boolean;
  map: <R>(f: (t: T) => R) => Option<R>; // eslint-disable-line no-undef
  flatMap: <R>(f: (t: T) => Option<R>) => Option<R>; // eslint-disable-line no-undef
  toArray: () => T[];
  filter: (f: (t: T) => boolean) => Option<T>;
  forEach: (f: (t: T) => void) => void;
  get: () => T;
  getOrElse: (_default: Thunk<T>) => T;
  or: (other: Thunk<Option<T>>) => Option<T>;
  orSome: (other: Thunk<T>) => Option<T>;
  xor: (other: Thunk<Option<T>>, error: ?() => Error) => Option<T>;
}

export class None<T> extends Option<T> {
  isNone: () => boolean =
    () => true;

  isSome: () => boolean =
    () => false;

  map: <R>(f: (t: T) => R) => Option<R> =  // eslint-disable-line no-undef
    _ => none; // eslint-disable-line no-use-before-define

  flatMap: <R>(f: (t: T) => Option<R>) => Option<R> =  // eslint-disable-line no-undef
    _ => none; // eslint-disable-line no-use-before-define

  toArray: () => T[] =
    () => [];

  filter: (f: (t: T) => boolean) => Option<T> =
    _ => none;  // eslint-disable-line no-use-before-define

  forEach: (f: (t: T) => void) => void =
    () => {};

  get: () => T =
    () => {
      throw new Error('Cannot get from None');
    }

  getOrElse: (_default: Thunk<T>) => T =
    _default => resolveThunk(_default);

  or: (other: Thunk<Option<T>>) => Option<T> =
    other => resolveThunk(other);

  orSome: (other: Thunk<T>) => Option<T> =
    other => some(resolveThunk(other));

  xor: (other: Thunk<Option<T>>, error: ?() => Error) => Option<T> =
    (other, _) => resolveThunk(other);
}

export class Some<T> extends Option<T> {
  t: T;

  constructor(t: T): void {
    super();
    this.t = t;
  }

  isNone: () => boolean =
    () => false;

  isSome: () => boolean =
    () => true;

  map: <R>(f: (t: T) => R) => Option<R> = // eslint-disable-line no-undef
  // flow-disable-next-line
    f => some(f(this.t));

  flatMap: <R>(f: (t: T) => Option<R>) => Option<R> = // eslint-disable-line no-undef
  // flow-disable-next-line
    f => f(this.t);

  toArray: () => T[] =
    () => [this.t];

  filter: (f: (t: T) => boolean) => Option<T> =
    f => (f(this.t) ? this : none);  // eslint-disable-line no-use-before-define

  forEach: (f: (t: T) => void) => void =
    f => f(this.t);

  get: () => T =
    () => this.t;

  getOrElse: (_default: Thunk<T>) => T =
    _ => this.t;

  or: (other: Thunk<Option<T>>) => Option<T> =
    _ => this;

  orSome: (other: Thunk<T>) => Option<T> =
    _ => this;

  xor: (other: Thunk<Option<T>>, error: ?() => Error) => Option<T> =
    (other, error) => {
      const o = resolveThunk(other);
      if (o.isSome()) {
        if (error) {
          throw error();
        }
        return none; // eslint-disable-line no-use-before-define
      }
      return this;
    };
}

export const none: Option<any> = new None();  // eslint-disable-line no-use-before-define
export function some<T>(t: T): Option<T> {
  return new Some(t);
}
export function someOrNone<T>(t: ?T): Option<T> {
  return t ? some(t) : none;
}
