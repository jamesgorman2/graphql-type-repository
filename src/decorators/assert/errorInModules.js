// @flow

import { Module } from '../../config';

export function errorInModules(message: string, modules: Module[]): string {
  const module = `module${modules.length === 1 ? '' : 's'}`;
  const moduleList = modules.map(m => m.name).join(', ');
  return `${message} in ${module} ${moduleList}.`;
}
