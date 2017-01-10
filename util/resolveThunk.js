'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveThunk = resolveThunk;
function resolveThunk(thunk) {
  return typeof thunk === 'function' ? thunk() : thunk;
}