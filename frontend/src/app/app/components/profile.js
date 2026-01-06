"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Trash2 } from "lucide-react";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [changing, setChanging] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: "include" })
            .then((res) => res.json())
            .then(setUser)
            .catch(console.error);
    }, []);

    const changePassword = async () => {
        if (changing) return;

        setChanging(true);
        setStatus("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus(data.error || "Failed to change password");
                setChanging(false);
                return;
            }

            setStatus("Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            setStatus("Failed to change password");
        } finally {
            setChanging(false);
        }
    };

    const deleteAccount = async () => {
        if (deleting) return;

        setDeleting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-user`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                setStatus("Failed to delete account");
                setDeleting(false);
                return;
            }

            window.location.href = "/sign-in";
        } catch (err) {
            setStatus("Failed to delete account");
            setDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="h-[calc(100vh-200px)] md:h-screen flex justify-center px-4 md:px-6 py-4 md:py-8">
            <div className="w-full max-w-md space-y-5 md:space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 shadow-sm">
                        <User size={22} className="text-indigo-600" strokeWidth={2} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Account Settings</h1>
                </div>

                <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 md:p-6 shadow-lg">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-bold">
                        Email Address
                    </p>
                    <p className="text-base text-gray-800 font-semibold">{user.user.email}</p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 md:p-6 space-y-4 shadow-lg">
                    <div className="flex items-center gap-2.5">
                        <Lock size={20} className="text-gray-600" strokeWidth={2} />
                        <h2 className="text-base font-bold text-gray-800">Change Password</h2>
                    </div>

                    <input
                        type="password"
                        placeholder="Current password"
                        className="w-full text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-800 font-medium transition-all"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="New password"
                        className="w-full text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-800 font-medium transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !changing && changePassword()}
                    />

                    <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={changePassword}
                        disabled={changing}
                        className="w-full px-6 py-3.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/60 transition-all text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {changing ? "Saving..." : "Change Password"}
                    </motion.button>

                    {showDeleteConfirm ? (
                        <div className="space-y-3 pt-2">
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                                <p className="text-sm text-red-600 font-semibold">Are you sure? This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={deleteAccount}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3.5 text-sm bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl shadow-lg shadow-red-300/50 hover:shadow-xl hover:shadow-red-400/60 transition-all text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => !deleting && setShowDeleteConfirm(false)}
                                    className="flex-1 px-6 py-3.5 text-sm bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all text-gray-700 font-bold"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm border-2 border-red-200 rounded-2xl bg-red-50 hover:bg-red-100 transition-all text-red-600 font-bold mt-2"
                        >
                            <Trash2 size={16} strokeWidth={2.5} />
                            Delete Account
                        </motion.button>
                    )}

                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl text-sm font-semibold text-center ${status.includes("successfully")
                                    ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                                    : "bg-red-50 border border-red-100 text-red-600"
                                }`}
                        >
                            {status}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}