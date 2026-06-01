import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var cachedDb: PrismaClient;
}

// Check if we're in a browser environment or Node.js
const isServer = typeof window === 'undefined';

let db: PrismaClient;

if (isServer) {
  // We're on the server (Node.js environment)
  // Safe to use global here
  if (process.env.NODE_ENV === 'production') {
    db = new PrismaClient();
  } else {
    // Use global for dev environment to avoid too many connections
    if (!(global as any).cachedDb) {
      (global as any).cachedDb = new PrismaClient();
    }
    db = (global as any).cachedDb;
  }
} else {
  // We're in the browser, create a new client instance
  // This should normally not happen with Next.js since Prisma should
  // only run on the server, but this prevents the error
  db = new PrismaClient();
}

export { db };
