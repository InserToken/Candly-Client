"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 각각 Auth 스토어에 저장하기, 들고오는 변수
  const setAuth = useAuthStore((s) => s.setAuth);
  const getAuth = useAuthStore((s) => s.auth);
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    if (!res.ok) {
      console.log("로그인 실패", await res.text());
      alert("로그인 실패");
    }

    const data = await res.json();

    const { email, nickname, token } = data;
    // stores/authStore에 email, nickname, token 저장
    setAuth({
      email,
      nickname,
      token,
    });

    sessionStorage.setItem("token", data.token);

    // Todo: 라우터 확인하기
    router.replace("/");
  };

  // Test: auth 저장 잘 되는지
  useEffect(() => {
    console.log("auth가 스토어에 저장됨:", getAuth);
  }, [getAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-sm bg-[#1C1C20] border border-[#444444] shadow-md rounded-lg p-8">
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              이메일
            </label>
            <input
              type="email"
              id="loginemail"
              value={loginEmail}
              placeholder="example@email.com"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="loginpassword"
              value={loginPassword}
              placeholder="비밀번호를 입력하세요"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              onChange={(e) => setLoginPassword(e.target.value)}
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

        <div className="text-sm text-center text-white mt-4 ">
          {"계정이 없으신가요? "}
          <button
            type="button"
            className="text-[#366FFB] font-semibold hover:underline"
            onClick={() => router.replace("/auth/signup")}
          >
            {"회원가입 하기"}
          </button>
        </div>
      </main>
    </div>
  );
}
