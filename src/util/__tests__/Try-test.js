// @flow
/* eslint-env jest */

import {
  toEqualIgnoreFunctions,
  toHaveErrors,
} from '../../__tests__';

import {
  left,
  right,
} from '../either';

import {
  Try,
} from '../Try';

expect.extend({ toEqualIgnoreFunctions, toHaveErrors });

const success = Try.success;
const failure = Try.failure;

describe('Try', () => {
  describe('of', () => {
    it('should return success of value', () => {
      expect(Try.of(1)).toEqualIgnoreFunctions(success(1));
    });
    it('should return success of function', () => {
      expect(Try.of(() => 1)).toEqualIgnoreFunctions(success(1));
    });
    it('should return failure of function that throws', () => {
      expect(Try.of(() => { throw new Error('foo'); }))
       .toEqualIgnoreFunctions(failure(new Error('foo')));
    });
  });
  describe('Success', () => {
    describe('isSuccess', () => {
      it('should be true', () => {
        expect(success(1).isSuccess()).toBeTruthy();
      });
    });
    describe('map', () => {
      it('should map', () => {
        expect(success(1).map(i => i + 1)).toEqualIgnoreFunctions(success(2));
      });
      it('should return failure if map throws', () => {
        expect(success(1).map((_) => { throw new Error('foo'); }))
          .toEqualIgnoreFunctions(failure(new Error('foo')));
      });
    });
    describe('flatMap', () => {
      it('should map', () => {
        expect(success(1).flatMap(i => success(i + 1)))
          .toEqualIgnoreFunctions(success(2));
      });
      it('should return failure if map throws', () => {
        expect(success(1).flatMap(_ => failure(new Error('foo'))))
          .toEqualIgnoreFunctions(failure(new Error('foo')));
      });
    });
    describe('mergeWith', () => {
      it('should merge', () => {
        expect(Try.of(1).mergeWith(Try.of(2), (a, b) => a + b))
          .toEqualIgnoreFunctions(Try.of(3));
      });
      it('should return failure if merge throws', () => {
        expect(Try.of(1).mergeWith(Try.of(2), (_1, _2) => { throw new Error('foo'); }))
          .toEqualIgnoreFunctions(failure(new Error('foo')));
      });
      it('should return failure if other is failure', () => {
        expect(
          Try.of(1).mergeWith(
            failure(new Error('foo')),
            (_1, _2) => { throw new Error('foo'); }
          )
        )
          .toEqualIgnoreFunctions(failure(new Error('foo')));
      });
    });
    describe('toEither', () => {
      it('should return left', () => {
        expect(Try.of(1).toEither()).toEqualIgnoreFunctions(left(1));
      });
    });
  });
  describe('Failure', () => {
    describe('isSuccess', () => {
      it('should be false', () => {
        expect(failure(new Error('foo')).isSuccess()).toBeFalsy();
      });
    });
    describe('map', () => {
      it('should do nothing', () => {
        const f = failure(new Error('foo'));
        expect(f.map(i => i + 1)).toBe(f);
      });
    });
    describe('flatMap', () => {
      it('should do nothing', () => {
        const f = failure(new Error('foo'));
        expect(f.flatMap(i => i + 1)).toBe(f);
      });
    });
    describe('mergeWith', () => {
      it('should merge', () => {
        const f1 = failure(new Error('foo'));
        const f2 = failure(new Error('bar'));
        expect(f1.mergeWith(f2, (a, b) => a + b))
          .toHaveErrors([
            'foo',
            'bar',
          ]);
      });
      it('should do nothing if other is success', () => {
        const f = failure(new Error('foo'));
        expect(f.mergeWith(Try.of(2), (_1, _2) => { throw new Error('foo'); })).toBe(f);
      });
    });
    describe('toEither', () => {
      it('should return right', () => {
        expect(failure(new Error('foo')).toEither())
          .toEqualIgnoreFunctions(right([new Error('foo')]));
      });
    });
  });
});
