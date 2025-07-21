"use client";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

export default function SignupClient() {
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

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signUpEmail,
          password: signUpPassword,
          nickname: signUpNickname,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      // toast로 에러 메시지 표시
      toast.error(data.message || "회원가입에 실패했습니다.", {
        autoClose: 2500,
      });
      return;
    }

    console.log("회원가입 성공 : ", data);

    toast.success("회원가입 완료! 로그인으로 이동합니다.", {
      onClose: () => {
        router.replace("/auth/login");
      },
      autoClose: 1000,
    });

    setSignUpEmail("");
    setSignUpPassword("");
    setConfirmPassword("");
    setSignUpNickname("");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-98px)] p-8 sm:p-20">
      <main className="w-full max-w-sm bg-[#1C1C20] border border-[#444444] shadow-md rounded-lg p-8">
        <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              이메일
            </label>
            <input
              type="email"
              id="signupemail"
              value={signUpEmail}
              placeholder="example@email.com"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              닉네임
            </label>
            <input
              type="text"
              id="signupnickname"
              value={signUpNickname}
              placeholder="홍길동"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              onChange={(e) => setSignUpNickname(e.target.value)}
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
              id="signuppassword"
              value={signUpPassword}
              placeholder="비밀번호를 입력하세요"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-white"
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full mt-1 px-4 py-2 border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#366FFB] text-white placeholder-[#777779]"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 text-[#121212] font-semibold rounded-md bg-white hover:bg-[#366FFB] hover:text-white transition"
          >
            회원가입
          </button>
        </form>

        <div className="text-sm text-center text-white mt-4 ">
          {"이미 계정이 있으신가요? "}
          <button
            type="button"
            className="text-[#366FFB] font-semibold hover:underline"
            onClick={() => router.replace("/auth/login")}
          >
            {"로그인 하기"}
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
