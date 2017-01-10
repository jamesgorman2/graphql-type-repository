'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Module = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _graphql = require('graphql');

var _util = require('../util');

var _NamedDefinitionNode = require('./NamedDefinitionNode');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isDirective(directive) {
  return directive instanceof _graphql.GraphQLDirective;
}

function isDirectiveDefinition(node) {
  return node.kind === 'DirectiveDefinition';
}

function isExtensionNode(node) {
  return node.kind === 'TypeExtensionDefinition';
}

function isNamedType(type) {
  return type instanceof _graphql.GraphQLScalarType || type instanceof _graphql.GraphQLObjectType || type instanceof _graphql.GraphQLInterfaceType || type instanceof _graphql.GraphQLUnionType || type instanceof _graphql.GraphQLEnumType || type instanceof _graphql.GraphQLInputObjectType;
}

function isSchemaDefinition(node) {
  return node.kind === 'SchemaDefinition';
}

function isTypeDefinition(node) {
  return node.kind === 'ScalarTypeDefinition' || node.kind === 'ObjectTypeDefinition' || node.kind === 'InterfaceTypeDefinition' || node.kind === 'UnionTypeDefinition' || node.kind === 'EnumTypeDefinition' || node.kind === 'InputObjectTypeDefinition';
}

function maybeName(node) {
  return (0, _util.someOrNone)(node).map(function (n) {
    return (0, _util.someOrNone)(n.definition).getOrElse(n);
  }).flatMap(function (n) {
    return (0, _util.someOrNone)(n.name).map(function (name) {
      return name.value;
    });
  });
}

// eslint-disable-next-line no-use-before-define
function newDirective(name, module) {
  return !module.directives.find(function (t) {
    return t.name === name;
  }) && !module.directiveDefinitionNodes.find(function (t) {
    return t.name === name;
  });
}

// eslint-disable-next-line no-use-before-define
function newNamedType(name, module) {
  return !module.types.find(function (t) {
    return t.name === name;
  }) && !module.typeDefinitionNodes.find(function (n) {
    return n.name === name;
  });
}

function nodeName(node) {
  return node.name.value;
}

// eslint-disable-next-line no-use-before-define
function assertNewNamedType(name, module) {
  return (0, _util.assert)(newNamedType(name, module), 'Cannot add type with duplicate name \'' + name + '\'.');
}

// eslint-disable-next-line no-use-before-define
function assertNewDirective(name, module) {
  return (0, _util.assert)(newDirective(name, module), 'Cannot add directive with duplicate name \'' + name + '\'.');
}

function withDefinitionNode(module, // eslint-disable-line no-use-before-define
node, config) {
  // eslint-disable-line no-use-before-define
  if (isExtensionNode(node)) {
    var n = node.definition;
    var name = nodeName(n);
    return _util.Try.of(new Module(module.name, module.types, module.typeDefinitionNodes, [].concat(_toConsumableArray(module.extensionDefinitionNodes), [new _NamedDefinitionNode.NamedDefinitionNode(name, n, config)]), module.directives, module.directiveDefinitionNodes, module.schemaDefinitionNode, module.errors));
  } else if (isTypeDefinition(node)) {
    var _ret = function () {
      var n = node;
      var name = nodeName(n);
      return {
        v: assertNewNamedType(name, module).map(function (_) {
          return new Module(module.name, module.types, [].concat(_toConsumableArray(module.typeDefinitionNodes), [new _NamedDefinitionNode.NamedDefinitionNode(name, n, config)]), module.extensionDefinitionNodes, module.directives, module.directiveDefinitionNodes, module.schemaDefinitionNode, module.errors);
        })
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else if (isSchemaDefinition(node)) {
    var _n = node;
    return _util.Try.of(new Module(module.name, module.types, module.typeDefinitionNodes, module.extensionDefinitionNodes, module.directives, module.directiveDefinitionNodes, (0, _util.some)(_n), module.errors));
  } else if (isDirectiveDefinition(node)) {
    var _ret2 = function () {
      var n = node;
      var name = nodeName(n);
      return {
        v: assertNewDirective(name, module).map(function (_) {
          return new Module(module.name, module.types, module.typeDefinitionNodes, module.extensionDefinitionNodes, module.directives, [].concat(_toConsumableArray(module.directiveDefinitionNodes), [new _NamedDefinitionNode.NamedDefinitionNode(name, n, config)]), module.schemaDefinitionNode, module.errors);
        })
      };
    }();

    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
  }
  return _util.Try.failure(new Error('Parameter node must be a TypeSystemDefinitionNode.'));
}

function withDocumentNode(module, // eslint-disable-line no-use-before-define
node, configs) {
  // eslint-disable-line no-use-before-define
  return (0, _util.assert)(node.kind === 'Document', 'Parameter node must be a DocumentNode.').flatMap(function (_) {
    var matchedConfigs = [];
    var definitions = node.definitions;
    var newModule = definitions.reduce(
    // eslint-disable-next-line no-use-before-define
    function (m, childNode) {
      return maybeName(childNode).flatMap(function (name) {
        var matchedConfig = configs.mapOrNone(function (r) {
          return r[name];
        });
        matchedConfig.forEach(function (_1) {
          matchedConfigs.push(name);
        });
        return matchedConfig;
      }).map(function (matchedconfig) {
        return m.withDefinitionNode(childNode, matchedconfig);
      }).getOrElse(m.withDefinitionNode(childNode));
    }, module);
    return configs.map(function (cs) {
      var configNames = Object.keys(cs);
      if (matchedConfigs.length < configNames.length) {
        var unmatchedConfigNames = configNames.filter(function (n) {
          return !matchedConfigs.includes(n);
        });
        var plural = unmatchedConfigNames.length > 1 ? 's' : '';
        var nameString = unmatchedConfigNames.map(function (n) {
          return '\'' + n + '\'';
        }).join(', ');
        return _util.Try.failure(new Error('Cannot add config' + plural + ' ' + nameString + ' with no matching type' + plural + '.'));
      }
      return _util.Try.success(newModule);
    }).getOrElse(_util.Try.success(newModule));
  });
}

var Module = exports.Module = function Module(name) {
  var types = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var typeDefinitionNodes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var extensionDefinitionNodes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var directives = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var directiveDefinitionNodes = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
  var schemaDefinitionNode = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : _util.none;
  var errors = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];

  _classCallCheck(this, Module);

  _initialiseProps.call(this);

  (0, _util.assert)((0, _util.isNonEmptyString)(name), 'Parameter name must be a non-empty string.').throw();
  this.name = name;
  this.types = types;
  this.typeDefinitionNodes = typeDefinitionNodes;
  this.extensionDefinitionNodes = extensionDefinitionNodes;
  this.directives = directives;
  this.directiveDefinitionNodes = directiveDefinitionNodes;
  this.schemaDefinitionNode = schemaDefinitionNode;
  this.errors = errors;
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.isEmpty = function () {
    return _this.types.length === 0 && _this.directives.length === 0 && _this.typeDefinitionNodes.length === 0 && _this.extensionDefinitionNodes.length === 0 && _this.directiveDefinitionNodes.length === 0 && _this.schemaDefinitionNode.isNone() && _this.errors.length === 0;
  };

  this.withError = function (error) {
    return new Module(_this.name, _this.types, _this.typeDefinitionNodes, _this.extensionDefinitionNodes, _this.directives, _this.directiveDefinitionNodes, _this.schemaDefinitionNode, [].concat(_toConsumableArray(_this.errors), [error]));
  };

  this.withErrors = function (errors) {
    return new Module(_this.name, _this.types, _this.typeDefinitionNodes, _this.extensionDefinitionNodes, _this.directives, _this.directiveDefinitionNodes, _this.schemaDefinitionNode, [].concat(_toConsumableArray(_this.errors), _toConsumableArray(errors)));
  };

  this.withType = function (type) {
    return _this.captureError((0, _util.assert)(isNamedType(type), 'Parameter type must be a GraphQLNamedType.').flatMap(function (_) {
      return assertNewNamedType(type.name, _this);
    }).map(function (_) {
      return new Module(_this.name, [].concat(_toConsumableArray(_this.types), [type]), _this.typeDefinitionNodes, _this.extensionDefinitionNodes, _this.directives, _this.directiveDefinitionNodes, _this.schemaDefinitionNode, _this.errors);
    }));
  };

  this.withDirective = function (directive) {
    return _this.captureError((0, _util.assert)(isDirective(directive), 'Parameter directive must be a GraphQLDirective.').flatMap(function (_) {
      return assertNewDirective(directive.name, _this);
    }).map(function (_) {
      return new Module(_this.name, _this.types, _this.typeDefinitionNodes, _this.extensionDefinitionNodes, [].concat(_toConsumableArray(_this.directives), [directive]), _this.directiveDefinitionNodes, _this.schemaDefinitionNode, _this.errors);
    }));
  };

  this.withDefinitionNode = function (node, config) {
    return _this.captureError(withDefinitionNode(_this, node, (0, _util.someOrNone)(config)));
  };

  this.withDocumentNode = function (node, configs) {
    return _this.captureError(withDocumentNode(_this, node, (0, _util.someOrNone)(configs)));
  };

  this.withSchema = function (schema, configs) {
    return _this.captureError((0, _util.assert)((0, _util.isNonEmptyString)(schema), 'Parameter schema must be a non-empty string.').map(function (_) {
      return _this.withDocumentNode((0, _graphql.parse)(schema), configs);
    }));
  };

  this.captureError = function (maybeModule) {
    return maybeModule.toEither().mapReduce(function (module) {
      return module;
    }, _this.withErrors);
  };
};