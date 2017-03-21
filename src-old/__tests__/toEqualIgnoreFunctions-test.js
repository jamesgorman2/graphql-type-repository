// @flow
/* eslint-env jest */

import {
  toEqualIgnoreFunctions,
} from './toEqualIgnoreFunctions';

expect.extend({ toEqualIgnoreFunctions });

describe('toEqualIgnoreFunctions', () => {
  it('should pass null', () => {
    expect(null).toEqualIgnoreFunctions(null);
  });
  it('should pass undefined', () => {
    expect(undefined).toEqualIgnoreFunctions(undefined);
  });
  it('should pass string', () => {
    expect('s').toEqualIgnoreFunctions('s');
  });
  it('should pass number', () => {
    expect(1).toEqualIgnoreFunctions(1);
  });
  it('should pass boolean', () => {
    expect(true).toEqualIgnoreFunctions(true);
  });
  it('should pass empty object', () => {
    expect({}).toEqualIgnoreFunctions({});
  });
  it('should pass empty array', () => {
    expect([]).toEqualIgnoreFunctions([]);
  });
  it('should pass simple object', () => {
    expect({ a: 'a' }).toEqualIgnoreFunctions({ a: 'a' });
  });
  it('should pass simple array', () => {
    expect([1]).toEqualIgnoreFunctions([1]);
  });
  it('should pass simple functon', () => {
    expect(i => i).toEqualIgnoreFunctions(() => 1);
  });

  it('should fail string', () => {
    expect(() => expect('s').toEqualIgnoreFunctions('ss')).toThrow();
  });
  it('should fail number', () => {
    expect(() => expect(1).toEqualIgnoreFunctions(2)).toThrow();
  });
  it('should fail boolean', () => {
    expect(() => expect(true).toEqualIgnoreFunctions(false)).toThrow();
  });
  it('should fail simple object', () => {
    expect(() => expect({ a: 'a' }).toEqualIgnoreFunctions({ b: 'b' })).toThrow();
  });
  it('should fail simple array', () => {
    expect(() => expect([1]).toEqualIgnoreFunctions([2])).toThrow();
  });

  it('should fail for function matches string', () => {
    expect(() => expect(() => '').toEqualIgnoreFunctions('[Function]')).toThrow();
    expect(() => expect('[Function]').toEqualIgnoreFunctions(() => '')).toThrow();
  });

  it('should pass function in array', () => {
    expect([() => '1']).toEqualIgnoreFunctions([() => '2']);
  });

  it('should pass function in object', () => {
    expect({ a: () => '1' }).toEqualIgnoreFunctions({ a: () => '2' });
  });

  it('should pass system types', () => {
    expect(new Map()).toEqualIgnoreFunctions(new Map());
  });
  it('should fail system types', () => {
    const mIn = new Map();
    mIn.set('a', 'a');
    const mOut = new Map();
    mOut.set('b', 'b');
    expect(() => expect(mIn).toEqualIgnoreFunctions(mOut)).toThrow();

    const sIn = new Set();
    sIn.add(1);
    const sOut = new Set();
    sOut.add(2);
    expect(() => expect(sIn).toEqualIgnoreFunctions(sOut)).toThrow();
  });

  it('should pass complex nested type', () => {
    const oIn = {
      a: new Set(),
      b: [1, 2, 3],
      c: {
        d: 'd',
        e: 3,
        f: () => true,
      },
    };
    const oOut = {
      a: new Set(),
      b: [1, 2, 3],
      c: {
        d: 'd',
        e: 3,
        f: () => false,
      },
    };
    expect(oIn).toEqualIgnoreFunctions(oOut);
  });

  it('should pass circular dependencies', () => {
    const aIn = {};
    const bIn = { a: aIn };
    aIn.b = bIn;
    const aOut = {};
    const bOut = { a: aOut };
    aOut.b = bOut;
    expect(aIn).toEqualIgnoreFunctions(aOut);
    expect(bIn).toEqualIgnoreFunctions(bOut);
  });
});
