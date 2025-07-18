"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Stocks, UserStock } from "@/types/UserStock";
import { useAuthStore } from "@/stores/authStore";
import { getStock, getRanking } from "@/services/userStock-service";

export default function RealRankingClient() {
  const [stock, setStock] = useState<Stocks[]>([]);
  const auth = useAuthStore((s) => s.auth);
  const [rankingData, setRankingData] = useState<{
    [key: string]: { name: string; score: number }[];
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await getStock(auth.token);
      setStock(result.stocks);
      console.log("사용자의 보유주식 조회:", result.stocks);
    };

    const fetchRankingData = async () => {
      const result = await getRanking();
      const grouped: {
        [key: string]: { name: string; score: number }[];
      } = {};

      (result.userStock as UserStock[]).forEach((item) => {
        const company = item.stock_code.name;
        const nickname = item.user_id?.nickname ?? "알 수 없음";
        const score = item.cumulative_score ?? 0;

        if (!grouped[company]) grouped[company] = [];
        grouped[company].push({ name: nickname, score });
      });

      // 점수 기준 내림차순 정렬
      for (const key in grouped) {
        grouped[key].sort((a, b) => b.score - a.score);
      }

      setRankingData(grouped);
    };

    fetchData();
    fetchRankingData();
  }, []);

  const [selectedCompany, setSelectedCompany] = useState<string>("");

  // stock이 바뀌고 나서 초기값 설정
  useEffect(() => {
    if (stock.length > 0 && !selectedCompany) {
      setSelectedCompany(stock[0].name);
    }
  }, [stock]);

  const ranking = rankingData[selectedCompany] || [];

  return (
    <div className="pt-4">
      <div className="mx-auto">
        <h2 className="text-lg mb-8 text-center">실전문제 랭킹</h2>

        <div className="flex justify-center gap-4 flex-wrap h-[600px]">
          {/* 종목 목록 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-md overflow-y-auto">
            <div className="space-y-2">
              {stock.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCompany(s.name)}
                  className={`flex items-center justify-between cursor-pointer px-5 py-4 rounded-lg
                    ${
                      selectedCompany === s.name
                        ? "bg-[#396FFB]"
                        : "bg-[#313136]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {s.logo && (
                      <Image
                        src={s.logo}
                        alt={s.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span>{s.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 종목의 랭킹 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-xl overflow-y-auto">
            <div className="w-full">
              <div className="grid grid-cols-3 text-left text-sm px-3 mb-2">
                <div>순위</div>
                <div>이름</div>
                <div>점수</div>
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {ranking.map((r, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 items-center px-3 py-3 mb-2 rounded-lg text-left ${
                    i % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#16161A]"
                  }`}
                >
                  <div>{i + 1}</div>
                  <div>{r.name}</div>
                  <div>{r.score}점</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
