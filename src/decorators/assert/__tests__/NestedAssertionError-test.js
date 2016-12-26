// @flow
/* eslint-env jest */

import {
  NestedAssertionError,
} from '../NestedAssertionError';

describe('NestedAssertionError', () => {
  it('should nest stack traces', () => {
    expect(
      new NestedAssertionError(
        'foo',
        new Error('bar')
      ).stack
    )
      .toMatch(/Error: foo\s+at[\s\S]*?NestedAssertionError-test\.js:11[\s\S]*Caused by: bar\s+at[\s\S]*?NestedAssertionError-test\.js:13/g);
  });
  it('should leave messages alone', () => {
    expect(new NestedAssertionError('foo', new Error('bar')).message)
      .toEqual('foo');
  });
  it('should leave nested messages alone', () => {
    expect(new NestedAssertionError('foo', new Error('bar')).causedBy.message)
      .toEqual('bar');
  });
});
