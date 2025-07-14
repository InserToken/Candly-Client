"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      if (pathname !== "/auth/login" && pathname !== "/auth/signup") {
        clearAuth();
        router.replace("/auth/login");
      }
    } else {
      if (pathname === "/auth/login" || pathname === "/auth/signup") {
        router.replace("/");
      }
    }
  }, [pathname, setAuth, clearAuth, router]);

  return <>{children}</>;
}
