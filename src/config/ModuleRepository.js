// @flow

import { Module } from './Module';

import {
  Appendable,
  assert,
} from '../util';

function isNewModule(module: Module, existingModules: Module[]): boolean {
  return !existingModules.find(m => m.name === module.name);
}

function assertNewModule(module: Module, existingModules: Module[]): void {
  assert(
    isNewModule(module, existingModules),
    `cannot add module with duplicate name '${module.name}'`,
  );
}

function assertNonEmptyModule(module: Module): void {
  assert(
    !module.isEmpty(),
    `cannot add empty module '${module.name}'`,
  );
}

export class ModuleRepository extends Appendable<ModuleRepository> {
  modules: Module[];
  errors: Error[];

  constructor(modules: Module[] = [], errors: Error[] = []) {
    super();
    this.modules = modules;
    this.errors = errors;
  }

  isEmpty: () => boolean = () => this.modules.length === 0;

  withModule: (module: Module) => ModuleRepository =
    module =>
      this.captureError(() => {
        assertNewModule(module, this.modules);
        assertNonEmptyModule(module);
        return new ModuleRepository([...this.modules, module], this.errors);
      });

  withError: (error: Error) => ModuleRepository =
    error => new ModuleRepository(this.modules, [...this.errors, error]);

  append: (other: ModuleRepository) => ModuleRepository =
    other =>
      new ModuleRepository(
        [...this.modules, ...other.modules],
        [...this.errors, ...other.errors],
      );

  captureError: (f: () => ModuleRepository) => ModuleRepository =
    (f) => {
      try {
        return f();
      } catch (e) {
        return this.withError(e);
      }
    }
}
