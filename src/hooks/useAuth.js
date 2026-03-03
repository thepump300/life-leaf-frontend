"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side auth guard.
 * Reads token + user from localStorage, redirects to /login if missing.
 * Returns { user, loading } for use in protected pages.
 */
export function useAuth() {
  const router  = useRouter();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      router.replace("/login");
      return;
    }

    setLoading(false);
  }, [router]);

  return { user, loading };
}
