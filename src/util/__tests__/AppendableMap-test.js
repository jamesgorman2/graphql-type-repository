// @flow
/* eslint-env jest */

import {
  Appendable,
  AppendableMap,
} from '../';

class AppendableList extends Appendable<AppendableList> {
  l: number[];

  constructor(l: number[] = []) {
    super();
    this.l = l;
  }

  append: (other: AppendableList) => AppendableList =
    other => new AppendableList([...this.l, ...other.l]);
}

describe('AppendableMap', () => {
  describe('constructor', () => {
    it('shoud be empty by default', () => {
      expect(new AppendableMap().isEmpty()).toBeTruthy();
    });
  });
  describe('put', () => {
    it('should return new map', () => {
      const m = new AppendableMap();
      expect(m.put('a', new AppendableList())).not.toBe(m);
    });
    it('should put first record', () => {
      const m = new AppendableMap();
      const l = new AppendableList();
      expect(m.put('a', l).get('a')).toBe(l);
    });
    it('should append second matching record', () => {
      const l1 = new AppendableList([1]);
      const l2 = new AppendableList([2]);
      const m = new AppendableMap().put('a', l1).put('a', l2);
      expect(m.get('a').l).toEqual([1, 2]);
    });
  });
  describe('append', () => {
    it('should return this when appending an empty map', () => {
      const m1 = new AppendableMap().put('a', new AppendableList());
      const m2 = new AppendableMap();
      expect(m1.append(m2)).toBe(m1);
    });
    it('should return this when appending self', () => {
      const m = new AppendableMap().put('a', new AppendableList());
      expect(m.append(m)).toBe(m);
    });
    it('should return other when this empty', () => {
      const m1 = new AppendableMap();
      const m2 = new AppendableMap().put('a', new AppendableList());
      expect(m1.append(m2)).toBe(m2);
    });
    it('should return new map', () => {
      const m1 = new AppendableMap().put('a', new AppendableList());
      const m2 = new AppendableMap().put('a', new AppendableList());
      expect(m1.append(m2)).not.toBe(m1);
      expect(m1.append(m2)).not.toBe(m2);
    });
    it('should append all data', () => {
      const l1 = new AppendableList([1]);
      const l2 = new AppendableList([2]);
      const l3 = new AppendableList([3]);
      const l4 = new AppendableList([4]);
      const m1 = new AppendableMap().put('a', l1).put('b', l2);
      const m2 = new AppendableMap().put('b', l3).put('c', l4);
      expect(m1.append(m2).get('a').l).toEqual([1]);
      expect(m1.append(m2).get('b').l).toEqual([2, 3]);
      expect(m1.append(m2).get('c').l).toEqual([4]);

      expect(m2.append(m1).get('a').l).toEqual([1]);
      expect(m2.append(m1).get('b').l).toEqual([3, 2]);
      expect(m2.append(m1).get('c').l).toEqual([4]);
    });
  });
  describe('conatins', () => {
    it('should return true for matching key', () => {
      const m = new AppendableMap().put('a', new AppendableList());
      expect(m.contains('a')).toBeTruthy();
    });
    it('should return false for non-matching key', () => {
      const m = new AppendableMap().put('a', new AppendableList());
      expect(m.contains('b')).toBeFalsy();
    });
  });
});
