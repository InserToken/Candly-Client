import React, { useEffect, useState } from "react";
import { fetchFinancial } from "@/services/fetchFinancial";
import FinancialComboChart from "@/components/charts/FinancialComboChart";

type Props = {
  stock_code?: string;
  date?: string;
  currentPrice?: number | null;
};

export default function FinanceTable({
  stock_code,
  date,
  currentPrice,
}: Props) {
  const [financialData, setFinancialData] = useState<any>(null);

  const formatNumber = (num: number | null, unit = "") =>
    typeof num === "number"
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + unit
      : "-";

  function formatLargeNumber(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return "-";

    const abs = Math.abs(value);

    if (abs >= 1e12) {
      return (value / 1e12).toFixed(1) + "조원";
    } else if (abs >= 1e8) {
      return (value / 1e8).toFixed(1) + "억원";
    } else if (abs >= 1e4) {
      return (value / 1e4).toFixed(1) + "만원";
    } else {
      return value.toLocaleString("ko-KR") + "원";
    }
  }

  const reprtMap: { [key: string]: string } = {
    "11013": "3월",
    "11012": "6월",
    "11014": "9월",
    "4Q": "12월 ",
  };

  const periodLabels = financialData?.series?.period.map((raw: string) => {
    const [year, code] = raw.split(".");
    const reprt_code = code === "4Q" ? "4Q" : code;
    const label = reprtMap[reprt_code] || reprt_code;
    return `${year} ${label}`;
  });

  useEffect(() => {
    if (!stock_code || !date) return;
    console.log(currentPrice);
    fetchFinancial(stock_code, date).then((data) => {
      setFinancialData(data);
    });
  }, [stock_code, date]);

  if (!financialData) {
    return (
      <div className="text-gray-400 text-sm px-4 py-2">
        재무 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-sm text-white max-h-[410px] overflow-y-auto pr-2">
      {/* 투자 지표 */}
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-white text-sm w-full">
        <h3 className="text-base font-semibold mb-4">투자 지표</h3>

        {/* 위 두 섹션 (가치평가, 수익) */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* 가치평가 */}
          <div className="space-y-2">
            <p className="text-gray-400">가치평가</p>
            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
              <span>PER</span>
              <span>
                {currentPrice == null
                  ? formatNumber(
                      financialData.stockPrice / financialData?.eps,
                      "배"
                    )
                  : formatNumber(currentPrice / financialData?.eps, "배")}
              </span>
            </div>
            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
              <span>PSR</span>
              <span>
                {currentPrice == null
                  ? formatNumber(
                      (financialData.stockPrice * financialData.shareCount) /
                        financialData?.ttmRevenue,
                      "배"
                    )
                  : formatNumber(
                      (currentPrice * financialData.shareCount) /
                        financialData?.ttmRevenue,
                      "배"
                    )}
              </span>
            </div>
            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
              <span>PBR</span>
              <span>
                {currentPrice == null
                  ? formatNumber(
                      financialData.stockPrice / financialData?.bps,
                      "배"
                    )
                  : formatNumber(currentPrice / financialData?.bps, "배")}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">수익</p>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
              <span>EPS</span>
              <span>{formatNumber(Math.round(financialData?.eps), "원")}</span>
            </div>
            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
              <span>BPS</span>
              <span>{formatNumber(Math.round(financialData?.bps), "원")}</span>
            </div>
            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
              <span>ROE</span>
              <span>{formatNumber(financialData?.roe, "%")}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <p className="text-gray-400">기타 재무 정보</p>
          <div />
          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
            <span>당기순이익</span>
            <span>{formatNumber(financialData?.ttmProfit, "원")}</span>
          </div>
          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
            <span>증감액</span>
            <span>{formatNumber(financialData?.profit_diff, "원")}</span>
          </div>
          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
            <span>매출액</span>
            <span>{formatNumber(financialData?.ttmRevenue, "원")}</span>
          </div>
          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
            <span>증감률</span>
            <span>{formatNumber(financialData?.profit_diff_rate, "%")}</span>
          </div>
          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between ">
            <span>순자산</span>
            <span>{formatNumber(financialData?.ttmequity, "원")}</span>
          </div>
        </div>
      </div>
      {/* 수익성 */}
      <div className="bg-[#1b1b1b] rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">수익성</h3>
        <div>
          {/* Legend 박스 (차트 위에 표시) */}
          <div className="flex items-center gap-4 mb-2 text-sm">
            <div className="flex items-center gap-1">
              <svg
                aria-label="매출 legend icon"
                className="recharts-surface"
                width="14"
                height="14"
                viewBox="0 0 32 32"
              >
                <rect width="32" height="32" fill="#396FFB" />
              </svg>
              <span className="text-white">매출</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                aria-label="순이익 legend icon"
                className="recharts-surface"
                width="14"
                height="14"
                viewBox="0 0 32 32"
              >
                <rect width="32" height="32" fill="#F87800" />
              </svg>
              <span className="text-white">순이익</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                aria-label="순이익률 legend icon"
                className="recharts-surface"
                width="14"
                height="14"
                viewBox="0 0 32 32"
              >
                <line
                  x1="0"
                  y1="16"
                  x2="32"
                  y2="16"
                  stroke="#EDCB37"
                  strokeWidth="4"
                />
              </svg>
              <span className="text-white">순이익률</span>
            </div>
          </div>
        </div>
        <FinancialComboChart
          data={financialData?.series?.period.map((_, idx: number) => ({
            label: periodLabels[idx],
            bar1: financialData.series.revenue[idx],
            bar2: financialData.series.netProfit_govern[idx],
            line: financialData.series.profitMargin[idx],
          }))}
          bar1Key="bar1"
          bar2Key="bar2"
          lineKey="line"
          bar1Label="매출"
          bar2Label="순이익"
          lineLabel="순이익률"
        />

        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-max text-sm text-white border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#313136]">
                <th className="text-left px-3 py-4 sticky left-0 bg-[#313136] z-10 rounded-tl-lg min-w-[120px]">
                  항목
                </th>
                {periodLabels.map((label, idx) => (
                  <th
                    key={idx}
                    className={`text-center px-4 py-4 whitespace-nowrap ${
                      idx === periodLabels.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "매출", key: "revenue" },
                { label: "순이익", key: "netProfit_govern" },
                { label: "순이익률", key: "profitMargin" },
                { label: "순이익 성장률", key: "growthRate" },
              ].map(({ label, key }, rowIndex, arr) => (
                <tr
                  key={key}
                  className={
                    rowIndex % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#313136]"
                  }
                >
                  <td className="py-4 px-3 font-medium sticky left-0 z-10 bg-inherit min-w-[120px]">
                    {label}
                  </td>
                  {financialData?.series?.[key].map(
                    (value: number | null, idx: number) => (
                      <td key={idx} className="text-center py-4 px-4">
                        {key == "revenue" || key == "netProfit_govern"
                          ? formatLargeNumber(value)
                          : formatNumber(value) + "%"}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 성장성 */}
      <div className="bg-[#1b1b1b] rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">성장성</h3>
        <div className="flex items-center gap-4 mb-2 text-sm">
          <div className="flex items-center gap-1">
            <svg
              aria-label="영업이익 legend icon"
              className="recharts-surface"
              width="14"
              height="14"
              viewBox="0 0 32 32"
            >
              <rect width="32" height="32" fill="#396FFB" />
            </svg>
            <span className="text-white">영업이익</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              aria-label="영업이익률 legend icon"
              className="recharts-surface"
              width="14"
              height="14"
              viewBox="0 0 32 32"
            >
              <line
                x1="0"
                y1="16"
                x2="32"
                y2="16"
                stroke="#EDCB37"
                strokeWidth="4"
              />
            </svg>
            <span className="text-white">영업이익률</span>
          </div>
        </div>
        <FinancialComboChart
          data={financialData?.series?.period.map((_, idx: number) => ({
            label: periodLabels[idx],
            bar1: financialData.series.operatingProfit[idx],
            line: financialData.series.operatingMargin[idx],
          }))}
          bar1Key="bar1"
          lineKey="line"
          bar1Label="영업이익"
          lineLabel="영업이익률"
        />
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-max text-sm text-white border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#313136]">
                <th className="text-left px-3 py-4 sticky left-0 bg-[#313136] z-10 rounded-tl-lg min-w-[120px]">
                  항목
                </th>
                {periodLabels.map((label, idx) => (
                  <th
                    key={idx}
                    className={`text-center px-4 py-4 whitespace-nowrap ${
                      idx === periodLabels.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "영업이익", key: "operatingProfit" },
                { label: "영업이익률", key: "operatingMargin" },
                {
                  label: "영업이익 성장률",
                  key: "operatingGrowthRate",
                },
              ].map(({ label, key }, rowIndex, arr) => (
                <tr
                  key={key}
                  className={
                    rowIndex % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#313136]"
                  }
                >
                  <td className="py-4 px-3 font-medium sticky left-0 z-10 bg-inherit min-w-[120px]">
                    {label}
                  </td>
                  {financialData?.series?.[key].map(
                    (value: number | null, idx: number) => (
                      <td key={idx} className="text-center py-3 px-4">
                        {key == "operatingProfit"
                          ? formatLargeNumber(value)
                          : formatNumber(value) + "%"}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
