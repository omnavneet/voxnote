"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailClient() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Invalid verification code");
            setLoading(false);
            return;
        }

        router.push("/sign-in");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
                <a href="/sign-up" className="absolute -top-12 left-0 text-sm text-slate-400 hover:text-white">
                    ← Back
                </a>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    <h1 className="text-2xl font-light text-white mb-2">Verify email</h1>
                    <p className="text-sm text-slate-400 mb-8 font-light">
                        Enter the code sent to {email}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Verification code"
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-all font-light"
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full mt-4 py-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl hover:bg-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}