"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cognitoClient, COGNITO } from '../cognito';
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focused, setFocused] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await cognitoClient.send(new SignUpCommand({
        ClientId: COGNITO.clientId,
        Username: email,
        Password: password,
        UserAttributes: [ 
          { Name: 'email', Value: email }
        ]
      }));
      alert("Sign up successful! Please check your email to confirm your account.");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  };

  return (
    <div className="min-h-screen px-56 bg-black text-white flex relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-600/10 blur-3xl rounded-full" />
      </div>

      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="max-w-md"
        >
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-16 group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back to home</span>
          </a>

          <h1 className="text-5xl font-bold mb-4">Getting Started</h1>
          <p className="text-lg text-gray-400">Create your account to start using VoxNote</p>
        </motion.div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 relative">
        {/* Mobile back button */}
        <a href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-12 mt-12">
            <h1 className="text-3xl font-bold mb-2">VoxNote</h1>
            <p className="text-gray-500 text-sm">Create your account</p>
          </div>

          {/* Form */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 relative">
            {focused && (
              <motion.div
                layoutId="glow"
                className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-red-600/5 rounded-2xl pointer-events-none"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <div className="relative space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <motion.div
                  animate={{ scale: focused === 'email' ? 1.01 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    placeholder="you@example.com"
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 transition-all"
                  />
                </motion.div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <motion.div
                  animate={{ scale: focused === 'password' ? 1.01 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600  transition-all"
                  />
                </motion.div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <motion.div
                  animate={{ scale: focused === 'confirm' ? 1.01 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all"
                  />
                </motion.div>
              </div>

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-orange-600/20"
              >
                Create Account
              </motion.button>
            </div>
          </div>

          {/* Sign in link */}
          <p className="text-center mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/sign-in" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}