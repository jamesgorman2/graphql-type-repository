// @flow


import type { Thunk } from 'graphql';

import {
  CompositeError,
} from './CompositeError';
import {
  Either,
  left,
  right,
} from './either';
import { resolveThunk } from './resolveThunk';

function maybeCompositeError(errors: Error[]) {
  if (errors.length === 0) {
    throw new Error();
  }
  if (errors.length === 1) {
    throw errors[0];
  }
  throw new CompositeError(errors);
}

export class Try<T> {

  static of<R>(r: Thunk<R>): Try<R> {
    try {
      return Try.success(resolveThunk(r));
    } catch (e) {
      return Try.failure(e);
    }
  }
  static success<R>(r: R) : Try<R> {
    return new Success(r);
  }
  static failure<R>(error: Error): Try<R> {
    return new Failure([error]);
  }
  isSuccess: () => boolean;
  map: <R>(f: (t: T) => R) => Try<R>; // eslint-disable-line no-undef
  flatMap: <R>(f: (t: T) => Try<R>) => Try<R>; // eslint-disable-line no-undef
  // eslint-disable-next-line no-undef
  mergeWith: <T1, R>(other: Try<T1>, f: (t: T, t1: T1) => R) => Try<R>;
  toEither: () => Either<T, Error[]>;
  throw: () => void;
}

export class Success<T> extends Try<T> {
  t: T;

  constructor(t: T): void {
    super();
    this.t = t;
  }

  isSuccess: () => boolean =
    () => true;

  map: <R>(f: (t: T) => R) => Try<R> = // eslint-disable-line no-undef
  // flow-disable-next-line
    f => Try.of(() => f(this.t));

  flatMap: <R>(f: (t: T) => Try<R>) => Try<R> = // eslint-disable-line no-undef
  // flow-disable-next-line
    f => f(this.t);

  // eslint-disable-next-line no-undef
  mergeWith: <T1, R>(other: Try<T1>, f: (t: T, t1: T1) => R) => Try<R> =
  // flow-disable-next-line
    (other, f) => (
      other.isSuccess() ?
        Try.of(() => f(this.t, (other: any).t)) :
        other
    );

  toEither: () => Either<T, Error[]> =
    () => left(this.t);

  throw: () => void =
    () => {};
}

export class Failure<T> extends Try<T> {
  errors: Error[];

  constructor(errors: Error[]): void {
    super();
    this.errors = errors;
  }

  isSuccess: () => boolean =
    () => false;

  map: <R>(f: (t: T) => R) => Try<R> = // eslint-disable-line no-undef
    _ => (this: Try<any>);

  flatMap: <R>(f: (t: T) => Try<R>) => Try<R> = // eslint-disable-line no-undef
    _ => (this: Try<any>);

  // eslint-disable-next-line no-undef
  mergeWith: <T1, R>(other: Try<T1>, f: (t: T, t1: T1) => R) => Try<R> =
  // flow-disable-next-line
    (other, _) => (
      other.isSuccess() ?
        (this: Try<any>) : // eslint-disable-line no-undef
        new Failure([...this.errors, ...(other: any).errors])
    );

  toEither: () => Either<T, Error[]> =
    () => right(this.errors);

  throw: () => void =
    () => { throw maybeCompositeError(this.errors); };
}
