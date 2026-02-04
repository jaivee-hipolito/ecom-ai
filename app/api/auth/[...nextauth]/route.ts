import { handlers } from '@/config/nextauth';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
