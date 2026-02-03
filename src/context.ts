import { prisma } from './db.js';

export interface Context {
    prisma: typeof prisma;
}

export const createContext = (): Context => ({
    prisma,
});
