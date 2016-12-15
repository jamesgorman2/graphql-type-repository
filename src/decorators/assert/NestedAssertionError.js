// @flow

export class NestedAssertionError extends Error {
  causedBy: Error;

  constructor(message: string, causedBy: Error) {
    super(message);
    this.causedBy = causedBy;
    this.stack = `${this.stack}\nCaused by: ${causedBy.stack.replace(/^Error:\s*/, '')}`;
  }
}
