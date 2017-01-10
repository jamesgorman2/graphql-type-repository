'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeprecationReason = getDeprecationReason;
exports.getDeprecationReasonObject = getDeprecationReasonObject;

var _graphql = require('graphql');

var _util = require('../../util');

var _configConflictError = require('./configConflictError');

function valueAsString(value) {
  return value.value && typeof value.value === 'string' ? value.value : '';
}

function getReason(directive) {
  return (0, _util.someOrNone)(directive.arguments).flatMap(function (args) {
    return args.filter(function (argument) {
      return argument.name.value === 'reason';
    }).map(function (argument) {
      return valueAsString(argument.value);
    }).reduce(function (acc, value) {
      return acc.or((0, _util.some)(value));
    }, _util.none);
  });
}

function getDeprecationReason(directives, deprecationReasonFromConfig, type, name, module) {
  return _util.Try.of(function () {
    return directives.flatMap(function (ds) {
      return ds.filter(function (d) {
        return d.name.value === _graphql.GraphQLDeprecatedDirective.name;
      }).reduce(function (acc, directive) {
        return acc.or(function () {
          return getReason(directive).orSome(_graphql.DEFAULT_DEPRECATION_REASON);
        });
      }, _util.none);
    }).xor(deprecationReasonFromConfig, (0, _configConflictError.configConflictError)('deprecation', type, name, module));
  });
}

function getDeprecationReasonObject(directives, deprecationReasonFromConfig, type, name, module) {
  return getDeprecationReason(directives, deprecationReasonFromConfig, type, name, module).map(function (o) {
    return o.map(function (d) {
      return { deprecationReason: d };
    }).getOrElse({});
  });
}