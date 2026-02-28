import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Only add Google provider if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        // Lazy load MongoDB only when authorize is called (not at module evaluation)
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: User } = await import('@/models/User');
        const bcrypt = await import('bcryptjs');

        const mongoose = await connectDB();
        const email = (credentials.email as string).trim().toLowerCase();
        const password = (credentials.password as string).trim().normalize('NFC');

        // Same collection + sort as set-local-password.mjs; normalize password so form and script match
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database not connected');
        const rawUser = await db.collection('users').findOne(
          { email },
          { sort: { _id: 1 } }
        );
        if (!rawUser || !rawUser.password) {
          throw new Error('Invalid email or password');
        }

        const storedHash = String(rawUser.password);
        const isPasswordValid = await bcrypt.default.compare(password, storedHash);
        if (!isPasswordValid) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[auth] Password length received:', password.length, '— must match script.');
          }
          throw new Error('Invalid email or password');
        }

        return {
          id: String(rawUser._id),
          name: [rawUser.firstName, rawUser.lastName].filter(Boolean).join(' ') || (rawUser.name as string) || 'User',
          firstName: rawUser.firstName ?? '',
          lastName: rawUser.lastName ?? '',
          contactNumber: rawUser.contactNumber ?? '',
          email: rawUser.email,
          role: rawUser.role ?? 'customer',
          image: rawUser.image ?? '',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google)
      if (account?.provider === 'google') {
        try {
          const { default: connectDB } = await import('@/lib/mongodb');
          const { default: User } = await import('@/models/User');

          await connectDB();

          // Check if user exists by email
          const existingUser = await User.findOne({ email: user.email?.toLowerCase() });

          if (!existingUser) {
            // Create new user from Google profile
            const nameParts = user.name?.split(' ') || [];
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || '';

            await User.create({
              firstName,
              lastName,
              email: user.email?.toLowerCase() || '',
              contactNumber: '', // OAuth users can add this later
              password: '', // OAuth users don't have passwords
              role: 'customer',
              image: user.image || '',
            });
          }
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          // Allow sign-in to proceed even if DB operation fails
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Fetch user from database to get full profile
        try {
          const { default: connectDB } = await import('@/lib/mongodb');
          const { default: User } = await import('@/models/User');

          await connectDB();

          const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
          
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.contactNumber = dbUser.contactNumber;
            token.email = dbUser.email;
          } else {
            // Fallback to OAuth user data
            token.id = user.id;
            token.role = (user as any).role || 'customer';
            token.firstName = (user as any).firstName || user.name?.split(' ')[0] || '';
            token.lastName = (user as any).lastName || user.name?.split(' ').slice(1).join(' ') || '';
            token.contactNumber = (user as any).contactNumber || '';
            token.email = user.email || '';
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
          // Fallback to OAuth user data
          token.id = user.id;
          token.role = (user as any).role || 'customer';
          token.firstName = (user as any).firstName || user.name?.split(' ')[0] || '';
          token.lastName = (user as any).lastName || user.name?.split(' ').slice(1).join(' ') || '';
          token.contactNumber = (user as any).contactNumber || '';
          token.email = user.email || '';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).contactNumber = token.contactNumber;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (fallback, but inactivity timeout will handle actual logout)
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Session cookie expires when browser closes (no maxAge means session cookie)
        // But we'll also handle this client-side for better control
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5/Auth.js
  basePath: '/api/auth', // Explicitly set the base path
});
