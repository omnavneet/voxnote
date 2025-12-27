"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConfirmPassword() {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const submit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/auth/confirm-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword }),
        });

        if (!res.ok) {
            alert("Failed to reset password");
            return;
        }

        router.push("/sign-in");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <form onSubmit={submit} className="space-y-4 bg-gray-900 p-6 rounded-xl">
                <h1 className="text-xl font-semibold">Reset Password</h1>

                <input
                    placeholder="Verification code"
                    className="w-72 px-4 py-2 rounded bg-black border border-gray-700"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="New password"
                    className="w-72 px-4 py-2 rounded bg-black border border-gray-700"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <button className="w-full bg-orange-600 py-2 rounded">
                    Reset Password
                </button>
            </form>
        </div>
    );
}
