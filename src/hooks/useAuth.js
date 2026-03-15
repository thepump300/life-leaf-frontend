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
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.replace("/login");
      return;
    }

    // Check token expiry by decoding the payload (no lib needed — JWT is base64)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
