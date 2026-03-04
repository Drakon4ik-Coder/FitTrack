import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from '../utils/api';

export function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      if (response.ok) {
        navigate('/login');
      } else {
        setError('Registration failed. Username or email may already be taken.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent-red via-accent-yellow to-accent-teal bg-clip-text text-transparent mb-2">
            FitTrack
          </h1>
          <p className="text-text-muted">Start your fitness journey today</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-[0_0_40px_rgba(78,205,196,0.1)]">
          <h2 className="text-2xl font-bold text-white mb-6">Create account</h2>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-xl px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="input-dark"
              />
            </div>
            <button type="submit" className="btn-green w-full mt-2">
              Create Account
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-red hover:text-white transition-colors duration-200 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
