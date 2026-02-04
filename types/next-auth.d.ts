import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    firstName?: string;
    lastName?: string;
    contactNumber?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      contactNumber?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    firstName?: string;
    lastName?: string;
    contactNumber?: string;
  }
}

