// @flow
/* eslint-env jest */

import {
  toEqualIgnoreFunctions,
} from '../../__tests__';

import {
  none,
  some,
} from '../option';

import {
  Either,
  left,
  right,
} from '../either';

expect.extend({ toEqualIgnoreFunctions });

describe('Either', () => {
  describe('reduce', () => {
    it('should return left value', () => {
      const e: Either<string, string> = left('foo');
      expect(Either.reduce(e)).toEqual('foo');
    });
    it('should return right value', () => {
      const e: Either<string, string> = right('foo');
      expect(Either.reduce(e)).toEqual('foo');
    });
  });
  describe('isLeft', () => {
    it('should return true for left', () => {
      expect(left(1).isLeft()).toBeTruthy();
    });
    it('should return false for right', () => {
      expect(right(1).isLeft()).toBeFalsy();
    });
  });
  describe('isRight', () => {
    it('should return true for right', () => {
      expect(right(1).isRight()).toBeTruthy();
    });
    it('should return false for left', () => {
      expect(left(1).isRight()).toBeFalsy();
    });
  });
  describe('either', () => {
    it('should return result for left', () => {
      expect(left(3).either(i => i + 1, i => i + 2)).toEqual(4);
    });
    it('should return result for right', () => {
      expect(right(3).either(i => i + 1, i => i + 2)).toEqual(5);
    });
  });
  describe('bimap', () => {
    it('should return result for left', () => {
      expect(left(3).bimap(i => i + 1, i => i + 2)).toEqualIgnoreFunctions(left(4));
    });
    it('should return result for right', () => {
      expect(right(3).bimap(i => i + 1, i => i + 2)).toEqualIgnoreFunctions(right(5));
    });
  });
  describe('swap', () => {
    it('should swap left to right', () => {
      expect(left(3).swap()).toEqualIgnoreFunctions(right(3));
    });
    it('should swap right to left', () => {
      expect(right(3).swap()).toEqualIgnoreFunctions(left(3));
    });
  });
  describe('left', () => {
    describe('either', () => {
      it('should return original either if left', () => {
        const e = left(1);
        expect(e.left().either()).toBe(e);
      });
      it('should return original either if right', () => {
        const e = right(1);
        expect(e.left().either()).toBe(e);
      });
    });
    describe('value', () => {
      it('should return value if left', () => {
        expect(left(2).left().value()).toEqual(2);
      });
      it('should throw if right', () => {
        expect(() => right(2).left().value()).toThrow();
      });
    });
    describe('orElse', () => {
      it('should return left if left', () => {
        expect(left(2).left().orElse(3)).toEqual(2);
      });
      it('should return other if right', () => {
        expect(right(2).left().orElse(3)).toEqual(3);
      });
    });
    describe('forEach', () => {
      it('should execute action if left', () => {
        let i = 1;
        left(1).left().forEach((_) => { i += 1; });
        expect(i).toEqual(2);
      });
      it('should do nothing if right', () => {
        let i = 1;
        right(1).left().forEach((_) => { i += 1; });
        expect(i).toEqual(1);
      });
    });
    describe('map', () => {
      it('should map if left', () => {
        expect(left(1).left().map(i => i + 1)).toEqualIgnoreFunctions(left(2));
      });
      it('should do nothing if right', () => {
        expect(right(1).left().map(i => i + 1)).toEqualIgnoreFunctions(right(1));
      });
    });
    describe('flatMap', () => {
      it('should map if left', () => {
        expect(left(1).left().flatMap(i => left(i + 1))).toEqualIgnoreFunctions(left(2));
      });
      it('should do nothing if right', () => {
        expect(right(1).left().flatMap(i => left(i + 1))).toEqualIgnoreFunctions(right(1));
      });
    });
    describe('toOption', () => {
      it('should return some if left', () => {
        expect(left(1).left().toOption()).toEqualIgnoreFunctions(some(1));
      });
      it('should return none if right', () => {
        expect(right(1).left().toOption()).toBe(none);
      });
    });
    describe('toArray', () => {
      it('should return array if left', () => {
        expect(left(1).left().toArray()).toEqual([1]);
      });
      it('should return empty if right', () => {
        expect(right(1).left().toArray()).toEqual([]);
      });
    });
  });
  describe('right', () => {
    describe('either', () => {
      it('should return original either if right', () => {
        const e = right(1);
        expect(e.right().either()).toBe(e);
      });
      it('should return original either if left', () => {
        const e = left(1);
        expect(e.right().either()).toBe(e);
      });
    });
    describe('value', () => {
      it('should return value if right', () => {
        expect(right(2).right().value()).toEqual(2);
      });
      it('should throw if left', () => {
        expect(() => left(2).right().value()).toThrow();
      });
    });
    describe('orElse', () => {
      it('should return right if right', () => {
        expect(right(2).right().orElse(3)).toEqual(2);
      });
      it('should return other if left', () => {
        expect(left(2).right().orElse(3)).toEqual(3);
      });
    });
    describe('forEach', () => {
      it('should execute action if right', () => {
        let i = 1;
        right(1).right().forEach((_) => { i += 1; });
        expect(i).toEqual(2);
      });
      it('should do nothing if left', () => {
        let i = 1;
        left(1).right().forEach((_) => { i += 1; });
        expect(i).toEqual(1);
      });
    });
    describe('map', () => {
      it('should map if right', () => {
        expect(right(1).right().map(i => i + 1)).toEqualIgnoreFunctions(right(2));
      });
      it('should do nothing if left', () => {
        expect(left(1).right().map(i => i + 1)).toEqualIgnoreFunctions(left(1));
      });
    });
    describe('flatMap', () => {
      it('should map if right', () => {
        expect(right(1).right().flatMap(i => right(i + 1))).toEqualIgnoreFunctions(right(2));
      });
      it('should do nothing if left', () => {
        expect(left(1).right().flatMap(i => right(i + 1))).toEqualIgnoreFunctions(left(1));
      });
    });
    describe('toOption', () => {
      it('should return some if right', () => {
        expect(right(1).right().toOption()).toEqualIgnoreFunctions(some(1));
      });
      it('should return none if left', () => {
        expect(left(1).right().toOption()).toBe(none);
      });
    });
    describe('toArray', () => {
      it('should return array if right', () => {
        expect(right(1).right().toArray()).toEqual([1]);
      });
      it('should return empty if left', () => {
        expect(left(1).right().toArray()).toEqual([]);
      });
    });
  });
});
