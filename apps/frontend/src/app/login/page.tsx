'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Inbox, Zap, Clock, Slack } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGoogleSignIn = async () => {
    await loginWithGoogle();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle animated radial background gradient */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/30 via-cyan-500/20 to-purple-500/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="liquid-glass w-full max-w-md p-10 rounded-[32px] border border-white/10 shadow-2xl relative z-10 space-y-8 text-center"
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl">
            <Inbox className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">ReachInbox</span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="font-serif italic text-6xl font-normal text-white leading-none tracking-tight">
            Schedule Emails <br />
            <span className="not-italic">at Scale</span>
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed px-4">
            AI-powered email scheduling platform with BullMQ, Redis and Elasticsearch.
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-gray-100 text-black font-semibold text-sm shadow-2xl flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </motion.button>
        </div>

        {/* Feature Badges Footer */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-medium">
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-4 h-4 text-white" />
            <span>BullMQ Engine</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-white" />
            <span>Redis Rate Limiter</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Slack className="w-4 h-4 text-white" />
            <span>Slack Web API</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
