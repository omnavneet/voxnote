"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        await fetch("http://localhost:5000/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        setLoading(false);
        router.push(`/confirm-password?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <form onSubmit={submit} className="space-y-4 bg-gray-900 p-6 rounded-xl">
                <h1 className="text-xl font-semibold">Reset Password</h1>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-72 px-4 py-2 rounded bg-black border border-gray-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className="w-full bg-orange-600 py-2 rounded">
                    Send Reset Code
                </button>
            </form>
        </div>
    );
}
