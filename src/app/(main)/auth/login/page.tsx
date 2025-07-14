"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const setAuth = useAuthStore((s) => s.setAuth);
  const getAuth = useAuthStore((s) => s.auth);
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      // toast로 에러 메시지 표시
      toast.error(data.message || "로그인에 실패했습니다.");
      return;
    }

    // 로그인 성공
    const { email, nickname, token } = data;
    setAuth({ email, nickname, token });
    sessionStorage.setItem("token", token);
    router.replace("/");
  };

  useEffect(() => {
    console.log("auth가 스토어에 저장됨:", getAuth);
  }, [getAuth]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-98px)] p-8 sm:p-20">
      <main className="w-full max-w-sm bg-[#1C1C20] border border-[#444444] shadow-md rounded-lg p-8">
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          {/* 이메일 */}
          <div>
            <label htmlFor="loginemail" className="block text-sm text-white">
              이메일
            </label>
            <input
              id="loginemail"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="loginpassword" className="block text-sm text-white">
              비밀번호
            </label>
            <input
              id="loginpassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 text-[#121212] font-semibold rounded-md bg-white hover:bg-[#366FFB] hover:text-white transition"
          >
            로그인
          </button>
        </form>

        <div className="text-center text-white mt-4 text-sm">
          계정이 없으신가요?{" "}
          <button
            onClick={() => router.replace("/auth/signup")}
            className="text-[#366FFB] hover:underline"
          >
            회원가입 하기
          </button>
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        hideProgressBar
        limit={3}
        toastStyle={{
          backgroundColor: "#366FFB",
          fontWeight: 600,
          color: "#FFFFFF",
        }}
      />
    </div>
  );
}
