'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inModules = inModules;
exports.errorInModules = errorInModules;

var _config = require('../../config');

function inModules(modules) {
  var module = 'module' + (modules.length === 1 ? '' : 's');
  var moduleList = modules.map(function (m) {
    return m.name;
  }).join(', ');
  return 'in ' + module + ' ' + moduleList;
}

function errorInModules(message, modules) {
  return message + ' ' + inModules(modules) + '.';
}