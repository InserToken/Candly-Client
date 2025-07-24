"use client";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getStock } from "@/services/userStock-service";
import fetchRealInvest from "@/services/fetchRealInvest";

export default function MyPageInvestmentClient() {
  const auth = useAuthStore((s) => s.auth);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.token) return;

      try {
        const result = await getStock(auth.token);
        const enriched = await Promise.all(
          result.stocks.map(async (item: any, i: number) => {
            let rate = "-";
            let days = "-";

            try {
              const detail = await fetchRealInvest(item._id, auth.token);
              console.log(detail);
              rate = detail.hitRate ? `${detail.hitRate}%` : "-";
              days = detail.daysPredicted ? `${detail.daysPredicted}일` : "-";
            } catch (err) {
              console.warn(`주식 ${item.name} 세부 데이터 실패:`, err);
            }

            return {
              id: i + 1,
              name: item.name,
              rate,
              days,
            };
          })
        );

        setTableData(enriched);
      } catch (err) {
        console.error("보유 주식 데이터를 불러오지 못했습니다:", err);
      }
    };

    fetchData();
  }, [auth]);

  return (
    <div>
      <p className="text-2xl font-semibold mb-6">실전투자 히스토리</p>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-55 bg-[#16161A] rounded-lg text-center flex items-baseline gap-1.5 justify-center pt-4">
          <p className="text-xl font-semibold">예측 종목</p>
          <p className="text-4xl font-bold">14</p>
        </div>
        <div className="h-20 w-55 bg-[#16161A] rounded-lg text-center flex items-baseline gap-1.5 justify-center pt-4">
          <p className="text-xl font-semibold">적중률</p>
          <p className="text-4xl font-bold">40</p>
          <p className="text-xl font-semibold">%</p>
        </div>
        <div className="h-20 w-55 bg-[#16161A] rounded-lg text-center flex items-baseline gap-1.5 justify-center pt-4 ">
          <p className="text-xl font-semibold">내 랭킹</p>
          <p className="text-4xl font-bold">12</p>
          <p className="text-xl font-semibold">위</p>
        </div>
      </div>

      <div className="bg-[#1C1C20] rounded-lg overflow-hidden">
        <table className="min-w-full text-2xl text-left text-white ">
          <thead className="bg-[#0F0F0F] text-gray-300">
            <tr>
              <th className="px-4 py-4"></th>
              <th className="px-8 py-4">종목명</th>
              <th className="px-6 py-4">적중률</th>
              <th className="px-6 py-4">예측일수</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id} className="odd:bg-[#1C1C20] even:bg-[#0F0F0F] ">
                <td className="px-4 py-4 font-medium">{row.id}</td>
                <td className="px-8 py-4">{row.name}</td>
                <td className="px-6 py-4">{row.rate}</td>
                <td className="px-6 py-4">{row.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
