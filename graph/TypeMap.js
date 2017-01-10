'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeMap = undefined;

var _graphql = require('graphql');

var _config = require('../config');

var _util = require('../util');

var _FlattenedTypeGraph = require('./FlattenedTypeGraph');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isOutputType(type) {
  var namedType = (0, _graphql.getNamedType)(type);
  return namedType instanceof _graphql.GraphQLScalarType || namedType instanceof _graphql.GraphQLObjectType || namedType instanceof _graphql.GraphQLInterfaceType || namedType instanceof _graphql.GraphQLUnionType || namedType instanceof _graphql.GraphQLEnumType;
}

function isNamedType(type) {
  return type instanceof _graphql.GraphQLScalarType || type instanceof _graphql.GraphQLObjectType || type instanceof _graphql.GraphQLInterfaceType || type instanceof _graphql.GraphQLUnionType || type instanceof _graphql.GraphQLEnumType || type instanceof _graphql.GraphQLInputObjectType;
}

function getErrorReferrence(referringTypeName, module) {
  return referringTypeName.map(function (n) {
    return ' for type ' + n;
  }).orSome('').flatMap(function (s) {
    return module.map(function (m) {
      return m.name;
    }).map(function (n) {
      return s + ' in module ' + n;
    });
  }).getOrElse('');
}

function errorInstanceOf(type, expected, referringTypeName, module) {
  return new Error('Type ' + type.name + ' not a ' + expected + getErrorReferrence((0, _util.someOrNone)(referringTypeName), (0, _util.someOrNone)(module)) + '.');
}

var TypeMap = exports.TypeMap = function TypeMap() {
  var _this = this;

  _classCallCheck(this, TypeMap);

  this.getType = function (name, referringTypeName, module) {
    var type = _this.graph.types.get(name).flatMap(function (t) {
      return t.type;
    });
    type.ifNone(function () {
      throw new Error('Type ' + name + ' not found' + getErrorReferrence((0, _util.someOrNone)(referringTypeName), (0, _util.someOrNone)(module)) + '.');
    });
    return type.get();
  };

  this.getInutType = function (name, referringTypeName, module) {
    var type = _this.getType(name, referringTypeName, module);
    if (!(0, _graphql.isInputType)(type)) {
      throw errorInstanceOf(type, 'GraphQLInputType', referringTypeName, module);
    }
    return type;
  };

  this.getInterfaceType = function (name, referringTypeName, module) {
    var type = _this.getType(name, referringTypeName, module);
    if (!(type instanceof _graphql.GraphQLInterfaceType)) {
      throw errorInstanceOf(type, 'GraphQLInterfaceType', referringTypeName, module);
    }
    return type;
  };

  this.getNamedType = function (name, referringTypeName, module) {
    var type = _this.getType(name, referringTypeName, module);
    if (!isNamedType(type)) {
      throw errorInstanceOf(type, 'GraphQLNamedType', referringTypeName, module);
    }
    return type;
  };

  this.getObjectType = function (name, referringTypeName, module) {
    var type = _this.getType(name, referringTypeName, module);
    if (!(type instanceof _graphql.GraphQLObjectType)) {
      throw errorInstanceOf(type, 'GraphQLObjectType', referringTypeName, module);
    }
    return type;
  };

  this.getOutputType = function (name, referringTypeName, module) {
    var type = _this.getType(name, referringTypeName, module);
    if (!isOutputType(type)) {
      throw errorInstanceOf(type, 'GraphQLOutputType', referringTypeName, module);
    }
    return type;
  };

  this.getUnionType = function (name, referringTypeName, module) {
    var type = _this.getType(name, referringTypeName, module);
    if (!(type instanceof _graphql.GraphQLUnionType)) {
      throw errorInstanceOf(type, 'GraphQLUnionType', referringTypeName, module);
    }
    return type;
  };
};