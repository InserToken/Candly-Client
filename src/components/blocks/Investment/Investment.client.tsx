"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function InvestmentClient() {
  const router = useRouter();

  const handleLoading = () => {
    router.replace("/investment/loading");
  };

  return (
    <div className="flex flex-col items-center mt-50">
      <h1 className="text-3xl mb-4">계좌 연결하기</h1>
      <p className="mb-8 text-xl text-center">
        내 보유주식의 시세를 예측하려면 <br />
        <span className="text-[#396FFB]">계좌 연결</span>이 필요합니다.
      </p>
      <div className="flex">
        <button
          className="px-14 py-4 text-xl bg-[#426FE5] rounded hover:bg-blue-500"
          onClick={handleLoading}
        >
          연결하기
        </button>
      </div>
    </div>
  );
}
