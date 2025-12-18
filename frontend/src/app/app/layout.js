"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error();
        setLoading(false);
      } catch {
        router.replace("/sign-in");
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return <div>Checking session…</div>;
  }

  return children;
}
