// src/app/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      const { token } = await res.json();
      localStorage.setItem('token', token); // Store token
      router.push('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-black">SaaS Notes Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-black">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-black"
              placeholder="e.g., user@acme.test"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-black">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-black"
              placeholder="password"
            />
          </div>
          {error && <p className="text-sm text-black">{error}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </button>
          </div>
        </form>
        <div className="p-4 mt-4 text-sm bg-gray-50 rounded-md text-black">
            <h4 className="font-bold text-black">Test Accounts (password: password)</h4>
            <ul className="list-disc list-inside text-black">
                <li>admin@acme.test (Acme Admin)</li>
                <li>user@acme.test (Acme Member)</li>
                <li>admin@globex.test (Globex Admin)</li>
                <li>user@globex.test (Globex Member)</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
