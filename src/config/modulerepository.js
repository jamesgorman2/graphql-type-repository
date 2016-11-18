// @flow

import { Module } from './module';

import assert from '../util/assert';


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

export class ModuleRepository {
  modules: Module[];

  constructor(modules: Module[] = []) {
    this.modules = modules;
  }

  isEmpty: () => boolean = () => this.modules.length === 0;

  withModule: (module: Module) => ModuleRepository = (module) => {
    assertNewModule(module, this.modules);
    assertNonEmptyModule(module);
    return new ModuleRepository([...this.modules, module]);
  };
}
