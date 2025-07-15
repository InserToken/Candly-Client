// 원본
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import CandleChart from "@/components/charts/Candlechart";

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

const holdings = [
  { name: "네이버", icon: "/button.svg" },
  { name: "신한투자증권", icon: "/button.svg" },
  { name: "삼성전자", icon: "/button.svg" },
  { name: "삼성전자", icon: "/button.svg" },
];

const predictions = [
  { date: "2025.01.06.", price: 62500 },
  { date: "2025.01.07.", price: 62500 },
  { date: "2025.01.07.", price: 62500 },
  { date: "2025.01.07.", price: 62500 },
];

const stockData = [
  { date: "1/1", open: 59700, high: 59900, low: 59600, close: 60000 },
  { date: "1/2", open: 60000, high: 60300, low: 59800, close: 60200 },
  { date: "1/3", open: 60200, high: 60800, low: 59700, close: 59900 },
  { date: "1/4", open: 59900, high: 62000, low: 60500, close: 61500 },
  { date: "1/5", open: 61500, high: 62500, low: 62000, close: 62200 },
  { date: "1/6", open: 62200, high: 62400, low: 60800, close: 61200 },
  { date: "1/7", open: 61200, high: 62700, low: 61000, close: 62500 },
];

export default function InvestmentStockClient() {
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  const [inputDate, setInputDate] = useState("2025.01.06.");
  const [inputPrice, setInputPrice] = useState(62500);
  const params = useParams<{
    stock_code: string;
  }>();

  return (
    <div className="min-h-screen px-[80px] pt-1">
      <h2 className="mb-3 text-2xl">{params.stock_code} 삼성전자</h2>
      <main className="flex flex-col lg:flex-row gap-6">
        {/* 왼쪽 영역 */}
        <section className="flex-1 max-w-[894px] w-full lg:max-w-[calc(100%-420px)] overflow-hidden">
          {/* 탭 */}
          <div className="text-sm text-gray-300 mb-4">
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
                  <span>MACD</span>
                  <span>RSI</span>
                </div>
              )}
            </div>
            {tab === "chart" ? (
              <div className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center text-gray-400">
                <CandleChart w={600} h={300} data={stockData} />
              </div>
            ) : (
              <div className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center text-gray-400">
                재무 정보 준비중...
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="font-semibold text-xl mb-4">
              예측 입력 <span className="text-gray-400">ⓘ</span>
            </p>

            <div className="flex">
              {/* 왼쪽 스크롤 가능한 테이블 영역 */}
              <div className="flex-1 overflow-x-auto">
                <table className="border-collapse text-center min-w-full">
                  <tbody>
                    {/* 날짜 row */}
                    <tr className="h-12">
                      <th className="text-left px-2 text-gray-300 font-medium w-[80px] sticky left-0 bg-[#0f0f0f] z-10 whitespace-nowrap">
                        날짜
                      </th>
                      {predictions.map((item, idx) => (
                        <td
                          key={idx}
                          className="text-white px-4 min-w-[120px] whitespace-nowrap"
                        >
                          {item.date}
                        </td>
                      ))}
                    </tr>

                    {/* 종가 row */}
                    <tr className="h-12">
                      <th className="text-left px-2 text-gray-300 font-medium sticky left-0 bg-[#0f0f0f] z-10 whitespace-nowrap">
                        종가
                      </th>
                      {predictions.map((item, idx) => (
                        <td
                          key={idx}
                          className="text-white px-4 min-w-[120px] whitespace-nowrap"
                        >
                          {item.price}
                        </td>
                      ))}
                    </tr>

                    {/* 수정/삭제 row */}
                    <tr className="h-12">
                      <th className="text-left px-2 text-gray-300 font-medium sticky left-0 bg-[#0f0f0f] z-10">
                        {" "}
                      </th>
                      {predictions.map((item, idx) => (
                        <td
                          key={idx}
                          className="px-4 min-w-[120px] whitespace-nowrap"
                        >
                          <div className="flex justify-center gap-2">
                            <button className="bg-[#396FFB] text-white px-3 py-1 rounded text-sm">
                              수정
                            </button>
                            <button className="bg-[#2a2a2a] text-white px-3 py-1 rounded text-sm">
                              삭제
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 오른쪽 고정 입력 영역 */}
              <div className="w-[160px] shrink-0 ml-4">
                <table className="border-collapse w-full text-center">
                  <tbody>
                    {/* 날짜 입력 row */}
                    <tr className="h-12">
                      <td>
                        <input
                          type="text"
                          value={inputDate}
                          onChange={(e) => setInputDate(e.target.value)}
                          className="bg-[#1b1b1b] border border-[#2a2a2a] rounded px-3 py-1 text-white w-full"
                        />
                      </td>
                    </tr>

                    {/* 종가 입력 row */}
                    <tr className="h-12">
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="w-8 h-8 bg-[#2a2a2a] text-white rounded"
                            onClick={() => setInputPrice((prev) => prev - 100)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={inputPrice}
                            onChange={(e) =>
                              setInputPrice(Number(e.target.value))
                            }
                            className="bg-[#1b1b1b] border border-[#2a2a2a] rounded px-3 py-1 text-white w-[80px] text-center"
                          />
                          <button
                            className="w-8 h-8 bg-[#2a2a2a] text-white rounded"
                            onClick={() => setInputPrice((prev) => prev + 100)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* 추가/제출 row */}
                    <tr className="h-12">
                      <td>
                        <div className="flex justify-center gap-2">
                          <button className="bg-[#396FFB] text-white px-4 py-1.5 rounded text-sm">
                            추가
                          </button>
                          <button className="bg-[#396FFB] text-white px-4 py-1.5 rounded text-sm">
                            제출
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 오른쪽 영역 */}
        <aside className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
          {/* 보유 주식 */}
          <div>
            <p className="text-xl font-semibold mb-3">보유 주식</p>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[150px]">
              {holdings.map((stock, idx) => (
                <div
                  key={idx}
                  className="bg-[#2a2a2a] px-4 py-2 rounded-lg flex items-center gap-3"
                >
                  <Image
                    src={stock.icon}
                    alt={stock.name}
                    width={28}
                    height={28}
                  />
                  <span>{stock.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 뉴스 */}
          <div className="mt-4">
            <p className="text-2xl font-semibold mb-3.5">관련 뉴스</p>
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">
              {newsList.map((news, idx) => (
                <div key={idx} className="bg-[#1b1b1b] rounded-xl p-4 text-sm">
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
