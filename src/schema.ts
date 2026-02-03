import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum ServiceType {
    DELIVERY
    PICKUP
    PAYMENT
  }

  type Lead {
    id: ID!
    name: String!
    email: String!
    mobile: String!
    postcode: String!
    services: [ServiceType!]!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    mobile: String!
    postcode: String!
    services: [ServiceType!]!
  }

  type Query {
    leads: [Lead!]!
    lead(id: ID!): Lead
  }

  type Mutation {
    register(input: RegisterInput!): Lead!
  }
`;
