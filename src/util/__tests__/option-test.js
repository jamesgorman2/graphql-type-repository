// @flow
/* eslint-env jest */

import {
  some,
  someOrNone,
  none,
} from '../option';

describe('option', () => {
  describe('some', () => {
    describe('isSome', () => {
      it('should return true', () => {
        expect(some(1).isSome()).toBeTruthy();
      });
    });
    describe('get', () => {
      it('should return value', () => {
        expect(some(1).get()).toEqual(1);
      });
    });
    describe('getOrElse', () => {
      it('should return base value', () => {
        expect(some(1).getOrElse(2)).toEqual(1);
      });
    });
    describe('toArray', () => {
      it('should return base value', () => {
        expect(some(1).toArray()).toEqual([1]);
      });
    });
    describe('map', () => {
      it('should return mapped value', () => {
        expect(some(1).map(i => i * 2).getOrElse(0)).toEqual(2);
      });
    });
    describe('flatMap', () => {
      it('should return mapped value', () => {
        expect(some(1).flatMap(i => some(i * 2)).getOrElse(0)).toEqual(2);
      });
      it('should return none if mapped to none', () => {
        expect(some(1).flatMap(_ => none)).toBe(none);
      });
    });
    describe('filter', () => {
      it('should return this when true', () => {
        const o = some(1);
        expect(o.filter(_ => true)).toBe(o);
      });
      it('should return none when false', () => {
        expect(some(1).filter(_ => false)).toBe(none);
      });
    });
    describe('or', () => {
      it('should return this', () => {
        expect(some(1).or(() => some(2)).get()).toEqual(1);
      });
    });
    describe('orSome', () => {
      it('should return this', () => {
        expect(some(1).orSome(2).get()).toEqual(1);
      });
    });
    describe('forEach', () => {
      it('should run function', () => {
        let i = 0;
        some(1).forEach((j) => { i = j; });
        expect(i).toEqual(1);
      });
    });
    describe('xor', () => {
      it('should return some if other none', () => {
        expect(some(1).xor(none).get()).toEqual(1);
      });
      it('should return none if other some', () => {
        expect(some(1).xor(some(2))).toBe(none);
      });
      it('should throw if error supplied and other is some', () => {
        expect(() => some(1).xor(some(2), () => new Error('Error')))
          .toThrow(/Error/);
      });
    });
    describe('ifNone', () => {
      it('should do nothing', () => {
        let i = 0;
        some(1).ifNone(() => { i = 1; });
        expect(i).toEqual(0);
      });
    });
  });
  describe('none', () => {
    describe('isSome', () => {
      it('should return false', () => {
        expect(none.isSome()).toBeFalsy();
      });
    });
    describe('get', () => {
      it('should throw', () => {
        expect(() => none.get()).toThrow();
      });
    });
    describe('getOrElse', () => {
      it('should return else value', () => {
        expect(none.getOrElse(2)).toEqual(2);
      });
    });
    describe('toArray', () => {
      it('should return empty array', () => {
        expect(none.toArray()).toEqual([]);
      });
    });
    describe('map', () => {
      it('should return mapped value', () => {
        expect(none.map(i => i * 2)).toBe(none);
      });
    });
    describe('flatMap', () => {
      it('should return none', () => {
        expect(none.flatMap(i => some(i * 2))).toBe(none);
      });
      it('should return none if mapped to none', () => {
        expect(none.flatMap(_ => none)).toBe(none);
      });
    });
    describe('or', () => {
      it('should return other', () => {
        expect(none.or(() => some(2)).get()).toEqual(2);
      });
      it('should return none', () => {
        expect(none.or(() => none)).toBe(none);
      });
    });
    describe('orSome', () => {
      it('should return other', () => {
        expect(none.orSome(2).get()).toEqual(2);
      });
    });
    it('should return none', () => {
      expect(none.filter(_ => false)).toBe(none);
    });
    describe('forEach', () => {
      it('should do nothing', () => {
        let i = 0;
        none.forEach((_) => { i = 2; });
        expect(i).toEqual(0);
      });
    });
  });
  describe('someOrNone', () => {
    it('should return none for null', () => {
      expect(someOrNone(null)).toBe(none);
    });
    it('should return none for undefined', () => {
      expect(someOrNone(undefined)).toBe(none);
    });
    it('should return some for value', () => {
      expect(someOrNone(1).get()).toEqual(1);
    });
  });
  describe('xor', () => {
    it('should return none if other none', () => {
      expect(none.xor(none)).toBe(none);
    });
    it('should return some if other some', () => {
      expect(none.xor(some(2)).get()).toEqual(2);
    });
    it('should throw if error supplied and other is some', () => {
      expect(none.xor(none, () => new Error('Error'))).toBe(none);
    });
  });
  describe('ifNone', () => {
    it('should execute callback', () => {
      let i = 0;
      none.ifNone(() => { i = 1; });
      expect(i).toEqual(1);
    });
  });
});
