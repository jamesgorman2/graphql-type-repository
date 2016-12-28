// @flow

import chalk from 'chalk';

import diff from 'jest-diff';

import {
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  getType,
  matcherHint,
  printExpected,
  printReceived,
  printWithType,
} from 'jest-matcher-utils';

import prettyFormat from 'pretty-format';

import {
  iterableEquality,
} from './iterableEquality';

import {
  Option,
  someOrNone,
} from '../util';

const equals = global.jasmine.matchersUtil.equals;

function findMatch(
  actual: Error,
  expected: Array<string | Error | RegExp>
): Option<string | Error | RegExp> {
  return someOrNone(
    expected.find(
      e =>
        actual.message === e ||
        (e instanceof RegExp && e.test(actual.message)) ||
        equals(e, actual, [iterableEquality])
    )
  );
}

function getDiff(
  received: Array<Error>,
  expected: Array<string | Error | RegExp>
): {
  receivedMatched: Array<Error>,
  receivedNotMatched: Array<Error>,
  expectedMatched: Array<string | Error>,
  expectedNotMatched: Array<string | Error>
} {
  const receivedMatched = [];
  const expectedMatched = [];
  let expectedNotMatched = expected;

  received.forEach(
    (r) => {
      const matched: Option<string | Error | RegExp> = findMatch(r, expectedNotMatched);
      matched.forEach(
        (m) => {
          expectedMatched.push(m);
          receivedMatched.push(r);
          expectedNotMatched = expectedNotMatched.filter(e => e !== m);
        }
      );
    }
  );

  return {
    receivedMatched:
      receivedMatched
        .sort(),
    receivedNotMatched:
      received
        .filter(r => !receivedMatched.includes(r))
        .sort(),
    expectedMatched:
      expectedMatched
        .map(o => (o instanceof RegExp ? o.toString() : o))
        .sort(),
    expectedNotMatched:
      expected
        .filter(e => !expectedMatched.includes(e))
        .map(e => (e instanceof RegExp ? e.toString() : e))
        .sort(),
  };
}

export function toHaveErrors(received: any, expected: Array<string | Error | RegExp>) {
  if (
    !received ||
    !received.errors ||
    getType(received.errors) !== 'array' ||
    received.errors.reduce(
      (acc, e) => acc || !(e instanceof Error),
      false
    )
  ) {
    throw new Error(
        `${matcherHint('[.not].toHaveErrorMessages', 'string', 'expected')}

${RECEIVED_COLOR('string')} value must be an object with a property errors that is an array of Errors.
${printWithType('Received', received, printReceived)}`,
      );
  }
  if (
    getType(expected) !== 'array' ||
    expected.reduce(
      (acc, e) =>
        acc ||
        !(
          (getType(e) === 'string') ||
          e instanceof Error ||
          e instanceof RegExp
        ),
      false
    )
  ) {
    throw new Error(
        `${matcherHint('[.not].toHaveErrorMessages', 'array', 'expected')}

${EXPECTED_COLOR('expected')} value must be an array of strings, Errors or RegExp.
${printWithType('Expected', expected, printExpected)}`,
      );
  }

  const {
    receivedMatched,
    receivedNotMatched,
    expectedNotMatched,
  } = getDiff(received.errors, expected);

  const pass = !(receivedNotMatched.length || expectedNotMatched.length);
  const message = pass ?
    () => `${matcherHint('.not.toHaveErrorMessages')}

Expected error messages to not equal:
  ${printExpected(expected)}
Received:
  ${printReceived(received.errors)}` :
    () => {
      const matchedString = chalk.dim(prettyFormat(receivedMatched));
      const diffString = diff(expectedNotMatched, receivedNotMatched, {
        expand: this.expand,
      });
      return `${matcherHint('.toHaveErrorMessages')}
Expected errors messages to equal:
  ${printExpected(expected)}
Received:
  ${printReceived(received.errors)}${matchedString ? `\n\nMatched:\n\n${matchedString}` : ''}${(diffString ? `\n\nDifference:\n\n${diffString}` : '')}`;
    };

  return { message, pass };
}
