# Brighte Eats API

A modern GraphQL API for managing food service leads, built with Node.js, Apollo Server, and Prisma.

## Features

- **GraphQL API**: Schema-first approach with Apollo Server 5.
- **Database**: Prisma ORM with SQLite for easy setup.
- **TypeScript**: Fully typed codebase with modern ESM support.
- **Testing**: Robust test suite using Jest and `ts-jest`.
- **Validation**: Built-in email validation and duplicate checking.

## Tech Stack

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [SQLite](https://www.sqlite.org/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. (Optional) Create a `.env` file based on your environment needs:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=5200
   ```

### Running the Application

- **Development Mode** (with hot reload):
  ```bash
  npm run dev
  ```
  The GraphQL playground will be available at `http://localhost:4000`.

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

### Running Tests

Execute the test suite:
```bash
npm test
```

## API Documentation

### Schema

#### Queries
- `leads`: List all leads, ordered by creation date (newest first).
- `lead(id: ID!)`: Fetch a specific lead by its ID.

#### Mutations
- `register(input: RegisterInput!)`: Register a new lead with service interests.

#### Data Models

**Lead**
- `id`: Unique identifier (UUID).
- `name`: Full name.
- `email`: Unique email address.
- `mobile`: Contact number.
- `postcode`: Area code.
- `services`: List of interested services (`DELIVERY`, `PICKUP`, `PAYMENT`).

### Example Mutation

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    id
    name
    services
  }
}
```

## Development

### ESM Configuration
This project uses Native ESM. Imports in TypeScript must include the `.js` extension (e.g., `import { foo } from './foo.js'`) even though the file is natively `.ts`.

### Project Structure
```text
├── prisma/               # Database schema and migrations
├── src/
│   ├── tests/           # Jest tests and configuration
│   ├── schema.ts        # GraphQL Type Definitions
│   ├── resolvers.ts     # GraphQL Resolvers
│   ├── db.ts            # Prisma Client setup
│   ├── context.ts       # Apollo Context
│   └── index.ts         # Server Entry point
├── package.json
└── tsconfig.json
```
