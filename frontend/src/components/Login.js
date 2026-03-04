import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import API_BASE from '../utils/api';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login({ token: data.access, refreshToken: data.refresh });
        navigate('/');
      } else {
        setError('Invalid username or password');
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
          <p className="text-text-muted">Sign in to track your nutrition</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-[0_0_40px_rgba(255,107,107,0.1)]">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome back</h2>

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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                required
                className="input-dark"
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">
              Sign In
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-teal hover:text-white transition-colors duration-200 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
