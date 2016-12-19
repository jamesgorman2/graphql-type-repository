# graphql-type-repository

A repository for assembling GraphQL types and schemas from modules.

[![npm version](https://badge.fury.io/js/graphql-type-repository.svg)](https://badge.fury.io/js/graphql-type-repository) [![Build Status](https://travis-ci.org/jamesgorman2/graphql-type-repository.svg?branch=master)](https://travis-ci.org/jamesgorman2/graphql-type-repository) [![Coverage Status](https://coveralls.io/repos/github/jamesgorman2/graphql-type-repository/badge.svg?branch=master)](https://coveralls.io/github/jamesgorman2/graphql-type-repository?branch=master)

`graphql-type-repository` provides a repository for assembling
GraphQL types and schemas for (GraphQL.js)[https://github.com/graphql/graphql-js].
It's goal is to provide additional checking to safely modularise a GraphQL
schema specified in the GraphQL schema language.

## TODO
- [ ] finish decorators
- [ ] finish schema builder
- [ ] finish root class and config
- [ ] fix this page
- [ ] example server
- [ ] wiki with more detail on why this exists
- [ ] wiki with more detail on how to build things
- [ ] wiki with more detail on the internal details
- [ ] use Module to get type so we can register refs from raw types
- [ ] panic checking for unexpected state
- [ ] extend raw types

## Getting Started

### Using graphql-type-repository

Install graphql-type-repository from npm

```sh
npm install --save graphql-type-repository graphql-js
```
or
```sh
yarn add graphql-type-repository graphql-js
```

Note that graphql-js is a peer dependency and must be installed
separately.

### Node support

`graphql-type-repository` is tested against node 4, 6 and 7. It uses
(Babel)[https://babeljs.io/] to convert es6 to es6-node.

### Want to ride the bleeding edge?

The `npm` branch in this repository is automatically maintained to be the last
commit to `master` to pass all tests, in the same form found on npm. It is
recommend to use builds deployed npm for many reasons, but if you want to use
the latest not-yet-released version of graphql-type-repository, you can do so by depending
directly on this branch:

```
npm install graphql@git://github.com/jamesgorman2/graphql-type-repository.git#npm
```

### Contributing

We actively welcome pull requests, learn how to
[contribute](https://github.com/jamesgorman2/graphql-type-repository/blob/master/CONTRIBUTING.md).

### Changelog

Changes are tracked as [Github releases](https://github.com/jamesgorman2/graphql-type-repository/releases).

### License

GraphQL is [BSD-licensed](https://github.com/jamesgorman2/graphql-type-repository/blob/master/LICENSE).

Build steps and CONTRIBUTING.md are modified from (GraphQL.js)[https://github.com/graphql/graphql-js]
under the same license.

## Code example

### `personModule.js`
```javascript
import {
  Module,
} from 'graphql-type-repository';

import personResolvers from './personResolvers';

export default const personModule: Module = new Module('Person')
  .withSchema(`
type Name {
  firstName: String!
  lastName: String!
}
type Person {
  id: ID!
  name: Name
  age: Int
}
type PersonQuery {
  getPersonById(id: ID!): Person
}
schema {
  query PersonQuery
}`,
  personResolvers,
);
```

### `propertyModule.js`
```javascript
import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import {
  Module,
} from 'graphql-type-repository';

import propertyResolvers from './propertyResolvers';

export default const propertyModule: Module = new Module('Property')
  .withType(
    new GraphQLObjectType({
      name: 'Address',
      fields: {
        street: { type: GraphQLString },
        postCode: { type: GraphQLString },
      },
    })
  )
  .withSchema(`
type Property {
  id: ID!
  address: Address
  occupants: [Person]
}
extend type Person {
  livesAt: Property
}
type PropertyQuery {
  getPropertyById(id: ID!): Property
}
schema {
  query PropertyQuery
}`,
  propertyResolvers,
);
```

### `buildSchema.js`
```javascript
import {
  TypeRepository,
} from 'graphql-type-repository';

import personModule from './personModule';
import propertyModule from './propertyModule';

export const schema = new TypeRepository()
  .add(personModule)
  .add(propertyModule)
  .getSchema({ query: 'Query' });
```

### Effective schema
```
type Name {
  firstName: String!
  lastName: String!
}
type Person {
  id: ID!
  name: Name
  age: Int
  livesAt: Property
}
type Address {
  street: String
  postCode: String
}
type Property {
  id: ID!
  address: Address
  occupants: [Person]
}
type Query {
  getPersonById(id: ID!): Person
  getPropertyById(id: ID!): Property
}
schema {
  query Query
}
```

### Internal repository execution
```javascript
const internalRepository: ModuleRepository = new ModuleRepository()
  .withModule(personModule)
  .withModule(propertyModule);

const parsedTypeGraph: FlattenedTypeGraph = FlattenedTypeGraph.from(internalRepository)
  .map(appendSystemTypes)
  .map(appendSystemDirectives)
  .map(assertNoSystemTypesDefinedByUser)
  .map(assertNoSystemDirectivesDefinedByUser)

  .map(assertNoModuleRepositoryErrors)
  .map(assertNoModuleErrors)

  .map(assertNoMissingTypes)
  .map(assertNoDuplicateTypes)
  .map(assertNoDuplicateExtensionFields)
  .map(assertNoDuplicateSchemaFields)
  .map(assertNoMissingSchemaResolvers)

  .map(assertNoDisconnectedSubgraphs)

  .map(assertNoDuplicateDirectives)
  .map(assertNoMissingDirectives)
  .map(assertNoUnusedDirectives)

  .map(generateFinalTypes);

const schema: GraphQLSchema = parsedTypeGraph.getSchema({ query: 'Query' });
```
