// @flow

import diff from 'jest-diff';

import {
  matcherHint,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';

import {
  iterableEquality,
} from './iterableEquality';

const equals = global.jasmine.matchersUtil.equals;

function functionEquality(a: any, b: any) {
  if (
    typeof a !== 'function' ||
    typeof b !== 'function'
  ) {
    return undefined;
  }
  return true;
}

export function toEqualIgnoreFunctions(actual: any, expected: any) {
  const pass = equals(
    actual,
    expected,
    [
      functionEquality,
      iterableEquality,
    ]
  );

  const message = pass ?
    () =>
      `${matcherHint('.not.toEqualIngnoreFunctions')}

Expected value to not equal:
  ${printExpected(expected)}
Received:
  ${printReceived(actual)}` :
    () => {
      const diffString = diff(expected, actual, {
        expand: this.expand,
      });
      return `${matcherHint('.toEqualIngnoreFunctions')}

Expected value to equal:
  ${printExpected(expected)}
Received:
  ${printReceived(actual)}${(diffString ? `\n\nDifference:\n\n${diffString}` : '')}`;
    };

  return {
    pass,
    message,
  };
}
