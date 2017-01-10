'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = assert;

var _Try = require('./Try');

function assert(test, msg) {
  if (!test) {
    return _Try.Try.failure(new Error(msg));
  }
  return _Try.Try.success();
}