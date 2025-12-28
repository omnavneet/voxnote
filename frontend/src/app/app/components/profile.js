"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/auth/me", { credentials: "include" })
            .then((res) => res.json())
            .then(setUser)
            .catch(console.error);
    }, []);

    const changePassword = async () => {
        setStatus("Saving...");
        const res = await fetch("http://localhost:5000/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        setStatus(res.ok ? "Password updated" : "Failed to change password");
        if (res.ok) {
            setOldPassword("");
            setNewPassword("");
        }
    };

    if (!user) return null;

    return (
        <div className="h-[calc(100vh-200px)] md:h-screen flex justify-center px-4 md:px-6 py-4 md:py-8">
            <div className="w-full max-w-md space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <User size={18} className="text-orange-400" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-lg md:text-xl font-light text-slate-200">Account Settings</h1>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-light">
                        Email Address
                    </p>
                    <p className="text-sm text-slate-200 font-light">{user.user.email}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock size={16} className="text-slate-400" strokeWidth={1.5} />
                        <h2 className="text-sm font-light text-slate-200">Change Password</h2>
                    </div>

                    <input
                        type="password"
                        placeholder="Current password"
                        className="w-full text-sm px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="New password"
                        className="w-full text-sm px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && changePassword()}
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={changePassword}
                        className="w-full px-5 py-3 text-sm border border-orange-500/30 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-400 font-light"
                    >
                        Change Password
                    </motion.button>

                    {status && (
                        <p className="text-sm text-slate-400 font-light text-center">{status}</p>
                    )}
                </div>
            </div>
        </div>
    );
}