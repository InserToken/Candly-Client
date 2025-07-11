"use client";

import { create } from "zustand";
import { Auth } from "@/types/Auth";

interface AuthStore {
  auth: {
    // 이메일, 닉네임, 토큰 저장
    email: string;
    nickname: string;
    token: string;
  } | null;
  setAuth: (auth: Auth) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  auth: null,
  setAuth: (auth) => set({ auth }),
  clearAuth: () => set({ auth: null }),
}));
