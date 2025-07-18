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
  return token
    ? {
        email: "", // 필요 시 빈 문자열 대신 기본값을 넣거나,
        nickname: "", // 추후 프로필 조회 로직에서 채워도 된다
        token,
      }
    : null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  auth: getInitialAuth(),
  setAuth: (auth) => {
    sessionStorage.setItem("token", auth.token);
    set({ auth });
  },
  clearAuth: () => {
    sessionStorage.removeItem("token");
    set({ auth: null });
  },
}));
