"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const PUBLIC_PATHS = ["/login", "/register", "/verify-2fa"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!isAuthenticated && !isPublicPath) {
      router.replace("/login");
    } else if (isAuthenticated && isPublicPath) {
      router.replace("/dashboard");
    }
  }, [mounted, _hasHydrated, isAuthenticated, pathname, router]);

  if (!mounted || !_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!isAuthenticated && !isPublicPath) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
