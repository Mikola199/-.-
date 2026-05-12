'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging in with ${email}... (In a real app, this would call the API Gateway)`);
  };

  return (
    <main className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <section className="panel">
        <h1 style={{ textAlign: 'center' }}>Login to GLock</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" style={{ width: '100%' }}>Sign In</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          Don't have an account? <a href="#">Register</a>
        </p>
      </section>
    </main>
  );
}
