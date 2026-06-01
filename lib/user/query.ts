// Use dynamic imports for server-only modules to prevent client-side errors
import { unauthorized } from 'next/navigation';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';

// Check if code is running on client or server
const isClient = typeof window !== 'undefined';

// Helper function to safely get headers
async function getHeadersSafe() {
  if (isClient) return undefined;
  try {
    // Use dynamic import for headers
    const { headers } = await import('next/headers');
    return headers();
  } catch (e) {
    console.warn('Could not import headers:', e);
    return undefined;
  }
}

/**
 * Get a user from the database by ID
 */
export async function getDatabaseUser(
  id: string,
  include?: {
    jobPreferences?: boolean;
    profile?: boolean;
  },
) {
  const user = await db.user.findUnique({
    include: include ?? {
      jobPreferences: false,
      profile: false,
    },
    where: {
      id,
    },
  });

  if (!user) {
    unauthorized();
  }

  return user;
}

/**
 * Get the currently authenticated user
 * Uses a safe implementation that works in both client and server contexts
 */
export async function getCurrentUser({
  include,
}: {
  include?: {
    profile?: boolean;
  };
} = {}) {
  let session;
  
  try {
    // Get headers safely for server-side authentication
    const headers = await getHeadersSafe();
    
    // Use headers when available (server-side), otherwise use default approach (client-side)
    if (headers) {
      session = await auth.api.getSession({ headers });
    } else {
      // For client-side or when headers are not available, try without headers
      session = await auth.api.getSession();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }

  if (!session || !session.user) {
    return null;
  }

  // Once we have the session, fetch the full user data
  const user = await db.user.findUnique({
    include: include ?? {
      profile: false,
    },
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Get the current session user without full database user data
 * Uses a safe implementation that works in both client and server contexts
 */
export async function getSessionUser() {
  try {
    // Get headers safely for server-side authentication
    const headers = await getHeadersSafe();
    
    // Use headers when available (server-side), otherwise use default approach (client-side)
    let session;
    if (headers) {
      session = await auth.api.getSession({ headers });
    } else {
      // For client-side or when headers are not available, try without headers
      session = await auth.api.getSession();
    }
    return session?.user;
  } catch (error) {
    console.error('Authentication error in getSessionUser:', error);
    return null;
  }
}
