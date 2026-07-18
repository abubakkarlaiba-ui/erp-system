"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const PUBLIC_PATHS = ["/login", "/register", "/verify-2fa"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, refreshUser, token } = useAuthStore();

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (token && !isAuthenticated && !isLoading) {
      refreshUser();
    }

    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push("/login");
    }

    if (isAuthenticated && isPublicPath) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, token, refreshUser, router]);

  if (isLoading && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
