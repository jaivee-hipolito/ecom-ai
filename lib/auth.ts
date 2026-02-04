import { auth } from '@/config/nextauth';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return session;
}
