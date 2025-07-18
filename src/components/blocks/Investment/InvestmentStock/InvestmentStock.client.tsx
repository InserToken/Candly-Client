"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import MixedChart from "@/components/charts/Mixedchart";
import { ChartData } from "@/components/charts/Mixedchart";
import {
  parseDateString,
  dateToString,
  getNextDateString,
  isValidTradingDate,
} from "@/utils/date";
import { interpolateBetween } from "@/utils/interpolate";
import useHolidayStore from "@/stores/useHolidayStore";
import { useAuthStore } from "@/stores/authStore";
import { getStock } from "@/services/userStock-service";
import { Stocks } from "@/types/UserStock";
import { useRouter } from "next/navigation";
import FinanceTable from "@/components/charts/FinanceTable";

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

// 예측값 더미데이터
// const prediction = [{ date: "2025-01-07", close: 62000 }];

const mixedStockData: ChartData[] = [
  {
    date: "2025-01-01",
    open: 59700,
    high: 59900,
    low: 59600,
    close: 60000,
    type: "candle",
  },
  {
    date: "2025-01-02",
    open: 60000,
    high: 60300,
    low: 59800,
    close: 60200,
    type: "candle",
  },
  {
    date: "2025-01-03",
    open: 60200,
    high: 60800,
    low: 59700,
    close: 59900,
    type: "candle",
  },
  {
    date: "2025-01-04",
    open: 59900,
    high: 62000,
    low: 60500,
    close: 61500,
    type: "candle",
  },
  {
    date: "2025-01-05",
    open: 61500,
    high: 62500,
    low: 62000,
    close: 62200,
    type: "candle",
  },
  {
    date: "2025-01-06",
    open: 62200,
    high: 62400,
    low: 60800,
    close: 61200,
    type: "candle",
  },
] satisfies ChartData[];

export default function InvestmentStockClient() {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  const [prediction, setPrediction] = useState<ChartData[]>([]);
  const lastClose =
    prediction.length > 0
      ? prediction[prediction.length - 1].close
      : mixedStockData[mixedStockData.length - 1].close ?? 0;
  const latestDate =
    prediction.length > 0
      ? prediction[prediction.length - 1].date
      : mixedStockData[mixedStockData.length - 1].date;
  const holidaySet = useHolidayStore((state) => state.holidaySet);

  const initialLatestDate =
    prediction.length > 0
      ? prediction[prediction.length - 1].date
      : mixedStockData[mixedStockData.length - 1].date;

  const [inputDate, setInputDate] = useState(initialLatestDate);

  useEffect(() => {
    if (holidaySet) {
      const nextDate = getNextDateString(inputDate);
      setInputDate(nextDate);
    }
  }, [holidaySet]);

  const [inputclose, setInputclose] = useState(lastClose);

  const [editIndex, setEditIndex] = useState<number | null>(null); // 수정 중인 인덱스 추적

  const candleData = mixedStockData.filter((d) => d.type === "candle");
  const lastCandle = candleData[candleData.length - 1];
  const firstPrediction = prediction[0];

  let interpolatedBetween: ChartData[] = [];

  const [stock, setStock] = useState<Stocks[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      const result = await getStock(token);
      setStock(result.stocks);
      console.log("사용자의 보유주식 조회:", result.stocks);
    };

    fetchData();
  }, []);

  if (
    firstPrediction &&
    parseDateString(firstPrediction.date).getTime() -
      parseDateString(lastCandle.date).getTime() >
      24 * 60 * 60 * 1000
  ) {
    interpolatedBetween = interpolateBetween(lastCandle, firstPrediction);
  }

  const chartData = [
    ...candleData,
    ...interpolatedBetween,
    ...prediction.map((item) => ({
      date: (() => {
        const d = parseDateString(item.date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      })(),
      close: item.close,
      type: "dot" as const,
    })),
  ];

  const params = useParams<{
    stock_code: string;
  }>();

  useEffect(() => {
    console.log(`${tab} 바뀜`);
  }, [tab]);

  return (
    <div className="min-h-screen px-[80px] pt-1">
      <h2 className="mb-3 text-2xl">
        {stock.length === 0 ? (
          <span className="invisible">.</span>
        ) : (
          stock.find((s) => s._id === params.stock_code)?.name || "종목 없음"
        )}
      </h2>

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
                <MixedChart w={750} h={300} data={chartData} />
              </div>
            ) : (
              <div className="h-[calc(100vh-300px)] w-full">
                <FinanceTable />
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
                      {prediction.map((item, idx) => (
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
                      {prediction.map((item, idx) => (
                        <td
                          key={idx}
                          className="text-white px-4 min-w-[120px] whitespace-nowrap"
                        >
                          {item.close}
                        </td>
                      ))}
                    </tr>

                    {/* 수정/삭제 row */}
                    <tr className="h-12">
                      <th className="text-left px-2 text-gray-300 font-medium sticky left-0 bg-[#0f0f0f] z-10">
                        {" "}
                      </th>
                      {prediction.map((item, idx) => (
                        <td
                          key={idx}
                          className="px-4 min-w-[120px] whitespace-nowrap"
                        >
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-[#396FFB] text-white px-3 py-1 rounded text-sm"
                              onClick={() => {
                                setEditIndex(idx);
                                setInputDate(item.date); // 날짜는 그대로 유지
                                setInputclose(item.close); // 종가 입력창에 값 채움
                              }}
                            >
                              수정
                            </button>
                            <button
                              className="bg-[#2a2a2a] text-white px-3 py-1 rounded text-sm"
                              onClick={() => {
                                const newList = [...prediction];
                                const removed = newList.splice(idx, 1)[0]; // 삭제된 항목

                                const prev = prediction[idx - 1];
                                const next = prediction[idx + 1];

                                // 양쪽 예측값이 존재할 경우 보간으로 다시 이어줌
                                if (prev && next) {
                                  const interpolatedItems: ChartData[] = [];

                                  let current = parseDateString(prev.date);
                                  const end = parseDateString(next.date);

                                  const totalDays =
                                    (end.getTime() - current.getTime()) /
                                    (1000 * 60 * 60 * 24);

                                  let i = 1;
                                  while (true) {
                                    current.setDate(current.getDate() + 1);
                                    const currentStr = dateToString(current);

                                    if (!isValidTradingDate(currentStr))
                                      continue;
                                    if (currentStr === next.date) break;

                                    const interpolatedClose = Math.round(
                                      prev.close +
                                        ((next.close - prev.close) * i) /
                                          totalDays
                                    );

                                    interpolatedItems.push({
                                      date: currentStr,
                                      close: interpolatedClose,
                                      type: "dot",
                                    });

                                    i++;
                                  }

                                  // prev 다음 위치에 삽입
                                  newList.splice(
                                    idx - 1 + 1,
                                    0,
                                    ...interpolatedItems
                                  );
                                }

                                setPrediction(newList);

                                // 삭제된 항목이 수정 중이던 항목이라면 상태 초기화
                                if (editIndex === idx) {
                                  setEditIndex(null);
                                  if (newList.length > 0) {
                                    setInputDate(
                                      getNextDateString(
                                        newList[newList.length - 1].date
                                      )
                                    );
                                  }
                                }
                              }}
                            >
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
                          readOnly={editIndex !== null}
                          className={`bg-[#1b1b1b] border border-[#2a2a2a] rounded px-3 py-1 text-white w-full ${
                            editIndex !== null ? "cursor-not-allowed" : ""
                          }`}
                        />
                      </td>
                    </tr>

                    {/* 종가 입력 row */}
                    <tr className="h-12">
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="w-8 h-8 bg-[#2a2a2a] text-white rounded"
                            onClick={() => setInputclose((prev) => prev - 100)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={inputclose}
                            onChange={(e) =>
                              setInputclose(Number(e.target.value))
                            }
                            className="bg-[#1b1b1b] border border-[#2a2a2a] rounded px-3 py-1 text-white w-[80px] text-center"
                          />
                          <button
                            className="w-8 h-8 bg-[#2a2a2a] text-white rounded"
                            onClick={() => setInputclose((prev) => prev + 100)}
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
                          {/* 추가버튼 */}
                          {editIndex === null ? (
                            <button
                              className="bg-[#396FFB] text-white px-4 py-1.5 rounded text-sm"
                              onClick={() => {
                                if (!inputDate || !inputclose) return;

                                const datePattern =
                                  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
                                if (!datePattern.test(inputDate)) {
                                  alert(
                                    "날짜 형식이 잘못되었습니다. 예: 2025-01-08"
                                  );
                                  return;
                                }

                                const inputDateObj = parseDateString(inputDate);

                                if (inputDateObj.getFullYear() >= 2027) {
                                  alert("2026년까지의 날짜만 예측 가능합니다.");
                                  return;
                                }

                                const existingDates = prediction.map(
                                  (p) => p.date
                                );
                                if (existingDates.includes(inputDate)) {
                                  alert("이미 같은 날짜의 예측이 있습니다.");
                                  return;
                                }

                                const lastDateStr =
                                  prediction.length > 0
                                    ? prediction[prediction.length - 1].date
                                    : mixedStockData[mixedStockData.length - 1]
                                        .date;

                                const lastDate = parseDateString(lastDateStr);

                                if (inputDateObj <= lastDate) {
                                  alert(
                                    "이전 날짜에는 예측을 추가할 수 없습니다."
                                  );
                                  return;
                                }

                                if (!isValidTradingDate(inputDate)) {
                                  alert(
                                    "입력한 날짜는 공휴일 또는 주말입니다. 영업일만 입력 가능합니다."
                                  );
                                  return;
                                }

                                const newprediction = [...prediction];

                                let current = new Date(lastDate);
                                const msPerDay = 24 * 60 * 60 * 1000;
                                let businessDayCount = 0;

                                // 먼저 영업일 수 계산 (중간 날짜)
                                // 영업일 날짜 배열 생성
                                const holidaySet =
                                  useHolidayStore.getState().holidaySet;
                                const intermediateDates: string[] = [];

                                while (current < inputDateObj) {
                                  current = new Date(
                                    current.getTime() + msPerDay
                                  );
                                  const currentStr = dateToString(current);

                                  // 영업일 체크
                                  if (!isValidTradingDate(currentStr)) continue;

                                  if (currentStr === inputDate) break;
                                  intermediateDates.push(currentStr);
                                }

                                const totalBusinessDays =
                                  intermediateDates.length + 1; // 중간 영업일 + 마지막 입력일

                                // 중간 보간값 추가
                                intermediateDates.forEach((dateStr, idx) => {
                                  const interpolatedClose = Math.round(
                                    lastClose +
                                      ((inputclose - lastClose) * (idx + 1)) /
                                        totalBusinessDays
                                  );

                                  newprediction.push({
                                    date: dateStr,
                                    close: interpolatedClose,
                                    type: "dot",
                                  });
                                });

                                // 마지막 입력 예측 추가
                                newprediction.push({
                                  date: inputDate,
                                  close: inputclose,
                                  type: "dot",
                                });

                                // 날짜 기준 정렬
                                newprediction.sort(
                                  (a, b) =>
                                    parseDateString(a.date).getTime() -
                                    parseDateString(b.date).getTime()
                                );

                                setPrediction(newprediction);
                                setInputDate(getNextDateString(inputDate));
                              }}
                            >
                              추가
                            </button>
                          ) : (
                            <button
                              className="bg-[#396FFB] text-white px-4 py-1.5 rounded text-sm"
                              onClick={() => {
                                const newList = [...prediction];
                                newList[editIndex] = {
                                  ...newList[editIndex],
                                  close: inputclose,
                                };
                                setPrediction(newList);
                                setEditIndex(null);
                                setInputDate(
                                  getNextDateString(
                                    newList[newList.length - 1].date
                                  )
                                );
                              }}
                            >
                              수정 저장
                            </button>
                          )}

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
              {stock.map((s, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-lg flex items-center gap-3 cursor-pointer ${
                    s._id === params.stock_code
                      ? "bg-[#396FFB]"
                      : "bg-[#313136]"
                  }`}
                  onClick={() => {
                    router.push(`/investment/${s._id}`, { scroll: false });
                  }}
                >
                  {s.logo && (
                    <Image
                      src={s.logo}
                      alt={s.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  )}

                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 뉴스 */}
          <div className="mt-4">
            <p className="text-2xl font-semibold mb-3.5">관련 뉴스</p>
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">
              {newsList.map((news, idx) => (
                <div
                  key={idx}
                  className="bg-[#1b1b1b] rounded-xl p-4 text-sm relative z-0"
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
