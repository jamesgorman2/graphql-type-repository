// @flow
/* eslint-env jest */

import { hasOwnProperty } from '../hasOwnProperty';

describe('hasOwnProperty', () => {
  it('should return true for matching property', () => {
    expect(hasOwnProperty({ a: 'b' }, 'a')).toBeTruthy();
  });
  it('should return false for non-matching property', () => {
    expect(hasOwnProperty({ a: 'b' }, 'b')).toBeFalsy();
  });
});
