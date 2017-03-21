// @flow

import type {
  Thunk,
} from 'graphql';

import {
  Option,
  none,
  some,
} from './option';

import {
  resolveThunk,
} from './resolveThunk';

export class Either<L, R> {
  static reduce<T>(e: Either<T, T>): T {
    return e.either(l => l, r => r);
  }

  isLeft: () => boolean;
  isRight: () => boolean;
  either: <X>(fl: (l: L) => X, fr: (r: R) => X) => X; // eslint-disable-line no-undef

  left: () => LeftProjection<L, R> =
    () => new LeftProjection(this);
  right: () => RightProjection<L, R> =
    () => new RightProjection(this);

  bimap: <X, Y>(fl: (l: L) => X, fr: (r: R) => Y) => Either<X, Y> = // eslint-disable-line no-undef
    (fl, fr) => // eslint-disable-line no-undef
      this.either(
        l => (left(fl(l)): Either<any, any>),
        r => (right(fr(r)): Either<any, any>)
      );

  mapReduce: <X>(fl: (l: L) => X, fr: (r: R) => X) => X = // eslint-disable-line no-undef
    (fl, fr) =>
      Either.reduce((this.bimap(fl, fr): Either<any, any>));

  swap: () => Either<R, L> =
    () =>
      this.either(
        l => right(l),
        r => left(r)
      );
}

export class Left<L, R> extends Either<L, R> {
  l: L;

  constructor(l: L) {
    super();
    this.l = l;
  }

  isLeft: () => boolean =
    () => true;

  isRight: () => boolean =
    () => false;

  either: <X>(fl: (l: L) => X, fr: (r: R) => X) => X = // eslint-disable-line no-undef
    (fl, _) => (fl(this.l): any);
}

export class Right<L, R> extends Either<L, R> {
  r: R;

  constructor(r: R) {
    super();
    this.r = r;
  }

  isLeft: () => boolean =
    () => false;

  isRight: () => boolean =
    () => true;

  either: <X>(fl: (l: L) => X, fr: (r: R) => X) => X = // eslint-disable-line no-undef
    (_, fr) => (fr(this.r): any);
}

export class LeftProjection<L, R> {
  e: Either<L, R>;

  constructor(e: Either<L, R>) {
    this.e = e;
  }

  either: () => Either<L, R> =
    () => this.e;

  value: () => L =
    () => {
      if (this.e.isLeft()) {
        return (this.e: any).l;
      }
      throw new Error('Cannot get left value from a Right');
    };

  orElse: (other: Thunk<L>) => L =
    other => (
      this.e.isLeft() ? (this.e: any).l : resolveThunk(other)
    );

  forEach: (f: (l: L) => void) => void =
    (f) => {
      if (this.e.isLeft()) {
        f(this.value());
      }
    };

  map: <X>(f: (l: L) => X) => Either<X, R> = // eslint-disable-line no-undef
    f => (
      this.e.isLeft() ?
        (left(f(this.value())): Either<any, any>) :
        (this.e: Either<any, any>)
    );

  flatMap: <X>(f: (l: L) => Either<X, R>) => Either<X, R> = // eslint-disable-line no-undef
    f => (
      this.e.isLeft() ?
        (f(this.value()): Either<any, any>) :
        (this.e: Either<any, any>)
    );

  toOption: () => Option<L> =
    () => (
      this.e.isLeft() ?
        some(this.value()) :
        none
    );

  toArray: () => L[] =
    () => this.toOption().toArray();
}


export class RightProjection<L, R> {
  e: Either<L, R>;

  constructor(e: Either<L, R>) {
    this.e = e;
  }

  either: () => Either<L, R> =
    () => this.e;

  value: () => R =
    () => {
      if (this.e.isRight()) {
        return (this.e: any).r;
      }
      throw new Error('Cannot get right value from a Left');
    };

  orElse: (other: Thunk<R>) => R =
    other => (
      this.e.isRight() ? (this.e: any).r : resolveThunk(other)
    );

  forEach: (f: (l: R) => void) => void =
    (f) => {
      if (this.e.isRight()) {
        f(this.value());
      }
    };

  map: <X>(f: (r: R) => X) => Either<L, X> = // eslint-disable-line no-undef
    f => (
      this.e.isRight() ?
        (right(f(this.value())): Either<any, any>) :
        (this.e: Either<any, any>)
    );

  flatMap: <X>(f: (r: R) => Either<L, X>) => Either<L, X> = // eslint-disable-line no-undef
    f => (
      this.e.isRight() ?
        (f(this.value()): Either<any, any>) :
        (this.e: Either<any, any>)
    );

  toOption: () => Option<R> =
    () => (
      this.e.isRight() ?
        some(this.value()) :
        none
    );

  toArray: () => R[] =
    () => this.toOption().toArray();
}

export function left<L, R>(l: L): Either<L, R> {
  return new Left(l);
}

export function right<L, R>(r: R): Either<L, R> {
  return new Right(r);
}
