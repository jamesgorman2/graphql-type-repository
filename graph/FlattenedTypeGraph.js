'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlattenedTypeGraph = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.extractType = extractType;
exports.extractTypes = extractTypes;
exports.extractTypeDefinition = extractTypeDefinition;
exports.extractTypeDefinitions = extractTypeDefinitions;
exports.extractTypeExtension = extractTypeExtension;
exports.extractTypeExtensions = extractTypeExtensions;
exports.extractDirective = extractDirective;
exports.extractDirectives = extractDirectives;
exports.extractDirectiveDefinition = extractDirectiveDefinition;
exports.extractDirectiveDefinitions = extractDirectiveDefinitions;
exports.extractSchema = extractSchema;

var _config = require('../config');

var _util = require('../util');

var _Directive = require('./Directive');

var _DirectiveDefinition = require('./DirectiveDefinition');

var _ExtensionDefinition = require('./ExtensionDefinition');

var _Schema = require('./Schema');

var _SchemaDefinition = require('./SchemaDefinition');

var _Type = require('./Type');

var _TypeDefinition = require('./TypeDefinition');

var _TypeMap = require('./TypeMap');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// eslint-disable-next-line no-use-before-define
function extractType(module, type) {
  return new _Type.Type(type.name).withDefinition(new _TypeDefinition.TypeDefinition(module).withType(type));
}

// eslint-disable-next-line no-use-before-define
function extractTypes(module) {
  return module.types.reduce(function (graph, type) {
    return graph.withType(extractType(module, type));
  }, new FlattenedTypeGraph());
}

function getTypeRefs(type) {
  var interfaceRefs = type.interfaces ? type.interfaces.map(function (i) {
    return i.name.value;
  }) : [];
  var fieldRefs = type.fields ? type.fields.map(function (f) {
    return f.type.name.value;
  }) : [];
  var argumentRefs = (0, _util.flatMap)(type.fields ? type.fields : [], function (f) {
    return f.arguments ? f.arguments.map(function (argument) {
      return argument.type.name.value;
    }) : [];
  });
  return interfaceRefs.concat(fieldRefs).concat(argumentRefs);
}

function getDirectivesRefs(type) {
  var typeDirectives = type.directives ? type.directives.map(function (i) {
    return i.name.value;
  }) : [];
  var fieldDirectives = (0, _util.flatMap)(type.fields ? type.fields : [], function (f) {
    return f.directives.map(function (d) {
      return d.name.value;
    });
  });
  var argumentDirectives = (0, _util.flatMap)(type.fields ? type.fields : [], function (f) {
    return (0, _util.flatMap)(f.arguments ? f.arguments : [], function (a) {
      return a.directives ? a.directives.map(function (d) {
        return d.name.value;
      }) : [];
    });
  });
  return typeDirectives.concat(fieldDirectives).concat(argumentDirectives);
}

function getTypeBaseGraph(module, type) {
  // eslint-disable-line no-use-before-define
  var operation = module.schemaDefinitionNode.flatMap(function (s) {
    return (0, _util.someOrNone)(s.operationTypes.filter(function (t) {
      return t.type.name.value === type.name;
    }).map(function (t) {
      return t.operation;
    })[0]);
  }).getOrElse('');
  if (operation === 'query') {
    return new FlattenedTypeGraph().withSchema(new _Schema.Schema().withQuery(type));
  }
  if (operation === 'mutation') {
    return new FlattenedTypeGraph().withSchema(new _Schema.Schema().withMutation(type));
  }
  if (operation === 'subscription') {
    return new FlattenedTypeGraph().withSchema(new _Schema.Schema().withSubscription(type));
  }
  return new FlattenedTypeGraph().withType(type);
}

function extractTypeDefinition(module, typeDefinition) {
  // eslint-disable-line no-use-before-define
  var typeRefs = getTypeRefs(typeDefinition.definition);
  var directiveRefs = getDirectivesRefs(typeDefinition.definition);
  var baseType = new _Type.Type(typeDefinition.name).withDefinition(new _TypeDefinition.TypeDefinition(module).withDefinition(typeDefinition));
  var typeWithRefs = typeRefs.reduce(function (type, ref) {
    return type.withTypeRef(ref, module);
  }, baseType);
  var typeWithDirectiveRefs = directiveRefs.reduce(function (type, ref) {
    return type.withDirectiveRef(ref, module);
  }, typeWithRefs);
  var baseGraph = getTypeBaseGraph(module, typeWithDirectiveRefs);
  var graphWithRefs = typeRefs.reduce(function (graph, ref) {
    return graph.withType(new _Type.Type(ref));
  }, baseGraph);
  return directiveRefs.reduce(function (graph, ref) {
    return graph.withDirective(new _Directive.Directive(ref));
  }, graphWithRefs);
}

// eslint-disable-next-line no-use-before-define
function extractTypeDefinitions(module) {
  // TODO - skip if in schema
  return module.typeDefinitionNodes.reduce(function (graph, type) {
    return graph.append(extractTypeDefinition(module, type));
  }, new FlattenedTypeGraph());
}

function extractTypeExtension(module, extensionDefinition) {
  // eslint-disable-line no-use-before-define
  var typeRefs = getTypeRefs(extensionDefinition.definition);
  var directiveRefs = getDirectivesRefs(extensionDefinition.definition);
  var baseType = new _Type.Type(extensionDefinition.name).withExtension(new _ExtensionDefinition.ExtensionDefinition(module, extensionDefinition));
  var typeWithRefs = typeRefs.reduce(function (type, ref) {
    return type.withTypeRef(ref, module);
  }, baseType);
  var typeWithDirectiveRefs = directiveRefs.reduce(function (type, ref) {
    return type.withDirectiveRef(ref, module);
  }, typeWithRefs);
  var baseGraph = getTypeBaseGraph(module, typeWithDirectiveRefs);
  var graphWithRefs = typeRefs.reduce(function (graph, ref) {
    return graph.withType(new _Type.Type(ref));
  }, baseGraph);
  return directiveRefs.reduce(function (graph, ref) {
    return graph.withDirective(new _Directive.Directive(ref));
  }, graphWithRefs);
}

// eslint-disable-next-line no-use-before-define
function extractTypeExtensions(module) {
  // TODO - skip if in schema
  return module.extensionDefinitionNodes.reduce(function (graph, type) {
    return graph.append(extractTypeExtension(module, type));
  }, new FlattenedTypeGraph());
}

// eslint-disable-next-line no-use-before-define
function extractDirective(module, directive) {
  return new _Directive.Directive(directive.name).withDefinition(new _DirectiveDefinition.DirectiveDefinition(module).withDirective(directive));
}

// eslint-disable-next-line no-use-before-define
function extractDirectives(module) {
  return module.directives.reduce(function (graph, directive) {
    return graph.withDirective(extractDirective(module, directive));
  }, new FlattenedTypeGraph());
}

// eslint-disable-next-line no-use-before-define
function extractDirectiveDefinition(module, directive) {
  return new _Directive.Directive(directive.name).withDefinition(new _DirectiveDefinition.DirectiveDefinition(module).withDefinition(directive));
}

// eslint-disable-next-line no-use-before-define
function extractDirectiveDefinitions(module) {
  return module.directiveDefinitionNodes.reduce(function (graph, directive) {
    return graph.withDirective(extractDirectiveDefinition(module, directive));
  }, new FlattenedTypeGraph());
}

// eslint-disable-next-line no-use-before-define
function extractSchema(module) {
  return module.schemaDefinitionNode.map(function (schema) {
    return new FlattenedTypeGraph().withSchema(schema.directives.map(function (directive) {
      return directive.name.value;
    }).reduce(function (s, directive) {
      return s.withDirectiveRef(directive, module);
    }, new _Schema.Schema().withDefinition(new _SchemaDefinition.SchemaDefinition(module, schema))));
  }).getOrElse(new FlattenedTypeGraph());
}

// eslint-disable-next-line no-use-before-define
function fromModule(module) {
  return extractTypes(module).append(extractTypeDefinitions(module)).append(extractTypeExtensions(module)).append(extractDirectives(module)).append(extractDirectiveDefinitions(module)).append(extractSchema(module));
}

// eslint-disable-next-line no-use-before-define
function fromModuleRepository(moduleRepository) {
  return moduleRepository.modules.reduce(function (map, module) {
    return map.append(fromModule(module));
  }, new FlattenedTypeGraph()).withRepository(moduleRepository);
}

var FlattenedTypeGraph = exports.FlattenedTypeGraph = function (_Appendable) {
  _inherits(FlattenedTypeGraph, _Appendable);

  _createClass(FlattenedTypeGraph, null, [{
    key: 'from',
    value: function from(moduleRepository) {
      return fromModuleRepository(moduleRepository);
    }
  }]);

  function FlattenedTypeGraph() {
    var types = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _util.AppendableMap();
    var directives = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new _util.AppendableMap();
    var schema = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new _Schema.Schema();
    var errors = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var moduleRepositories = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
    var typeMap = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new _TypeMap.TypeMap();

    _classCallCheck(this, FlattenedTypeGraph);

    var _this = _possibleConstructorReturn(this, (FlattenedTypeGraph.__proto__ || Object.getPrototypeOf(FlattenedTypeGraph)).call(this));

    _initialiseProps.call(_this);

    _this.types = types;
    _this.directives = directives;
    _this.schema = schema;
    _this.errors = errors;
    _this.moduleRepositories = moduleRepositories;
    _this.typeMap = typeMap;

    _this.typeMap.graph = _this;
    return _this;
  }

  return FlattenedTypeGraph;
}(_util.Appendable);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.append = function (other) {
    return new FlattenedTypeGraph(_this2.types.append(other.types), _this2.directives.append(other.directives), _this2.schema.append(other.schema), [].concat(_toConsumableArray(_this2.errors), _toConsumableArray(other.errors)), [].concat(_toConsumableArray(_this2.moduleRepositories), _toConsumableArray(other.moduleRepositories)));
  };

  this.map = function (decorator) {
    return decorator(_this2);
  };

  this.replaceType = function (type) {
    return new FlattenedTypeGraph(_this2.types.replace(type.name, type), _this2.directives, _this2.schema, _this2.errors, _this2.moduleRepositories);
  };

  this.withType = function (type) {
    return new FlattenedTypeGraph(_this2.types.put(type.name, type), _this2.directives, _this2.schema, _this2.errors, _this2.moduleRepositories);
  };

  this.withDirective = function (directive) {
    return new FlattenedTypeGraph(_this2.types, _this2.directives.put(directive.name, directive), _this2.schema, _this2.errors, _this2.moduleRepositories);
  };

  this.withRepository = function (moduleRepository) {
    return new FlattenedTypeGraph(_this2.types, _this2.directives, _this2.schema, _this2.errors, [].concat(_toConsumableArray(_this2.moduleRepositories), [moduleRepository]));
  };

  this.withSchema = function (schema) {
    return new FlattenedTypeGraph(_this2.types, _this2.directives, _this2.schema.append(schema), _this2.errors, _this2.moduleRepositories);
  };

  this.withError = function (error) {
    return new FlattenedTypeGraph(_this2.types, _this2.directives, _this2.schema, [].concat(_toConsumableArray(_this2.errors), [error]), _this2.moduleRepositories, _this2.typeMap);
  };

  this.withErrors = function (errors) {
    return errors.length > 0 ? new FlattenedTypeGraph(_this2.types, _this2.directives, _this2.schema, [].concat(_toConsumableArray(_this2.errors), _toConsumableArray(errors)), _this2.moduleRepositories, _this2.typeMap) : _this2;
  };

  this.withTypeMap = function (typeMap) {
    return new FlattenedTypeGraph(_this2.types, _this2.directives, _this2.schema, _this2.errors, _this2.moduleRepositories, typeMap);
  };
};