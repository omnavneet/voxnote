"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      alert("Invalid verification code");
      return;
    }
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <a href="/sign-up" className="absolute -top-12 left-0 text-sm text-slate-400 hover:text-white transition-colors">
          ← Back
        </a>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-light text-white mb-2">Verify email</h1>
          <p className="text-sm text-slate-400 mb-8 font-light">Enter the code sent to {email}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2 font-light">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-all font-light"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full py-3 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all font-light"
            >
              Verify Email
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}