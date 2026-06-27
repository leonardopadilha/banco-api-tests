require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

server.listen({ port: process.env.GRAPHQLPORT }).then(({ url }) => {
  console.log(`Servidor GraphQL rodando em ${url}`);
});
