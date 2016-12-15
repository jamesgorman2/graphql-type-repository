// @flow
/* eslint-env jest */

import { Module } from '../../../config';
import { errorInModules } from '../errorInModules';

describe('errorInModules', () => {
  it('should render single module error', () => {
    expect(errorInModules('Bad stuff happened', [new Module('foo')]))
      .toEqual('Bad stuff happened in module foo.');
  });
  it('should render many module errors', () => {
    expect(errorInModules('Bad stuff happened', [new Module('foo'), new Module('bar'), new Module('baz')]))
      .toEqual('Bad stuff happened in modules foo, bar, baz.');
  });
});
