"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: "include" });

        if (!res.ok) {
          const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { method: "POST", credentials: "include" });
          if (!r.ok) redirect("/sign-in");
        }

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
