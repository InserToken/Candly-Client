"use client";
import React, { useState, useEffect } from "react";
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

// 뉴스 더미데이터
// const newsList = [
//   {
//     title:
//       "‘반도체 쇼크’ 삼성전자, 2분기 영업익 4조6000억원... 전년보다 56% 추락",
//     source: "Chosun Biz",
//     date: "2025.07.08.",
//     newsicon: "/button.svg",
//     content:
//       "더 부진했고, 적자 규모를 줄일 것으로 기대됐던 파운드리(반도체 위탁생산)에서 여전히 2조원 이상의 영업손실이 난 탓이다. 삼성전자는 8일 잠정 실적 발표를 통해...",
//   },
//   {
//     title:
//       "‘반도체 쇼크’ 삼성전자, 2분기 영업익 4조6000억원... 전년보다 56% 추락",
//     source: "MK 뉴스",
//     date: "2025.07.08.",
//     newsicon: "/button.svg",
//     content:
//       "더 부진했고, 적자 규모를 줄일 것으로 기대됐던 파운드리(반도체 위탁생산)에서 여전히 2조원 이상의 영업손실이 난 탓이다. 삼성전자는 8일 잠정 실적 발표를 통해...",
//   },
//   {
//     title:
//       "‘반도체 쇼크’ 삼성전자, 2분기 영업익 4조6000억원... 전년보다 56% 추락",
//     source: "SBS 뉴스",
//     date: "2025.07.08.",
//     newsicon: "/button.svg",
//     content:
//       "더 부진했고, 적자 규모를 줄일 것으로 기대됐던 파운드리(반도체 위탁생산)에서 여전히 2조원 이상의 영업손실이 난 탓이다. 삼성전자는 8일 잠정 실적 발표를 통해...",
//   },
// ];

// 주식 더미데이터
// const stockData = [
//   { date: "1/1", open: 59700, high: 59900, low: 59600, close: 60000 },
//   { date: "1/2", open: 60000, high: 60300, low: 59800, close: 60200 },
//   { date: "1/3", open: 60200, high: 60800, low: 59700, close: 59900 },
//   { date: "1/4", open: 59900, high: 62000, low: 60500, close: 61500 },
//   { date: "1/5", open: 61500, high: 62500, low: 62000, close: 62200 },
//   { date: "1/6", open: 62200, high: 62400, low: 60800, close: 61200 },
//   { date: "1/7", open: 61200, high: 62700, low: 61000, close: 62500 },
// ];

export default function PracticeClient() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  const params = useParams<{
    problemId: string;
  }>();
  const [problemData, setProblemData] = useState<PracticeProblemData | null>(
    null
  );

  const [news, setNews] = useState<NewsItem[]>([]);

  const stockData = problemData?.prices;

  // 이동평균 계산 함수 (컴포넌트 안에 선언)
  function getMovingAverage(data, period) {
    if (!Array.isArray(data)) return [];
    return data.map((d, i) => {
      if (i < period - 1) return null;
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, cur) => acc + cur.close, 0) / period;
      return avg;
    });
  }

  // 120일치 데이터 준비
  const chartData = Array.isArray(stockData) ? stockData.slice(0, 140) : [];

  // // MA20, MA60, MA120 계산
  // const ma20 = getMovingAverage(chartData, 20);
  // const ma60 = getMovingAverage(chartData, 60);
  // const ma120 = getMovingAverage(chartData, 120);

  // const last20MA20 = ma20.slice(-20); // 20일 전~기준일까지 MA20
  // const last20MA60 = ma60.slice(-20);
  // const last20MA120 = ma120.slice(-20);

  // // 값 콘솔 출력
  // useEffect(() => {
  //   if (ma20.length > 0) {
  //     console.log("MA20:", ma20);
  //     console.log("MA60:", ma60);
  //     console.log("MA120:", ma120);

  //     console.log("slice MA20:", last20MA20);
  //     console.log("slice MA60:", last20MA60);
  //     console.log("slice MA120:", last20MA120);
  //   }
  // }, [stockData]);

  useEffect(() => {
    fetchPracticeProblem(params.problemId).then((data) => {
      setProblemData(data);
    });
  }, []);

  // 찍어보기
  useEffect(() => {
    fetchPracticeProblem(params.problemId).then((data) => {
      setProblemData(data);
      console.log("🔥 fetchPracticeProblem 결과:", data);
    });
  }, []);

  useEffect(() => {
    fetchPracticeNews(params.problemId).then((data) => {
      setNews(data);
      console.log(data);
    });
  }, []);

  return (
    <div className="min-h-screen px-[80px] pt-1">
      <h2 className=" mb-3 text-2xl">{problemData?.title}</h2>
      <main className=" flex flex-col lg:flex-row gap-6">
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

              {/* 지표  */}
              {tab === "chart" && (
                <div className="flex flex-wrap gap-4 items-center justify-end text-sm text-gray-300 ml-auto pr-3">
                  <span className="flex items-center gap-1">
                    <span className="text-white pr-1">이동평균선</span>
                    <span className="text-[#00D5C0]">5</span> ·
                    <span className="text-[#E8395F]">20</span> ·
                    <span className="text-[#F87800]">60</span> ·
                    <span className="text-[#]">120</span>
                  </span>
                  <span className="text-[#EDCB37]">볼린저밴드</span> |
                  <span className="text-[#396FFB]">거래량</span>
                  <span>MACD</span>
                  <span>RSI</span>
                </div>
              )}
            </div>
            {/* 콘텐츠 영역 */}
            {tab === "chart" && (
              <div className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center text-gray-400 pb-1">
                {Array.isArray(stockData) ? (
                  // 문제(20일)
                  <CandleChart
                    w={780}
                    h={320}
                    data={stockData.slice(120, 140)}
                    indi_data={stockData.slice(0, 140)}
                  />
                ) : (
                  // 정답(40일)
                  // <CandleChart w={600} h={300} data={stockData} />
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
