/**
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

const equals = global.jasmine.matchersUtil.equals;

const IteratorSymbol = Symbol.iterator;
const hasIterator = object => !!(object != null && object[IteratorSymbol]);
export const iterableEquality = (a: any, b: any) => {
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    Array.isArray(a) ||
    Array.isArray(b) ||
    !hasIterator(a) ||
    !hasIterator(b)
  ) {
    return undefined;
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  const bIterator = b[IteratorSymbol]();

  for (const aValue of a) { // eslint-disable-line no-restricted-syntax
    const nextB = bIterator.next();
    if (
      nextB.done ||
      !equals(
        aValue,
        nextB.value,
        [iterableEquality],
      )
    ) {
      return false;
    }
  }
  if (!bIterator.next().done) {
    return false;
  }
  return true;
};
