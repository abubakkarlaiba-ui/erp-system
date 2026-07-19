"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const PUBLIC_PATHS = ["/login", "/register", "/verify-2fa"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, token, _hasHydrated, refreshUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkAuth = useCallback(async () => {
    if (!mounted || !_hasHydrated) return;

    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (isAuthenticated) {
      setAuthChecked(true);
      if (isPublicPath) {
        router.push("/dashboard");
      }
      return;
    }

    if (token && !isAuthenticated) {
      try {
        await refreshUser();
        setAuthChecked(true);
        if (isPublicPath) {
          router.push("/dashboard");
        }
      } catch {
        if (!isPublicPath) {
          router.push("/login");
        }
        setAuthChecked(true);
      }
      return;
    }

    if (!token && !isAuthenticated && !isPublicPath) {
      router.push("/login");
      setAuthChecked(true);
      return;
    }

    setAuthChecked(true);
  }, [mounted, _hasHydrated, isAuthenticated, token, pathname, refreshUser, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!mounted || !_hasHydrated || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
