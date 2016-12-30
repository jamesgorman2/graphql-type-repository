// @flow

import {
  Appendable,
  Try,
  assert,
} from '../util';

import {
  Module,
} from './Module';

function isNewModule(module: Module, existingModules: Module[]): boolean {
  return !existingModules.find(m => m.name === module.name);
}

function assertNewModule(module: Module, existingModules: Module[]): Try<void> {
  return assert(
    isNewModule(module, existingModules),
    `cannot add module with duplicate name '${module.name}'`,
  );
}

function assertNonEmptyModule(module: Module): Try<void> {
  return assert(
    !module.isEmpty(),
    `cannot add empty module '${module.name}'`,
  );
}

export class ModuleRepository extends Appendable<ModuleRepository> {
  modules: Module[];
  errors: Error[];

  constructor(modules: Module[] = [], errors: Error[] = []): void {
    super();
    this.modules = modules;
    this.errors = errors;
  }

  isEmpty: () => boolean = () => this.modules.length === 0;

  withModule: (module: Module) => ModuleRepository =
    module =>
      this.captureError(
        assertNewModule(module, this.modules)
          .flatMap(_ => assertNonEmptyModule(module))
          .map(_ => new ModuleRepository([...this.modules, module], this.errors))
      );

  withError: (error: Error) => ModuleRepository =
    error =>
      new ModuleRepository(this.modules, [...this.errors, error]);

  withErrors: (errors: Error[]) => ModuleRepository =
    errors =>
      new ModuleRepository(this.modules, [...this.errors, ...errors]);

  append: (other: ModuleRepository) => ModuleRepository =
    other =>
      new ModuleRepository(
        [...this.modules, ...other.modules],
        [...this.errors, ...other.errors],
      );

  captureError: (maybeModuleRepository: Try<ModuleRepository>) => ModuleRepository =
    maybeModuleRepository =>
      maybeModuleRepository.toEither()
        .mapReduce(
          moduleRepository => moduleRepository,
          this.withErrors
        )
}
