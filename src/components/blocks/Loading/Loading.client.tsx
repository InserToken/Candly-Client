"use client";

import React, { useEffect, useState } from "react";
import { getStock } from "@/services/userStock-service";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [stocks, setStocks] = useState<
    { stock_code: string; company: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const start = Date.now();
      const result = await getStock();
      const elapsed = Date.now() - start;
      const minDelay = 1500;
      const wait = elapsed < minDelay ? minDelay - elapsed : 0;

      setTimeout(() => {
        if ("message" in result) {
          setStatus("error");
          //setErrorMessage(result.message);
        } else {
          setStocks(result);
          setStatus("done");
        }
      }, wait);
    };

    fetchData();
  }, []);

  const handleChart = () => {
    if (stocks.length > 0) {
      const firstStockCode = stocks[0].stock_code;
      router.replace(`/investment/${firstStockCode}`);
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
            차트 에측하기
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
