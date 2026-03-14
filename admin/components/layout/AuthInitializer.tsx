"use client";

import { useEffect, useRef } from "react";
import { setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * On every page load/refresh, silently tries to get a fresh access token
 * using the httpOnly refresh_token cookie. This ensures API calls work
 * without requiring the user to re-login after a page refresh.
 * Also populates Zustand auth store with user data.
 */
export function AuthInitializer() {
  const initialized = useRef(false);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch(`${API_BASE}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          setUser({
            username: data.data.username,
            fullName: data.data.fullName,
            email: data.data.email,
            role: data.data.role,
            storeId: data.data.storeId ?? null,
            storeName: data.data.storeName ?? null,
          });
        }
      })
      .catch(() => {
        // Cookie scaduto o assente — il middleware rimanda a /login
      });
  }, [setUser]);

  return null;
}
