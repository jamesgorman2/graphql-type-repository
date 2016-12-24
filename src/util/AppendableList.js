// @flow

import { Appendable } from './Appendable';

export class AppendableList<T> extends Appendable<AppendableList<T>> {
  ts: T[];

  constructor(ts: T[] = []) {
    super();
    this.ts = ts;
  }

  append: (other: AppendableList<T>) => AppendableList<T> =
    other =>
      new AppendableList([...this.ts, ...other.ts]);

  toArray: () => T[] =
    () => this.ts;

  push: (t: T) => AppendableList<T> =
    t => new AppendableList([...this.ts, t]);
}
