"use client";

import React, { useEffect, useState } from "react";
import { getStock } from "@/services/userStock-service";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function LoadingPage() {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [stocks, setStocks] = useState<
    { stock_code: string; company: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);

  useEffect(() => {
    if (!auth?.token) {
      console.warn("로그인 필요");
      return router.push("/auth/login"); // 로그인 페이지로 이동 등 처리
    }

    const fetchData = async () => {
      const start = Date.now(); // 요청 시작 시간
      const result = await getStock(auth.token);
      const elapsed = Date.now() - start; // 요청 끝난 시간 - 시작 시간
      const minDelay = 1500; // 최소 로딩 시간
      const wait = elapsed < minDelay ? minDelay - elapsed : 0;

      setTimeout(() => {
        console.log("✅ getStock result:", result);

        if ("message" in result) {
          setStatus("error");
          setErrorMessage(result.message);
          return;
        }

        const rawStocks = Array.isArray(result)
          ? result
          : Array.isArray(result.output1)
          ? result.output1
          : null;

        if (!rawStocks) {
          setStatus("error");
          setErrorMessage("응답 형식 오류");
          return;
        }

        const mapped = rawStocks.map(
          (item: { pdno: string; prdt_name: string }) => ({
            stock_code: item.pdno,
            company: item.prdt_name,
          })
        );

        setStocks(mapped);
        setStatus("done");
      }, wait);
    };

    fetchData();
  }, []);

  const handleChart = () => {
    if (stocks.length > 0) {
      const firstCode = stocks[0].stock_code;
      router.replace(`/investment/${firstCode}`);
    }
  };

  return (
    <div
      className={`flex flex-col items-center px-4 ${
        status === "loading" ? "pt-64" : "pt-28"
      }`}
    >
      {status === "loading" && (
        <>
          <div className="loader mb-6" />
          <h2 className="text-xl">계좌 연동 중입니다...</h2>
        </>
      )}

      {status === "done" && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            계좌가 연동되었습니다
          </h2>
          <p className="mb-6 text-lg text-center">
            <span className="text-blue-500 font-semibold">{stocks.length}</span>
            개의 주식을 찾았습니다.
          </p>
          <div className="bg-[#16161A] rounded-lg p-6 w-full max-w-[600px]">
            <div className="max-h-72 overflow-y-auto space-y-3">
              {stocks.map((s, i) => (
                <div
                  key={i}
                  className="w-full bg-[#313136] text-center py-4 rounded text-white text-lg"
                >
                  {s.company}
                </div>
              ))}
            </div>
          </div>
          <button
            className="px-14 py-4 mt-8 text-xl bg-[#426FE5] rounded hover:bg-blue-500"
            onClick={handleChart}
          >
            차트 예측하기
          </button>
        </>
      )}

      {status === "error" && (
        <h2 className="text-xl text-red-500">
          연동 실패: {errorMessage || "알 수 없는 오류"}
        </h2>
      )}

      <style jsx>{`
        .loader {
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
