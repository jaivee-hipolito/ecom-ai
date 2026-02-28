'use client';

import { useState } from 'react';

/**
 * Dev-only: set a local user password so it matches what the browser sends when you log in.
 * Only use in development. Open /dev/set-password, enter email + password, submit, then log in.
 */
export default function DevSetPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/set-local-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'ok', text: data.message });
      } else {
        setMessage({ type: 'err', text: data.message || 'Failed' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Set local password (dev only)</h1>
        <p className="text-sm text-gray-500 mb-4">
          Use the same email and password here, then log in on the login page.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              placeholder="admin@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              placeholder="Min 12 chars, 2 letters, 2 numbers, 2 special"
            />
          </div>
          {message && (
            <p className={message.type === 'ok' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Set password'}
          </button>
        </form>
      </div>
    </div>
  );
}
