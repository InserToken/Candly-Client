"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ClickCard from "@/components/buttons/ClickCard";
import CandleChart from "@/components/charts/Candlechart";
import { fetchPracticeProblem } from "@/services/fetchPracticeProblem";
import { fetchPracticeNews } from "@/services/fetchPracticeNews";
import { fetchFinancial } from "@/services/fetchFinancial";
import { useRouter } from "next/navigation";
import FinancialComboChart from "@/components/charts/FinancialComboChart";

type PriceItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type PracticeProblemData = {
  title: string;
  prices: PriceItem[];
  stock_code: string;
  date: string;
  problemtype: string;
};

type NewsItem = {
  _id: string;
  title: string;
  date: string;
  context: string;
  news_url: string;
  img_url?: string;
};

export default function PracticeClient() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  const params = useParams<{ problemId: string }>();
  const [problemData, setProblemData] = useState<PracticeProblemData | null>(
    null
  );
  const [news, setNews] = useState<NewsItem[]>([]);
  const stockData = problemData?.prices;

  // === 차트 부모 width 동적 측정 ===
  const chartBoxRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(780); // 초기값

  // 재무제표 data

  const [financialData, setFinancialData] = useState<any>(null);

  const formatNumber = (num: number | null, unit = "") =>
    typeof num === "number"
      ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + unit
      : "-";

  function formatLargeNumber(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return "-";

    const abs = Math.abs(value);

    if (abs >= 1e12) {
      return (value / 1e12).toFixed(1) + "조원"; // 1조 = 1e12
    } else if (abs >= 1e8) {
      return (value / 1e8).toFixed(1) + "억원"; // 1억 = 1e8
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
    function updateWidth() {
      if (chartBoxRef.current) {
        setParentWidth(chartBoxRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 데이터 패칭
  useEffect(() => {
    fetchPracticeProblem(params.problemId).then((data) => {
      setProblemData(data);
    });
  }, [params.problemId]);

  useEffect(() => {
    fetchPracticeNews(params.problemId).then((data) => {
      setNews(data);
    });
  }, [params.problemId]);

  // 찍어보기
  useEffect(() => {
    fetchPracticeProblem(params.problemId).then((data) => {
      setProblemData(data);
      console.log("🔥 fetchPracticeProblem 결과:", data);

      // === 볼린저밴드 계산용 윈도우 확인 ===
      const bbData = data.prices; // 또는 원하는 배열명 사용
      const targetDate = "2019-08-02";
      const windowSize = 20;
      const idx = bbData.findIndex((d) => d.date === targetDate);
      if (idx >= windowSize - 1) {
        const window = bbData
          .slice(idx - windowSize + 1, idx + 1)
          .map((d) => d.close);
        console.log("🔥 JS 2019-08-02 윈도우(20개)", window);

        // JS에서 볼린저밴드 직접 계산해보기 (함수 예시)
        const mean = window.reduce((a, b) => a + b, 0) / windowSize;
        const std = Math.sqrt(
          window.reduce((a, v) => a + (v - mean) ** 2, 0) / windowSize
        );
        const upper = mean + 2 * std;
        const lower = mean - 2 * std;
        console.log("🔥 JS BB 값:", { upper, mean, lower });
      }
    });
  }, []);

  useEffect(() => {
    if (!problemData?.stock_code || !problemData?.date) return;

    fetchFinancial(problemData.stock_code, problemData.date).then((data) => {
      setFinancialData(data);
    });
  }, [problemData]);

  return (
    <div className="min-h-screen px-[80px] pt-1">
      <h2 className="mb-3 text-2xl">{problemData?.title}</h2>
      <main className="flex flex-col lg:flex-row gap-6">
        {/* 왼쪽 영역 */}
        <section className="flex-1 max-w-[894px]">
          <div className="text-sm text-gray-300 mb-4">
            {/* 탭 버튼 */}
            <div className="flex flex-wrap items-center gap-1 mb-4">
              <button
                className={`px-3 py-1 rounded-full ${
                  tab === "chart" ? "bg-[#2a2a2a] text-white" : "text-gray-400"
                }`}
                onClick={() => setTab("chart")}
              >
                차트
              </button>
              <button
                className={`px-3 py-1 rounded-full ${
                  tab === "finance"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400"
                }`}
                onClick={() => setTab("finance")}
              >
                재무 정보
              </button>
              {tab === "chart" && (
                <div className="flex flex-wrap gap-4 items-center justify-end text-sm text-gray-300 ml-auto pr-3">
                  <span className="flex items-center gap-1">
                    <span className="text-white pr-1">이동평균선</span>
                    <span className="text-[#00D5C0]">5</span> ·
                    <span className="text-[#E8395F]">20</span> ·
                    <span className="text-[#F87800]">60</span> ·
                    <span className="text-[#7339FB]">120</span>
                  </span>
                  <span className="text-[#EDCB37]">볼린저밴드</span> |
                  <span className="text-[#396FFB]">거래량</span>
                  <span>RSI</span>
                </div>
              )}
            </div>
            {/* 콘텐츠 영역 */}
            {tab === "chart" && (
              <div
                className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center w-full text-gray-400 pb-1"
                ref={chartBoxRef}
              >
                {Array.isArray(stockData) ? (
                  <CandleChart
                    w={parentWidth}
                    data={stockData}
                    indi_data={stockData}
                    news={news}
                  />
                ) : (
                  <div>문제가 없습니다.</div>
                )}
              </div>
            )}
            {tab === "finance" && (
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
                        <span>{formatNumber(financialData?.per, "배")}</span>
                      </div>
                      <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                        <span>PSR</span>
                        <span>{formatNumber(financialData?.psr, "배")}</span>
                      </div>
                      <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                        <span>PBR</span>
                        <span>{formatNumber(financialData?.pbr, "배")}</span>
                      </div>
                    </div>

                    {/* 수익 */}
                    <div className="space-y-2">
                      <p className="text-gray-400">수익</p>

                      <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                        <span>EPS</span>
                        <span>{formatNumber(financialData?.eps, "원")}</span>
                      </div>
                      <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                        <span>BPS</span>
                        <span>{formatNumber(financialData?.bps, "원")}</span>
                      </div>
                      <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                        <span>ROE</span>
                        <span>{formatNumber(financialData?.roe, "%")}</span>
                      </div>
                    </div>
                  </div>

                  {/* 아래 세로 2열 구조 */}
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-gray-400">기타 재무 정보</p>
                    <div />
                    <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                      <span>당기순이익</span>
                      <span>
                        {formatNumber(financialData?.ttmProfit, "원")}
                      </span>
                    </div>
                    <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                      <span>증감액</span>
                      <span>
                        {formatNumber(financialData?.profit_diff, "원")}
                      </span>
                    </div>
                    <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                      <span>매출액</span>
                      <span>
                        {formatNumber(financialData?.ttmRevenue, "원")}
                      </span>
                    </div>
                    <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between">
                      <span>증감률</span>
                      <span>
                        {formatNumber(financialData?.profit_diff_rate, "%")}
                      </span>
                    </div>
                    <div className="bg-[#2a2a2a] rounded px-4 py-2 flex justify-between ">
                      <span>순자산</span>
                      <span>
                        {formatNumber(financialData?.ttmequity, "원")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 수익성 */}
                <div className="bg-[#1b1b1b] rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4">수익성</h3>

                  <FinancialComboChart
                    data={financialData?.series?.period.map(
                      (_, idx: number) => ({
                        label: periodLabels[idx],
                        bar1: financialData.series.revenue[idx],
                        bar2: financialData.series.netProfit_govern[idx],
                        line: financialData.series.profitMargin[idx],
                      })
                    )}
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
                                idx === periodLabels.length - 1
                                  ? "rounded-tr-lg"
                                  : ""
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
                              rowIndex % 2 === 0
                                ? "bg-[#1C1C20]"
                                : "bg-[#313136]"
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
                  <FinancialComboChart
                    data={financialData?.series?.period.map(
                      (_, idx: number) => ({
                        label: periodLabels[idx],
                        bar1: financialData.series.operatingProfit[idx],
                        line: financialData.series.operatingMargin[idx],
                      })
                    )}
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
                                idx === periodLabels.length - 1
                                  ? "rounded-tr-lg"
                                  : ""
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
                              rowIndex % 2 === 0
                                ? "bg-[#1C1C20]"
                                : "bg-[#313136]"
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
            )}
          </div>
          {/* 답변 작성 */}
          <div>
            <label className="text-sm font-semibold mb-2 inline-block">
              답변 작성 <span className="text-gray-400">ⓘ</span>
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="답변을 입력하세요"
              maxLength={300}
              className="w-full h-32 p-4 rounded border border-gray-600 bg-transparent resize-none focus:outline-none"
            />
            <div className="flex float-right items-center mt-2 gap-4">
              <span className="text-sm text-gray-400">
                {input.length} / 300 자
              </span>
              <button className="bg-[#396FFB] px-5 py-1.5 rounded text-sm">
                제출
              </button>
            </div>
          </div>
        </section>
        {/* 오른쪽 영역 */}
        <aside className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
          <div className="flex justify-between">
            <ClickCard name="힌트" icon="hint.svg" />
            <ClickCard
              name="답변 랭킹"
              icon="ranking.svg"
              onClick={() => router.push(`/ranking/practice`)}
            />
          </div>
          {/* 뉴스 */}
          <div className="mt-4">
            <p className="text-2xl font-semibold mb-3.5">관련 뉴스</p>
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto">
              {Array.isArray(news) && news.length > 0 ? (
                news.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1b1b1b] rounded-xl p-4 text-sm flex gap-4"
                  >
                    {item.img_url && (
                      <Image
                        src={item.img_url}
                        alt="뉴스 이미지"
                        width={80}
                        height={80}
                        className="rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col justify-between w-full">
                      <div>
                        <div className="font-semibold mb-1">
                          <a
                            href={item.news_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {item.title}
                          </a>
                        </div>
                        <div className="text-[#C7C7C7] text-xs font-thin line-clamp-2">
                          {item.context}
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs mt-2 self-end">
                        {item.date}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">뉴스가 없습니다.</div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
