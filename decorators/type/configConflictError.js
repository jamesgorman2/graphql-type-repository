'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configConflictError = configConflictError;

var _GraphQLTypeError = require('./GraphQLTypeError');

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function configConflictError(field, type, name, module) {
  return function () {
    return new _GraphQLTypeError.GraphQLTypeError(titleCase(field) + ' for ' + type + ' ' + name + ' supplied in both schema and config in module ' + module + '. It must only be supplied in one of these locations.');
  };
}