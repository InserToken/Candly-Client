"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // const setAuth = useUserStore((s) => s.setAuth)
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

    // const { email, nickname, token } = data;
    // setUser({
    //     email,
    //     nickname,
    //     token
    // })

    sessionStorage.setItem("token", data.token);

    // Todo: 라우터 확인하기
    router.replace("/main");
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] ">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 ">로그인</h1>
      </header>

      <main className="w-full max-w-sm bg-white shadow-md rounded-lg p-8">
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              type="email"
              id="loginemail"
              value={loginEmail}
              placeholder="example@email.com"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="loginpassword"
              value={loginPassword}
              placeholder="비밀번호를 입력하세요"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 text-white font-semibold rounded-md bg-green-600 hover:bg-red-500 transition"
          >
            로그인
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 mt-4 ">
          {"계정이 없으신가요? "}
          <button
            type="button"
            className="text-green-600 hover:underline"
            onClick={() => router.replace("/auth/signup")}
          >
            {"로그인 하기"}
          </button>
        </div>
      </main>
    </div>
  );
}
