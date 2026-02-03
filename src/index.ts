import 'dotenv/config';
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

const PORT = process.env.PORT || 5200;

server.listen({
    port: PORT,
    cors: {
        origin: ['http://localhost:4200', 'https://studio.apollographql.com'],
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
}).then(({ url }) => {
    console.log(`🚀 Brighte Eats API ready at ${url}`);
    console.log(`🚀 CORS enabled for localhost:4200`);
});
