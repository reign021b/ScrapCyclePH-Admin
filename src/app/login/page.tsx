'use client';

import React, { useState, FormEvent } from 'react';
import Image from "next/image";
import { login } from './actions';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validateInput = (): boolean => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateInput()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      await login(formData);
      // If login is successful, the user will be redirected by the login action
    } catch (error) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col w-96 items-center bg-white px-6 py-8 rounded-xl shadow-lg">
        <Image src={"/logo.png"} width={60} height={60} alt="Logo" />
        <p className="text-green-600 font-semibold text-xl my-3">
          ScrapCycle PH Admin
        </p>
        <form className="flex flex-col w-full items-stretch mt-4 text-gray-800" onSubmit={handleLogin}>
          <label htmlFor="email" className="text-gray-600 font-medium mb-2">
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border border-gray-400 mb-4 p-3"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="text-gray-600 font-medium mb-2">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-lg border border-gray-400 mb-4 p-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg p-2 my-3 hover:bg-green-700 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Submit'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
