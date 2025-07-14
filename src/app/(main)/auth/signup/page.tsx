"use client";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpNickname, setSignUpNickname] = useState("");
  const router = useRouter();

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: signUpEmail,
        password: signUpPassword,
        nickname: signUpNickname,
      }),
    });

    if (!res.ok) {
      console.error("회원가입 실패", await res.text());
      return;
    }
    const data = await res.json();
    console.log("회원가입 성공 : ", data);

    toast.success("회원가입 완료! 로그인으로 이동합니다.", {
      onClose: () => {
        router.replace("/auth/login");
      },
      autoClose: 1500,
    });

    setSignUpEmail("");
    setSignUpPassword("");
    setConfirmPassword("");
    setSignUpNickname("");
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] ">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 ">{"회원가입"}</h1>
      </header>

      <main className="w-full max-w-sm bg-white shadow-md rounded-lg p-8">
        <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              type="email"
              id="signupemail"
              value={signUpEmail}
              placeholder="example@email.com"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              type="text"
              id="signupnickname"
              value={signUpNickname}
              placeholder="홍길동"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              onChange={(e) => setSignUpNickname(e.target.value)}
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
              id="signuppassword"
              value={signUpPassword}
              placeholder="비밀번호를 입력하세요"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4  text-white font-semibold rounded-md bg-green-600 hover:bg-red-500 transition"
          >
            회원가입
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 mt-4 ">
          {"이미 계정이 있으신가요? "}
          <button
            type="button"
            className="text-green-600 hover:underline"
            onClick={() => router.replace("/auth/login")}
          >
            {"로그인 하기"}
          </button>
        </div>
      </main>
      <ToastContainer position="bottom-right" hideProgressBar limit={3} />
    </div>
  );
}
