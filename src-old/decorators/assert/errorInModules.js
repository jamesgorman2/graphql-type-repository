// @flow

import {
  Module,
} from '../../config';

export function inModules(modules: Module[]): string {
  const module = `module${modules.length === 1 ? '' : 's'}`;
  const moduleList = modules.map(m => m.name).join(', ');
  return `in ${module} ${moduleList}`;
}

export function errorInModules(message: string, modules: Module[]): string {
  return `${message} ${inModules(modules)}.`;
}
