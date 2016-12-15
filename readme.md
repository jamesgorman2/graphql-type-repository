
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
  .map(assertNoMissingTypes)
  .map(assertNoDuplicateTypes)
  .map(assertNoDuplicateResolvers)
  .map(assertNoDuplicateSchemaFields)
  .map(assertNoMissingSchemaResolvers)
  .map(assertNoMissingDirectives)
  .map(assertNoTypesWithRawAndSchemaDefinitions)
  .map(assertNoDisconnectedSubgraphs)
  .map(assertNoUnusedDirectives)
  .map(generateFinalTypes);

const schema: GraphQLSchema = parsedTypeGraph.getSchema({ query: 'Query' });
```
