import { prisma } from './db.js';
import { GraphQLError } from 'graphql';

export const resolvers = {
    Query: {
        leads: async (_: any, { take, skip }: { take?: number; skip?: number }) => {
            return prisma.lead.findMany({
                include: { services: true },
                orderBy: { createdAt: 'desc' },
                ...(take !== undefined && { take }),
                ...(skip !== undefined && { skip }),
            });
        },

        lead: async (_: any, { id }: { id: string }) => {
            const lead = await prisma.lead.findUnique({
                where: { id },
                include: { services: true },
            });

            if (!lead) {
                throw new GraphQLError('Lead not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return lead;
        },
    },

    Mutation: {
        register: async (_: any, { input }: { input: any }) => {
            try {
                const { name, email, mobile, postcode, services } = input;

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new GraphQLError('Invalid email format', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                // Validate services
                if (!services || services.length === 0) {
                    throw new GraphQLError('At least one service must be selected', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                const lead = await prisma.lead.create({
                    data: {
                        name,
                        email: email.toLowerCase().trim(),
                        mobile,
                        postcode,
                        services: {
                            create: services.map((type: string) => ({ type })),
                        }
                    },
                    include: {
                        services: true,
                    },
                });

                return lead;
            } catch (error: any) {
                // Handle unique constraint violation
                if (error.code === 'P2002') {
                    throw new GraphQLError('Email already registered', {
                        extensions: { code: 'CONFLICT' },
                    });
                }
                throw error;
            }
        },
    },

    Lead: {
        // Transform services array to return just the types
        services: (parent: any) => {
            return parent.services.map((s: any) => s.type);
        },
        // Transform dates to ISO string format
        createdAt: (parent: any) => {
            return parent.createdAt.toISOString();
        },
        updatedAt: (parent: any) => {
            return parent.updatedAt.toISOString();
        },
    },
};
