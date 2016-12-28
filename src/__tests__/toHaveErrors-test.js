// @flow
/* eslint-env jest */

import {
  toHaveErrors,
} from './toHaveErrors';

expect.extend({ toHaveErrors });

describe('toHaveErrors', () => {
  it('should reject null actual', () => {
    expect(() => expect(null).toHaveErrors(['']))
      .toThrowError(/value must be an object with a property errors that is an array of Errors/);
  });
  it('should reject undefined actual', () => {
    expect(() => expect(undefined).toHaveErrors(['']))
      .toThrowError(/value must be an object with a property errors that is an array of Errors/);
  });
  it('should reject actual without errors', () => {
    expect(() => expect({}).toHaveErrors(['']))
      .toThrowError(/value must be an object with a property errors that is an array of Errors/);
  });
  it('should reject actual with errors not an array', () => {
    expect(() => expect({ errors: 1 }).toHaveErrors(['']))
      .toThrowError(/value must be an object with a property errors that is an array of Errors/);
  });
  it('should reject actual with errors not an array of errors', () => {
    expect(() => expect({ errors: [1] }).toHaveErrors(['']))
      .toThrowError(/value must be an object with a property errors that is an array of Errors/);
  });
  it('should reject expected not an array', () => {
    // flow-disable-next-line
    expect(() => expect({ errors: [] }).toHaveErrors(1))
      .toThrowError(/value must be an array of strings/);
  });
  it('should reject expected not an array of string', () => {
    // flow-disable-next-line
    expect(() => expect({ errors: [] }).toHaveErrors([1]))
      .toThrowError(/value must be an array of strings/);
  });
  it('should fail missing errors in expected', () => {
    expect(() =>
      expect({ errors: [new Error('error1'), new Error('error2')] })
        .toHaveErrors(['error 1'])
    )
      .toThrowError(/Expected errors messages to equal/);
  });
  it('should fail missing errors in actual', () => {
    expect(() =>
      expect({ errors: [new Error('error 1')] })
        .toHaveErrors(['error 1', 'error 2'])
    )
      .toThrowError(/Expected errors messages to equal/);
  });
  it('should pass empty errors', () => {
    expect({ errors: [] }).toHaveErrors([]);
  });
  it('should pass single error', () => {
    expect({ errors: [new Error('error 1')] }).toHaveErrors(['error 1']);
  });
  it('should pass multiple errors', () => {
    expect({ errors: [new Error('error 1'), new Error('error 2')] })
      .toHaveErrors(['error 1', 'error 2']);
  });
  it('should pass multiple errors out of order', () => {
    expect({ errors: [new Error('error 1'), new Error('error 2')] })
      .toHaveErrors(['error 2', 'error 1']);
  });
  it('should pass matching errors', () => {
    expect({ errors: [new Error('error 1')] })
      .toHaveErrors([new Error('error 1')]);
  });
  it('should pass matching regexp', () => {
    expect({ errors: [new Error('foo error  123')] })
      .toHaveErrors([/error\s+1/]);
  });
});
