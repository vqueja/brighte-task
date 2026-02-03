import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { createContext } from './context.js';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    introspection: true,
});

const PORT = process.env.PORT || 4000;

server.listen({ port: PORT }).then(({ url }) => {
    console.log(`🚀 Brighte Eats API ready at ${url}`);
});
