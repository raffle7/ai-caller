// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // On login, check if setup is complete for this user
  const handleLogin = async () => {
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      // Check setup completion
      const setupRes = await fetch('/api/setup/check');
      if (setupRes.ok) {
        const data = await setupRes.json();
        if (data.complete) {
          router.push('/dashboard');
        } else {
          router.push('/setup');
        }
      } else {
        router.push('/setup');
      }
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      {error && <div className="text-red-500">{error}</div>}
      <input
        placeholder="Email"
        className="border p-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-black text-white px-4 py-2 rounded w-full">
        Login
      </button>
    </div>
  );
}
