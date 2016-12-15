// @flow

import { hasOwnProperty } from './hasOwnProperty';

// eslint-disable-next-line no-unused-vars
import type { Appendable } from './Appendable';

export class AppendableMap<T: Appendable<any>> {
  data: {
    [key: string]: T
  };

  constructor(data: { [key: string]: T } = {}) {
    this.data = data;
  }

  contains: (key: string) => boolean =
    key => hasOwnProperty(this.data, key);

  get: (key: string) => T =
    key => this.data[key];

  isEmpty: () => boolean =
    () => Object.keys(this.data).length === 0;

  put: (key: string, value: T) => AppendableMap<T> =
    (key, value) => {
      const newData = { ...this.data };
      newData[key] = hasOwnProperty(newData, key) ? newData[key].append(value) : value;
      return new AppendableMap(newData);
    }

  values: () => T[] =
    () => Object.keys(this.data).map(key => this.data[key]);

  append: (other: AppendableMap<T>) => AppendableMap<T> =
    (other) => {
      if (this === other) {
        return this;
      }
      if (this.isEmpty()) {
        return other;
      }
      return Object.keys(other.data)
        .reduce(
          (map: AppendableMap<T>, key: string) => map.put(key, other.data[key]),
          this,
        );
    }
}
