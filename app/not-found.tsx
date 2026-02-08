import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050b2c] via-[#0a1a4a] to-[#050b2c]">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-white/70 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
