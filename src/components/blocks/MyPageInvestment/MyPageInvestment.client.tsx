"use client";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getStock } from "@/services/userStock-service";
import fetchMyPageInvest from "@/services/fetchMyPageInvest";

export default function MyPageInvestmentClient() {
  const auth = useAuthStore((s) => s.auth);
  const [tableData, setTableData] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<string>("_rawDays");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stockCount, setStockCount] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number | null>(null);

  const sortTable = (data: any[]) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      const aIsNull = aValue === null || aValue === undefined;
      const bIsNull = bValue === null || bValue === undefined;

      // null 또는 undefined는 항상 맨 아래로
      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return 1;
      if (bIsNull) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const SortArrow = ({
    active,
    order,
  }: {
    active: boolean;
    order: "asc" | "desc";
  }) => {
    const arrow = active ? (order === "asc" ? "▲" : "▼") : " -"; // 정렬 기준이 아니면 기본 ▼ 유지

    return (
      <span
        className={`ml-1 text-xs ${
          active ? "text-white font-semibold" : "text-gray-500"
        }`}
      >
        {arrow}
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.token) return;

      try {
        const [stockResult, investResult] = await Promise.all([
          getStock(auth.token),
          fetchMyPageInvest(auth.token),
        ]);

        const enriched = stockResult.stocks.map((item: any, i: number) => {
          const matched = investResult.find(
            (s: any) =>
              s.stock_code === item.stock_code?._id || s.stock_id === item._id
          );

          const cumulativeScore =
            typeof item.cumulative_score === "number"
              ? item.cumulative_score
              : null;
          const predictCount = matched?.scores?.length ?? 0;

          return {
            id: i + 1,
            name: item.stock_code?.name ?? "-",
            rate: cumulativeScore !== null ? `${cumulativeScore}%` : "-",
            days: `${predictCount}일`,
            _rawDays: predictCount,
            _rawScore: cumulativeScore !== null ? cumulativeScore : -1,
          };
        });

        const validScores = stockResult.stocks
          .map((item: any) => item.cumulative_score)
          .filter((score: any) => typeof score === "number");
        const avg =
          validScores.length > 0
            ? Math.round(
                validScores.reduce((sum: number, cur: number) => sum + cur, 0) /
                  validScores.length
              )
            : null;

        // 필요 없으면 _rawDays 제거도 가능
        setTableData(enriched);
        setStockCount(stockResult.stocks.length);
        setAvgScore(avg);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };
    fetchData();
  }, [auth]);

  return (
    <div>
      <p className="text-2xl font-semibold mb-6">실전투자 히스토리</p>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-55 bg-[#16161A] rounded-lg text-center flex items-baseline gap-1.5 justify-center pt-4">
          <p className="text-xl font-semibold">보유 종목</p>
          <p className="text-4xl font-bold">{stockCount}</p>
          <p className="text-xl font-semibold">개</p>
        </div>
        <div className="h-20 w-55 bg-[#16161A] rounded-lg text-center flex items-baseline gap-1.5 justify-center pt-4">
          <p className="text-xl font-semibold">적중률</p>
          <p className="text-4xl font-bold">
            {avgScore !== null ? avgScore : "-"}
          </p>
          <p className="text-xl font-semibold">%</p>
        </div>
      </div>

      <div className="bg-[#1C1C20] rounded-lg overflow-hidden">
        <table className="min-w-full text-2xl text-left text-white ">
          <thead className="bg-[#0F0F0F] text-gray-300">
            <tr>
              <th className="px-4 py-4"></th>
              <th
                className="px-8 py-4 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                종목명
                <SortArrow active={sortKey === "name"} order={sortOrder} />
              </th>
              <th
                className="px-6 py-4 cursor-pointer"
                onClick={() => handleSort("_rawDays")}
              >
                예측일수
                <SortArrow active={sortKey === "_rawDays"} order={sortOrder} />
              </th>
              <th
                className="px-6 py-4 cursor-pointer"
                onClick={() => handleSort("_rawScore")}
              >
                적중률
                <SortArrow active={sortKey === "_rawScore"} order={sortOrder} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortTable(tableData).map((row, idx) => (
              <tr key={row.id} className="odd:bg-[#1C1C20] even:bg-[#0F0F0F]">
                <td className="px-4 py-4 font-medium">{idx + 1}</td>
                <td className="px-8 py-4">{row.name}</td>
                <td className="px-6 py-4">{row.days}</td>
                <td className="px-6 py-4">{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
