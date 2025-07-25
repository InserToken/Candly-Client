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
    if (abs >= 1e12) return (value / 1e12).toFixed(1) + "조원";
    if (abs >= 1e8) return (value / 1e8).toFixed(1) + "억원";
    if (abs >= 1e4) return (value / 1e4).toFixed(1) + "만원";
    return value.toLocaleString("ko-KR") + "원";
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
    return `${year} ${reprtMap[reprt_code] || reprt_code}`;
  });

  useEffect(() => {
    if (!stock_code || !date) return;
    fetchFinancial(stock_code, date).then((data) => setFinancialData(data));
  }, [stock_code, date]);

  if (!financialData) {
    return (
      <div className="text-gray-400 text-sm px-4 py-2">
        재무 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-sm text-white h-full overflow-y-auto pr-2">
      {/* 투자 지표 */}
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-white text-sm w-full">
        <h3 className="text-base font-semibold mb-4">투자 지표</h3>

        {/* 위 두 섹션 (가치평가, 수익) */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* 가치평가 */}
          <div className="space-y-2">
            <p className="text-gray-400">가치평가</p>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <span>PER</span>
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      현재 주가 대비 주당 순이익 비율로, 주가 수준이 적정한지
                      평가해 보세요.
                    </b>
                  </div>
                </span>
              </div>
              <span className="ml-auto">
                {formatNumber(
                  (currentPrice ?? financialData.stockPrice) /
                    financialData.eps,
                  "배"
                )}
              </span>
            </div>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <span>PSR</span>
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      시가총액 대비 매출액 비율로, 매출 규모 대비 주가 수준을
                      판단할 수 있어요.
                    </b>
                  </div>
                </span>
              </div>
              <span className="ml-auto">
                {formatNumber(
                  ((currentPrice ?? financialData.stockPrice) *
                    financialData.shareCount) /
                    financialData.ttmRevenue,
                  "배"
                )}
              </span>
            </div>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <span>PBR</span>
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      주가 대비 순자산 비율로, 기업의 자산가치 대비 주가를
                      확인해 보세요.
                    </b>
                  </div>
                </span>
              </div>
              <span className="ml-auto">
                {formatNumber(
                  (currentPrice ?? financialData.stockPrice) /
                    financialData.bps,
                  "배"
                )}
              </span>
            </div>
          </div>

          {/* 수익 */}
          <div className="space-y-2">
            <p className="text-gray-400">수익</p>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <span>EPS</span>
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      주당 순이익으로, 1주당 벌어들인 순이익 규모를 파악할 수
                      있습니다.
                    </b>
                  </div>
                </span>
              </div>
              <span className="ml-auto">
                {formatNumber(Math.round(financialData.eps), "원")}
              </span>
            </div>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <span>BPS</span>
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      주당 순자산으로, 1주당 기업이 보유한 순자산 가치를
                      나타냅니다.
                    </b>
                  </div>
                </span>
              </div>
              <span className="ml-auto">
                {formatNumber(Math.round(financialData.bps), "원")}
              </span>
            </div>

            <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <span>ROE</span>
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      자기자본이익률로, 자본 대비 얼마나 수익을 냈는지 확인해
                      보세요.
                    </b>
                  </div>
                </span>
              </div>
              <span className="ml-auto">
                {formatNumber(financialData.roe, "%")}
              </span>
            </div>
          </div>
        </div>

        {/* 기타 재무 정보 */}
        <div className="grid grid-cols-2 gap-2">
          <p className="text-gray-400">기타 재무 정보</p>
          <div />

          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
            <div className="flex items-center space-x-2">
              <span>당기순이익</span>
              <span className="relative group cursor-pointer text-gray-400">
                ⓘ
                <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  <b className="text-[#f4f4f4]">
                    최근 4개 분기 합산 순이익으로, 기업의 실제 이익 추세를
                    살펴보세요.
                  </b>
                </div>
              </span>
            </div>
            <span className="ml-auto">
              {formatLargeNumber(financialData.ttmProfit)}
            </span>
          </div>

          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
            <div className="flex items-center space-x-2">
              <span>증감액</span>
              <span className="relative group cursor-pointer text-gray-400">
                ⓘ
                <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  <b className="text-[#f4f4f4]">
                    전분기 대비 순이익 증가액으로, 성장 동력을 한눈에 확인할 수
                    있어요.
                  </b>
                </div>
              </span>
            </div>
            <span className="ml-auto">
              {formatLargeNumber(financialData.profit_diff)}
            </span>
          </div>

          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
            <div className="flex items-center space-x-2">
              <span>매출액</span>
              <span className="relative group cursor-pointer text-gray-400">
                ⓘ
                <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  <b className="text-[#f4f4f4]">
                    최근 4개 분기 합산 매출로, 매출 규모와 성장 방향을 파악해
                    보세요.
                  </b>
                </div>
              </span>
            </div>
            <span className="ml-auto">
              {formatLargeNumber(financialData.ttmRevenue)}
            </span>
          </div>

          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
            <div className="flex items-center space-x-2">
              <span>증감률</span>
              <span className="relative group cursor-pointer text-gray-400">
                ⓘ
                <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  <b className="text-[#f4f4f4]">
                    전분기 대비 순이익 성장률로, 기업의 모멘텀을 확인해 보세요.
                  </b>
                </div>
              </span>
            </div>
            <span className="ml-auto">
              {formatNumber(financialData.profit_diff_rate, "%")}
            </span>
          </div>

          <div className="bg-[#2a2a2a] rounded px-4 py-2 flex items-center">
            <div className="flex items-center space-x-2">
              <span>순자산</span>
              <span className="relative group cursor-pointer text-gray-400">
                ⓘ
                <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  <b className="text-[#f4f4f4]">
                    최근 분기 말 기준 순자산으로, 기업의 재무 건전성을 짐작할 수
                    있습니다.
                  </b>
                </div>
              </span>
            </div>
            <span className="ml-auto">
              {formatLargeNumber(financialData.equity_ttm)}
            </span>
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
            bar1: Math.max(0, financialData.series.revenue[idx]),
            bar2: Math.max(0, financialData.series.netProfit_govern[idx]),
            line: Math.max(0, financialData.series.profitMargin[idx]),
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
                  <div className="flex items-center space-x-2">
                    <span>항목</span>
                  </div>
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
                {
                  label: "매출",
                  tip: "해당 분기의 총 매출액을 나타냅니다.",
                  key: "revenue",
                },
                {
                  label: "순이익",
                  tip: "해당 분기의 지배주주 지분 순이익을 확인할 수 있습니다.",
                  key: "netProfit_govern",
                },
                {
                  label: "순이익률",
                  tip: "매출 대비 순이익 비율로, 수익성을 평가해 보세요.",
                  key: "profitMargin",
                },
                {
                  label: "순이익 성장률",
                  tip: "전분기 대비 순이익 성장 비율로, 성장 모멘텀을 확인할 수 있어요.",
                  key: "growthRate",
                },
              ].map(({ label, tip, key }, rowIndex) => (
                <tr
                  key={key}
                  className={
                    rowIndex % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#313136]"
                  }
                >
                  <td className="py-4 px-3 font-medium sticky left-0 z-10 bg-inherit min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span>{label}</span>
                      <span className="relative group cursor-pointer text-gray-400">
                        ⓘ
                        <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                          <b className="text-[#f4f4f4]">{tip}</b>
                        </div>
                      </span>
                    </div>
                  </td>
                  {financialData.series[key].map(
                    (value: number | null, idx: number) => (
                      <td key={idx} className="text-center py-4 px-4">
                        {key === "revenue" || key === "netProfit_govern"
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
            bar1: Math.max(0, financialData.series.operatingProfit[idx]),
            line: Math.max(0, financialData.series.operatingMargin[idx]),
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
                  <div className="flex items-center space-x-2">
                    <span>항목</span>
                  </div>
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
                {
                  label: "영업이익",
                  tip: "해당 분기의 영업이익을 나타냅니다.",
                  key: "operatingProfit",
                },
                {
                  label: "영업이익률",
                  tip: "매출 대비 영업이익 비율로, 영업 효율성을 확인할 수 있습니다.",
                  key: "operatingMargin",
                },
                {
                  label: "영업이익 성장률",
                  tip: "전분기 대비 영업이익 성장률로, 영업적 성장세를 살펴보세요.",
                  key: "operatingGrowthRate",
                },
              ].map(({ label, tip, key }, rowIndex) => (
                <tr
                  key={key}
                  className={
                    rowIndex % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#313136]"
                  }
                >
                  <td className="py-4 px-3 font-medium sticky left-0 z-10 bg-inherit min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span>{label}</span>
                      <span className="relative group cursor-pointer text-gray-400">
                        ⓘ
                        <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                          <b className="text-[#f4f4f4]">{tip}</b>
                        </div>
                      </span>
                    </div>
                  </td>
                  {financialData.series[key].map(
                    (value: number | null, idx: number) => (
                      <td key={idx} className="text-center py-3 px-4">
                        {key === "operatingProfit"
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
