import { GraphQLClient } from 'graphql-request';

const graphqlClient = new GraphQLClient(process.env.ALCARRITO_GRAPHQL_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export default graphqlClient;