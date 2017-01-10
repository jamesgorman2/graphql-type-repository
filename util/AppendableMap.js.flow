// @flow

import { hasOwnProperty } from './hasOwnProperty';


// eslint-disable-next-line no-unused-vars
import type { Appendable } from './Appendable';

import {
  Option,
  someOrNone,
} from './option';

export class AppendableMap<T: Appendable<any>> {
  data: {
    [key: string]: T
  };

  constructor(data: { [key: string]: T } = {}): void {
    this.data = data;
  }

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

  contains: (key: string) => boolean =
    key => hasOwnProperty(this.data, key);

  get: (key: string) => Option<T> =
    key => someOrNone(this.data[key]);

  isEmpty: () => boolean =
    () => Object.keys(this.data).length === 0;

  keys: () => string[] =
    () => Object.keys(this.data);

  put: (key: string, value: T) => AppendableMap<T> =
    (key, value) => {
      const newData = { ...this.data };
      newData[key] = hasOwnProperty(newData, key) ? newData[key].append(value) : value;
      return new AppendableMap(newData);
    }

  remove: (key: string) => AppendableMap<T> =
    (key) => {
      if (hasOwnProperty(this.data, key)) {
        const newData = { ...this.data };
        delete newData[key];
        return new AppendableMap(newData);
      }
      return this;
    }

  replace: (key: string, value: T) => AppendableMap<T> =
    (key, value) =>
      this.get(key)
        .filter(v => v === value)
        .map(_ => this)
        .getOrElse(() => new AppendableMap({ ...this.data, [key]: value }))

  values: () => T[] =
    () => this.keys().map(key => this.data[key]);
}
