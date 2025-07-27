"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserStatus, getStock } from "@/services/userStock-service";
import { useAuthStore } from "@/stores/authStore";

export default function InvestmentClient() {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);

  useEffect(() => {
    if (!auth?.token) return; // 로그인 안된 경우는 별도 처리
    (async () => {
      try {
        const statusResult = await checkUserStatus(auth.token);
        if (statusResult.hasHoldings) {
          const stockData = await getStock(auth.token);
          const firstCode = stockData.stocks[0]?.stock_code._id;
          if (firstCode) {
            router.replace(`/investment/${firstCode}`);
            return;
          }
        }
      } catch (e) {
        // 없는 경우는 그냥 페이지 유지
      }
    })();
  }, [auth, router]);

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
          className="px-14 py-4 mt-8 text-xl bg-[#426FE5] rounded hover:bg-blue-500"
          onClick={handleLoading}
        >
          연결하기
        </button>
      </div>
    </div>
  );
}
