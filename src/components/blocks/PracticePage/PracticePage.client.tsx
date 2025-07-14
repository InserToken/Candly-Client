"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ClickCard from "@/components/buttons/ClickCard";

// 뉴스 더미데이터
const newsList = [
  {
    title:
      "‘반도체 쇼크’ 삼성전자, 2분기 영업익 4조6000억원... 전년보다 56% 추락",
    source: "Chosun Biz",
    date: "2025.07.08.",
    newsicon: "/button.svg",
    content:
      "더 부진했고, 적자 규모를 줄일 것으로 기대됐던 파운드리(반도체 위탁생산)에서 여전히 2조원 이상의 영업손실이 난 탓이다. 삼성전자는 8일 잠정 실적 발표를 통해...",
  },
  {
    title:
      "‘반도체 쇼크’ 삼성전자, 2분기 영업익 4조6000억원... 전년보다 56% 추락",
    source: "MK 뉴스",
    date: "2025.07.08.",
    newsicon: "/button.svg",
    content:
      "더 부진했고, 적자 규모를 줄일 것으로 기대됐던 파운드리(반도체 위탁생산)에서 여전히 2조원 이상의 영업손실이 난 탓이다. 삼성전자는 8일 잠정 실적 발표를 통해...",
  },
  {
    title:
      "‘반도체 쇼크’ 삼성전자, 2분기 영업익 4조6000억원... 전년보다 56% 추락",
    source: "SBS 뉴스",
    date: "2025.07.08.",
    newsicon: "/button.svg",
    content:
      "더 부진했고, 적자 규모를 줄일 것으로 기대됐던 파운드리(반도체 위탁생산)에서 여전히 2조원 이상의 영업손실이 난 탓이다. 삼성전자는 8일 잠정 실적 발표를 통해...",
  },
];

export default function PracticeClient() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  const params = useParams<{
    problemId: string;
  }>();

  return (
    <div className="min-h-screen px-[80px] pt-1">
      <h2 className=" mb-3 text-2xl">
        {params.problemId}번 문제 - <span className="font-bold">삼성전자</span>
      </h2>
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

              {/* 지표 (차트 탭에서만 보임) */}
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
                  <span>MACD</span>
                  <span>RSI</span>
                </div>
              )}
            </div>

            {/* 콘텐츠 영역 */}
            {tab === "chart" ? (
              <div className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center text-gray-400">
                차트 정보 준비중...
              </div>
            ) : (
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
              {newsList.map((news, idx) => (
                <div
                  key={idx}
                  className="bg-[#1b1b1b] rounded-xl p-4 text-sm  "
                >
                  <div className="flex pb-2">
                    <Image
                      src={news.newsicon}
                      alt="언론사 로고"
                      height={40}
                      width={40}
                      className="pr-3"
                    />
                    <div className="font-semibold">{news.title}</div>
                  </div>
                  <div className="text-[#C7C7C7] text-xs font-thin">
                    {news.content}
                  </div>
                  <div className="text-gray-400 mt-2 text-xs float-right">
                    {news.source} · {news.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
