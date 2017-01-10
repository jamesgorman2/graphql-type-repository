'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOutputType = getOutputType;

var _graphql = require('graphql');

var _config = require('../../config');

var _graph = require('../../graph');

var _util = require('../../util');

function getList(typeNode, typeMap, referringTypeName, module) {
  if (typeNode.kind === 'ListType') {
    return getNonNull(typeNode.type, typeMap, referringTypeName, module).orSome(function () {
      return getNamedOutputType(typeNode.type, typeMap, referringTypeName, module);
    }).map(function (inner) {
      return new _graphql.GraphQLList(inner);
    });
  }
  return _util.none;
}

function getNonNull(typeNode, typeMap, referringTypeName, module) {
  if (typeNode.kind === 'NonNullType') {
    return getList(typeNode.type, typeMap, referringTypeName, module).orSome(function () {
      return getNamedOutputType(typeNode.type, typeMap, referringTypeName, module);
    }).map(function (inner) {
      return new _graphql.GraphQLNonNull(inner);
    });
  }
  return _util.none;
}

function getNamedOutputType(typeNode, typeMap, referringTypeName, module) {
  return typeMap.getOutputType(typeNode.name.value, referringTypeName, module);
}

function getOutputType(typeNode, typeMap, referringTypeName, module) {
  var t = getList(typeNode, typeMap, referringTypeName, module).or(function () {
    return getNonNull(typeNode, typeMap, referringTypeName, module);
  }).getOrElse(function () {
    return getNamedOutputType(typeNode, typeMap, referringTypeName, module);
  });
  return t;
}