"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Lock, Trash2, Mail } from "lucide-react";

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
            <div className="w-full max-w-md space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#2D2B28] flex items-center justify-center shadow-[4px_4px_0px_0px_#4ECDC4]">
                        <User size={32} className="text-[#FAF5EE]" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#2D2B28] uppercase tracking-wide leading-none">Settings</h1>
                        <p className="text-sm font-bold text-[#2D2B28]/60 mt-1">Manage your account</p>
                    </div>
                </div>

                <div className="bg-[#E6F9F5] border-2 border-[#2D2B28] rounded-3xl p-6 shadow-[6px_6px_0px_0px_#2D2B28] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Mail size={80} className="text-[#2D2B28]" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-[#2D2B28] mb-2 font-black">
                        Email Address
                    </p>
                    <p className="text-lg text-[#2D2B28] font-bold break-all relative z-10">{user.user.email}</p>
                </div>

                <div className="bg-[#FFF9E6] border-2 border-[#2D2B28] rounded-3xl p-6 md:p-8 space-y-5 shadow-[6px_6px_0px_0px_#2D2B28]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#2D2B28] rounded-lg">
                            <Lock size={18} className="text-[#FFF9E6]" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-lg font-black text-[#2D2B28] uppercase tracking-wide">Security</h2>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="password"
                            placeholder="Current password"
                            className="w-full text-base px-4 py-3 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_#2D2B28] placeholder:text-[#2D2B28]/40 text-[#2D2B28] font-bold transition-all"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="New password"
                            className="w-full text-base px-4 py-3 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_#2D2B28] placeholder:text-[#2D2B28]/40 text-[#2D2B28] font-bold transition-all"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && !changing && changePassword()}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
                        whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                        onClick={changePassword}
                        disabled={changing}
                        className="w-full px-6 py-4 text-sm bg-[#4ECDC4] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#2D2B28] font-black uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                    >
                        {changing ? "Saving..." : "Update Password"}
                    </motion.button>

                    <div className="border-t-2 border-[#2D2B28]/10 pt-4 mt-4">
                        {showDeleteConfirm ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-[#E8503A]/10 border-2 border-[#E8503A]">
                                    <p className="text-sm text-[#E8503A] font-bold text-center">Are you sure? This cannot be undone.</p>
                                </div>
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2, boxShadow: "2px 2px 0px 0px #2D2B28" }}
                                        whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                                        onClick={deleteAccount}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 text-sm bg-[#E8503A] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-white font-black uppercase disabled:opacity-50"
                                    >
                                        {deleting ? "..." : "Yes, Delete"}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2, boxShadow: "2px 2px 0px 0px #2D2B28" }}
                                        whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                                        onClick={() => !deleting && setShowDeleteConfirm(false)}
                                        className="flex-1 px-4 py-3 text-sm bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#2D2B28] font-black uppercase"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm border-2 border-transparent hover:border-[#E8503A] rounded-xl text-[#E8503A]/80 hover:text-[#E8503A] hover:bg-[#E8503A]/5 font-black uppercase transition-all"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                                Delete Account
                            </motion.button>
                        )}
                    </div>

                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-4 rounded-xl text-sm font-bold text-center border-2 ${status.includes("successfully")
                                        ? "bg-[#E6F9F5] border-[#2D2B28] text-[#2D2B28] shadow-[2px_2px_0px_0px_#2D2B28]"
                                        : "bg-[#E8503A] border-[#2D2B28] text-white shadow-[2px_2px_0px_0px_#2D2B28]"
                                    }`}
                            >
                                {status}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}