"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
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
import { fetchRealNews } from "@/services/fetchRealNews";
import postRealInvest from "@/services/postRealInvest";
import fetchRealInvest from "@/services/fetchRealInvest";
import { fetchRealChart } from "@/services/fetchRealChart";
import InvestCandleChart from "@/components/charts/InvestCandleChart";
import { ChartData } from "@/components/charts/Mixedchart";
import { getCurrentPrice } from "@/services/getCurrentPrice";
export default function InvestmentStockClient() {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const params = useParams<{
    stock_code: string;
  }>();
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  // === 차트 부모 width 동적 측정 ===
  const chartBoxRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(780); // 초기값
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

  const holidaySet = useHolidayStore((state) => state.holidaySet);

  // 예측정보 받아오기

  const [prediction, setPrediction] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!auth || !auth.token) {
      return;
    }
    fetchRealInvest(params.stock_code, auth.token).then((data) => {
      const dotFormatted: ChartData[] = data.prediction.map((item) => ({
        date: item.date,
        close: item.close,
        type: "dot",
      }));
      setPrediction(dotFormatted);
    });
  }, []);
  //공휴일 받아오기
  useEffect(() => {
    if (holidaySet) {
      const nextDate = getNextDateString(inputDate);
      setInputDate(nextDate);
    }
  }, [holidaySet]);

  // 수정 중인 인덱스 추적
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // 실제 차트정보 가져오기
  type PriceItem = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
  type StockData = { prices: PriceItem[] };
  const [stockData, setStockData] = useState<any>([]);
  useEffect(() => {
    fetchRealChart(params.stock_code).then((data) => {
      setStockData(data);
    });
  }, []);
  const dotData = [...prediction];

  const initialLatestDate =
    prediction.length > 0
      ? prediction[prediction.length - 1].date
      : stockData?.[stockData.length - 1]?.date || "";

  // Set initial input date
  const [inputDate, setInputDate] = useState(initialLatestDate);
  useEffect(() => {
    if (!holidaySet) return;

    const today = new Date();
    const todayStr = dateToString(today);
    const lastDate =
      prediction.length > 0
        ? prediction[prediction.length - 1].date
        : stockData?.length > 0
        ? stockData[stockData.length - 1].date
        : todayStr;

    const last = parseDateString(lastDate);
    const now = new Date();

    // 예측 가능한 시작 날짜는 오늘보다 늦은 날짜여야 함
    const baseDate = last > now ? lastDate : todayStr;
    const nextTradingDate = getNextDateString(baseDate); // 휴일/주말 제외한 다음 날짜

    setInputDate(nextTradingDate);
  }, [prediction, stockData, holidaySet]);

  // Set initial close
  useEffect(() => {
    const lastClose =
      prediction.length > 0
        ? prediction[prediction.length - 1].close
        : stockData?.length > 0
        ? stockData[stockData.length - 1].close
        : 0;
    setInputclose(lastClose);
  }, [prediction, stockData]);

  const lastCandle =
    stockData?.length > 0 ? stockData[stockData.length - 1] : null;

  const lastClose =
    prediction.length > 0
      ? prediction[prediction.length - 1].close
      : lastCandle?.close ?? 0;

  const firstPrediction = prediction[0];

  const [inputclose, setInputclose] = useState<number>(lastClose);
  //보유주식 가져오기
  const [stock, setStock] = useState<Stocks[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const result = await getStock(token);
      setStock(result.stocks);
      console.log("사용자의 보유주식 조회:", result.stocks);
    };

    fetchData();
  }, []);

  // 보간
  let interpolatedBetween: ChartData[] = [];
  if (
    firstPrediction &&
    lastCandle &&
    parseDateString(firstPrediction.date).getTime() -
      parseDateString(lastCandle.date).getTime() >
      24 * 60 * 60 * 1000
  ) {
    interpolatedBetween = interpolateBetween(
      lastCandle,
      firstPrediction
    ) as ChartData[];
  }

  const todayStr = dateToString(new Date());
  const lastStockDate = stockData?.[stockData.length - 1]?.date;

  const extendedDotData = [...dotData];
  //현재시세
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getCurrentPrice(params.stock_code);
        if (price !== null && !isNaN(price)) {
          setCurrentPrice(price);
        } else {
          console.warn("유효하지 않은 현재가 데이터:", price);
        }
      } catch (error) {
        console.error("현재가 가져오기 실패:", error);
        setCurrentPrice(null); // fallback
      }
    };
    fetchPrice();
  }, [params.stock_code]);

  // 오늘 날짜가 주가 데이터에 없고, 오늘이 주말/공휴일이 아닌 경우만 추가
  const hasToday = extendedDotData.some((item) => item.date === todayStr);

  if (
    isValidTradingDate(todayStr) &&
    !hasToday && // 오늘 날짜가 없을 때만 추가
    currentPrice !== null
  ) {
    extendedDotData.push({
      date: todayStr,
      close: currentPrice,
      type: "dot",
    });
  }

  type NewsItem = {
    _id: string;
    title: string;
    date: string;
    context: string;
    news_url: string;
    img_url?: string;
  };
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => {
    fetchRealNews(params.stock_code).then((data) => {
      setNews(data);
    });
  }, []);

  // 오늘날짜 이후만 수정/삭제 가능
  const futurePredictions = prediction.filter((item) => item.date > todayStr);

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
                  <span className="text-[#e75480]">RSI</span>
                </div>
              )}
            </div>
            {tab === "chart" ? (
              <div
                className="h-[400px] bg-[#1b1b1b] rounded-lg mb-6 flex items-center justify-center w-full text-gray-400 pb-1 "
                ref={chartBoxRef}
              >
                {Array.isArray(stockData) ? (
                  <InvestCandleChart
                    w={parentWidth}
                    data={stockData}
                    indi_data={stockData}
                    news={news}
                    dotData={extendedDotData}
                    todayPrice={currentPrice}
                  />
                ) : (
                  <div>차트가 없습니다.</div>
                )}
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
                      {futurePredictions.map((item, idx) => (
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
                      {futurePredictions.map((item, idx) => (
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
                      {futurePredictions.map((item, idx) => (
                        <td
                          key={idx}
                          className="px-4 min-w-[120px] whitespace-nowrap"
                        >
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-[#396FFB] text-white px-3 py-1 rounded text-sm"
                              onClick={() => {
                                setEditIndex(idx);
                                setInputDate(item.date);
                                setInputclose(item.close);
                              }}
                            >
                              수정
                            </button>
                            <button
                              className="bg-[#2a2a2a] text-white px-3 py-1 rounded text-sm"
                              onClick={() => {
                                const newList = [...futurePredictions];
                                const removed = newList.splice(idx, 1)[0];

                                const prev = futurePredictions[idx - 1];
                                const next = futurePredictions[idx + 1];

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

                                  newList.splice(idx, 0, ...interpolatedItems);
                                }

                                setPrediction(newList);

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
                                const today = new Date();
                                const todayStr = dateToString(today);

                                if (inputDate <= todayStr) {
                                  alert(
                                    "오늘 또는 이전 날짜에는 예측을 추가할 수 없습니다."
                                  );
                                  return;
                                }

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
                                    : stockData?.[stockData.length - 1]?.date ||
                                      "";

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

                                  // 오늘 날짜 제외
                                  const todayStr = dateToString(new Date());
                                  if (currentStr === todayStr) continue;

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

                          <button
                            className="bg-[#396FFB] text-white px-4 py-1.5 rounded text-sm"
                            onClick={() => {
                              if (!auth || !auth.token) {
                                alert("로그인이 필요합니다.");
                                return;
                              }

                              postRealInvest(
                                params.stock_code,
                                auth.token,
                                prediction
                              )
                                .then(() => {
                                  alert("예측이 성공적으로 제출되었습니다.");
                                })
                                .catch((err) => {
                                  console.error("예측 제출 실패:", err);
                                  alert("예측 제출 중 오류가 발생했습니다.");
                                });
                            }}
                          >
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
            <p className="text-2xl  mb-3.5">보유 주식</p>
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
            <p className="text-2xl mb-3.5">관련 뉴스</p>
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto">
              {Array.isArray(news) && news.length > 0 ? (
                news
                  .slice()
                  .reverse()
                  .map((item, idx) => (
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
                          style={{ width: "80px", height: "80px" }}
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
                <div className="flex flex-col items-center">
                  <div className="loader mb-6" />
                  <div className="text-gray-400 text-sm">뉴스 로딩중...</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
      <style jsx>{`
        .loader {
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
