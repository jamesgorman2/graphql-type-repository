'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDescription = getDescription;
exports.getDescriptionObject = getDescriptionObject;

var _buildASTSchema = require('graphql/utilities/buildASTSchema');

var _util = require('../../util');

var _configConflictError = require('./configConflictError');

function getDescription(node, descriptionFromConfig, type, name, module) {
  return _util.Try.of(function () {
    return (0, _util.someOrNone)((0, _buildASTSchema.getDescription)(node)).xor(descriptionFromConfig, (0, _configConflictError.configConflictError)('description', type, name, module));
  });
}

function getDescriptionObject(node, descriptionFromConfig, type, name, module) {
  return getDescription(node, descriptionFromConfig, type, name, module).map(function (o) {
    return o.map(function (d) {
      return { description: d };
    }).getOrElse({});
  });
}