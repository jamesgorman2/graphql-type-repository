// @flow

export class CompositeError extends Error {
  errors: Error[];

  constructor(errors: Error[]) {
    super();
    this.errors = errors;
  }
}
