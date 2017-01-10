"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entries = entries;
function entries(o) {
  return Object.keys(o).map(function (key) {
    return [key, o[key]];
  });
}