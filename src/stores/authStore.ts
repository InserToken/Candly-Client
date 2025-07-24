"use client";

import { create } from "zustand";
import { Auth } from "@/types/Auth";

interface AuthStore {
  auth: Auth | null;
  setAuth: (auth: Auth) => void;
  clearAuth: () => void;
}

// 세션 스토리지에서 토큰만 읽어서 Auth 객체로 변환
const getInitialAuth = (): Auth | null => {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("token");
  const nickname = sessionStorage.getItem("nickname");
  const email = sessionStorage.getItem("email");
  return token
    ? {
        email: email || "",
        nickname: nickname || "",
        token,
      }
    : null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  auth: getInitialAuth(),
  setAuth: (auth) => {
    sessionStorage.setItem("token", auth.token);
    sessionStorage.setItem("nickname", auth.nickname);
    sessionStorage.setItem("email", auth.email);
    set({ auth });
  },
  clearAuth: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("nickname");
    sessionStorage.removeItem("email");
    set({ auth: null });
  },
}));
