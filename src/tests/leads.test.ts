// import { ApolloServer, gql } from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import type { ExecutionResult } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from '../schema.js';
import { resolvers } from '../resolvers.js';

// Define context interface
interface MyContext {
    prisma: PrismaClient;
}

const testPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL || 'file:./dev.db',
        },
    },
});

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    // context: () => ({ prisma: testPrisma }),
});

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      name
      email
      mobile
      postcode
      services
      createdAt
    }
  }
`;

const GET_LEADS_QUERY = gql`
  query GetLeads {
    leads {
      id
      name
      email
      services
    }
  }
`;

const GET_LEAD_QUERY = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      name
      email
    }
  }
`;

describe('Brighte Eats API', () => {
    beforeAll(async () => {
        await testPrisma.$connect();
        await testPrisma.serviceInterest.deleteMany();
        await testPrisma.lead.deleteMany();
    });

    afterAll(async () => {
        await testPrisma.$disconnect();
    });

    beforeEach(async () => {
        await testPrisma.serviceInterest.deleteMany();
        await testPrisma.lead.deleteMany();
    });

    // Helper to simplify the v4 executeOperation response
    const runOp = async (query: any, variables?: any): Promise<ExecutionResult<any>> => {
        const res = await server.executeOperation(
            { query, variables },
            { contextValue: { prisma: testPrisma } }
        );

        // Type guard for single result
        if (res.body.kind === 'single') {
            return res.body.singleResult as ExecutionResult<any>;
        }

        // Tests don't handle subscriptions/incremental delivery
        throw new Error('Incremental results not supported in tests');
    };

    describe('Mutation: register', () => {
        it('should create a new lead with service interests', async () => {
            const result = await runOp(REGISTER_MUTATION, {
                input: {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    mobile: '0412345678',
                    postcode: '2000',
                    services: ['DELIVERY', 'PICKUP'],
                },
            });

            expect(result.errors).toBeUndefined();
            expect(result.data?.register).toMatchObject({
                name: 'Jane Doe',
                email: 'jane@example.com',
                mobile: '0412345678',
                postcode: '2000',
                services: ['DELIVERY', 'PICKUP'],
            });
            expect(result.data?.register.id).toBeDefined();
        });

        it('should reject duplicate emails', async () => {
            // First registration
            await server.executeOperation({
                query: REGISTER_MUTATION,
                variables: {
                    input: {
                        name: 'John Doe',
                        email: 'john@example.com',
                        mobile: '0412345678',
                        postcode: '2000',
                        services: ['PAYMENT'],
                    },
                },
            });

            // Second registration with same email
            const result = await runOp(REGISTER_MUTATION, {
                input: {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    mobile: '0412345678',
                    postcode: '2000',
                    services: ['DELIVERY'],
                },
            },
            );

            expect(result.errors).toBeDefined();
            expect(result.errors?.[0]?.message).toContain('Email already registered');
        });

        it('should validate email format', async () => {
            const result = await runOp(REGISTER_MUTATION, {
                input: {
                    name: 'Test User',
                    email: 'invalid-email',
                    mobile: '0412345678',
                    postcode: '2000',
                    services: ['DELIVERY'],
                },
            },
            );

            expect(result.errors).toBeDefined();
            expect(result?.errors?.[0]?.message).toContain('Invalid email format');
        });

        it('should require at least one service', async () => {
            const result = await runOp(REGISTER_MUTATION, {
                input: {
                    name: 'Test User',
                    email: 'test@example.com',
                    mobile: '0412345678',
                    postcode: '2000',
                    services: [],
                },
            },
            );

            expect(result.errors).toBeDefined();
            expect(result.errors?.[0]?.message).toContain('At least one service');
        });
    });

    describe('Query: leads', () => {
        it('should return all leads', async () => {
            // Create test leads
            await server.executeOperation({
                query: REGISTER_MUTATION,
                variables: {
                    input: {
                        name: 'Lead One',
                        email: 'lead1@example.com',
                        mobile: '0411111111',
                        postcode: '2000',
                        services: ['DELIVERY'],
                    },
                },
            });

            await server.executeOperation({
                query: REGISTER_MUTATION,
                variables: {
                    input: {
                        name: 'Lead Two',
                        email: 'lead2@example.com',
                        mobile: '0422222222',
                        postcode: '3000',
                        services: ['PICKUP', 'PAYMENT'],
                    },
                },
            });

            const result = await runOp(GET_LEADS_QUERY);

            expect(result.errors).toBeUndefined();
            expect(result.data?.leads).toHaveLength(2);
            expect(result.data?.leads[0].name).toBe('Lead Two'); // Ordered by desc createdAt
            expect(result.data?.leads[1].services).toContain('DELIVERY');
        });
    });

    describe('Query: lead', () => {
        it('should return a single lead by ID', async () => {
            const createResult = await runOp(REGISTER_MUTATION, {
                input: {
                    name: 'Single Lead',
                    email: 'single@example.com',
                    mobile: '0433333333',
                    postcode: '4000',
                    services: ['PAYMENT'],
                },
            },
            );

            const leadId = createResult.data?.register.id;

            const result = await runOp(GET_LEAD_QUERY, {
                variables: { id: leadId },
            });

            expect(result.errors).toBeUndefined();
            expect(result.data?.lead).toMatchObject({
                name: 'Single Lead',
                email: 'single@example.com',
            });
        });

        it('should return error for non-existent lead', async () => {
            const result = await runOp(GET_LEAD_QUERY, {
                variables: { id: 'non-existent-id' },
            });

            expect(result.errors).toBeDefined();
            expect(result.errors?.[0]?.message).toContain('Lead not found');
        });
    });
});
