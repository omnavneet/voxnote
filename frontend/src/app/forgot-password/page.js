"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setLoading(false);
        router.push(`/confirm-password?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                <a href="/sign-in" className="absolute -top-12 left-0 text-sm text-slate-400 hover:text-white transition-colors">
                    ← Back to sign in
                </a>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    <h1 className="text-2xl font-light text-white mb-2">Reset password</h1>
                    <p className="text-sm text-slate-400 mb-8 font-light">Enter your email to receive a reset code</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2 font-light">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-all font-light"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all font-light disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset Code"}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}