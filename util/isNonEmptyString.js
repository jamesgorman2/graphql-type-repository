'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNonEmptyString = isNonEmptyString;
function isNonEmptyString(o) {
  return o && typeof o === 'string';
}