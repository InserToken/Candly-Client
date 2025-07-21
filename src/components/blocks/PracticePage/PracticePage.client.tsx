"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ClickCard from "@/components/buttons/ClickCard";
import CandleChart from "@/components/charts/Candlechart";
import { fetchPracticeProblem } from "@/services/fetchPracticeProblem";
import { fetchPracticeNews } from "@/services/fetchPracticeNews";
type PriceItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
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
  const [parentWidth, setParentWidth] = useState(780); // 초기값: 적당히 780

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

  // ===== 데이터 패칭 =====
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
                    h={320}
                    data={stockData}
                    indi_data={stockData}
                  />
                ) : (
                  <div>문제가 없습니다.</div>
                )}
              </div>
            )}
            {tab === "finance" && (
              <div className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center text-gray-400">
                재무 정보 준비중...
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
            <ClickCard name="답변 랭킹" icon="ranking.svg" />
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
