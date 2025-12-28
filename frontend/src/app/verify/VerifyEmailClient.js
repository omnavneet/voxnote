"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailClient() {
    const [code, setCode] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
                <a href="/sign-up" className="absolute -top-12 left-0 text-sm text-slate-400 hover:text-white">
                    ← Back
                </a>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    <h1 className="text-2xl font-light text-white mb-2">Verify email</h1>
                    <p className="text-sm text-slate-400 mb-8 font-light">
                        Enter the code sent to {email}
                    </p>

                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Verification code"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full mt-4 py-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl"
                    >
                        Verify Email
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
