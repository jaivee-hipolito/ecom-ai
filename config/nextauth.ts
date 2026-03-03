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
          return null;
        }

        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: User } = await import('@/models/User');
        const bcrypt = await import('bcryptjs');

        await connectDB();
        const email = (credentials.email as string).trim().toLowerCase();
        const password = (credentials.password as string).trim().normalize('NFC');

        const user = await User.findOne({ email }).select('+password').sort({ _id: 1 }).lean();
        if (!user || !user.password) {
          return null;
        }

        if (user.isLocked) {
          return null;
        }

        const storedHash = String(user.password);
        const isPasswordValid = await bcrypt.default.compare(password, storedHash);
        if (!isPasswordValid) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[auth] Password length received:', password.length, '— must match script.');
          }
          await User.findOneAndUpdate(
            { _id: user._id },
            [
              {
                $set: {
                  failedLoginAttempts: { $add: [{ $ifNull: ['$failedLoginAttempts', 0] }, 1] },
                  isLocked: {
                    $cond: [
                      { $gte: [{ $add: [{ $ifNull: ['$failedLoginAttempts', 0] }, 1] }, 3] },
                      true,
                      '$isLocked',
                    ],
                  },
                },
              },
            ],
            { updatePipeline: true }
          );
          return null;
        }

        // Successful login: reset failed attempts
        await User.updateOne(
          { _id: user._id },
          { $set: { failedLoginAttempts: 0 } }
        );

        return {
          id: String(user._id),
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || (user.name as string) || 'User',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          contactNumber: user.contactNumber ?? '',
          email: user.email,
          role: user.role ?? 'customer',
          image: user.image ?? '',
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
  logger: {
    error(code, ...message) {
      const codeStr = typeof code === 'string' ? code : (code as Error)?.message ?? String(code);
      const full = [codeStr, ...message].join(' ');
      if (/CredentialsSignin|AccessDenied/i.test(full)) return;
      console.error('[auth][error]', code, ...message);
    },
    warn(code, ...message) {
      console.warn('[auth][warn]', code, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[auth][debug]', code, ...message);
      }
    },
  },
});
