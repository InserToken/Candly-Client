"use client";
import React, { useRef, useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { getMovingAverage, getBollingerBands, getRSI } from "@/utils/indicator";

interface ShowLine {
  ma5: boolean;
  ma20: boolean;
  ma60: boolean;
  ma120: boolean;
  bb: boolean;
}

export type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type NewsItem = {
  _id: string;
  title: string;
  date: string;
  context: string;
  news_url: string;
  img_url?: string;
};

type CandleChartProps = {
  w: number;
  data: Candle[];
  indi_data: Candle[];
  news: NewsItem[];
  dotData?: ChartData[];
  todayPrice?: number | null;
  showLine: ShowLine;
};

type CandleData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  type: "candle";
};

type DotData = {
  date: string;
  close: number;
  type: "dot";
  source?: "realtime" | "prediction";
};

export type ChartData = CandleData | DotData;

const LEFT_AXIS_WIDTH = 60;
const CHART_HEIGHT = 220;
const VOLUME_HEIGHT = 100;
const RSI_HEIGHT = 80;
const DATE_AXIS_HEIGHT = 24;

const MIN_CANDLES = 10;
const SHOW_LEN = 200;

function getDateTickFormat(
  index: number,
  candle: Candle,
  visibleCandles: number
) {
  if (visibleCandles > 60) {
    if (candle.date.slice(8, 10) === "01" || index === 0)
      return candle.date.slice(2, 7).replace("-0", "-");
    return "";
  }
  if (visibleCandles > 20) {
    if (candle.date.slice(8, 10) === "01" || index === 0)
      return candle.date.slice(2, 7).replace("-0", "-");
    if (index % 5 === 0) return candle.date.slice(5);
    return "";
  }
  if (candle.date.slice(8, 10) === "01" || index === 0)
    return candle.date.slice(2, 7).replace("-0", "-");
  return candle.date.slice(8);
}
export default function InvestCandleChart({
  w,
  data,
  indi_data,
  news,
  dotData,
  todayPrice,
  showLine,
}: CandleChartProps) {
  // ==== 데이터 슬라이싱 ====
  const combinedChartData = useMemo(() => {
    const dotCandles = (dotData ?? []).map((dot) => ({
      ...dot,
      open: dot.close,
      high: dot.close,
      low: dot.close,
      volume: 0,
    })) as Candle[];

    const merged = [...data, ...dotCandles];

    const sorted = merged.sort(
      (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
    );

    return sorted;
  }, [data, dotData]);
  const lastDate = dotData?.length ? dotData[dotData.length - 1].date : null;
  const lastIndex = lastDate
    ? combinedChartData.findIndex((d) => d.date === lastDate)
    : combinedChartData.length - 1;

  const endIdx = combinedChartData.length; // 항상 마지막까지 포함
  const startIdx = Math.max(0, endIdx - SHOW_LEN);
  const chartData = combinedChartData.slice(startIdx, endIdx);

  const ma5_full = getMovingAverage(indi_data, 5).slice(startIdx, endIdx);
  const ma20_full = getMovingAverage(indi_data, 20).slice(startIdx, endIdx);
  const ma60_full = getMovingAverage(indi_data, 60).slice(startIdx, endIdx);
  const ma120_full = getMovingAverage(indi_data, 120).slice(startIdx, endIdx);
  const bbands_full = getBollingerBands(data, 20, 2).slice(startIdx, endIdx);
  const rsi_full = getRSI(data, 20).slice(startIdx, endIdx);

  const MAX_CANDLES = chartData.length;

  const [visibleCandles, setVisibleCandles] = useState(40);
  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    const initialVisible = Math.min(40, MAX_CANDLES);
    const initialStart = Math.max(0, MAX_CANDLES - initialVisible);
    setVisibleCandles(initialVisible);
    setStartIndex(initialStart);
  }, [MAX_CANDLES]);

  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);

  // 툴팁 state
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    idx?: number;
    data?: Candle;
    section?: "candle" | "volume";
  } | null>(null);

  const tooltipNews =
    tooltip?.data && news
      ? news.filter((item) => {
          const newsDate = dayjs(item.date);
          const candleDate = dayjs(tooltip.data!.date);
          return newsDate.isSame(candleDate);
        })
      : [];

  // 팬/줌 구간
  const slicedData = chartData.slice(startIndex, startIndex + visibleCandles);
  const ma5_visible = ma5_full.slice(startIndex, startIndex + visibleCandles);
  const ma20_visible = ma20_full.slice(startIndex, startIndex + visibleCandles);
  const ma60_visible = ma60_full.slice(startIndex, startIndex + visibleCandles);
  const ma120_visible = ma120_full.slice(
    startIndex,
    startIndex + visibleCandles
  );
  const bb_visible = bbands_full.slice(startIndex, startIndex + visibleCandles);
  const rsi_visible = rsi_full.slice(startIndex, startIndex + visibleCandles);

  // 팬/줌 핸들러
  const handleWheelLikeReact = React.useCallback(
    (e: any) => {
      // deltaY, offsetX 등은 native, react event 모두 존재
      let deltaY = e.deltaY;
      let offsetX = e.offsetX || e.nativeEvent?.offsetX || 0;

      const oldVisible = visibleCandles;
      let nextVisible = oldVisible;
      if (deltaY < 0) nextVisible = Math.max(MIN_CANDLES, oldVisible - 2);
      else nextVisible = Math.min(MAX_CANDLES, oldVisible + 2);

      const chartW = w - LEFT_AXIS_WIDTH;
      const centerRatio = offsetX / chartW;
      const centerIdx = startIndex + Math.floor(centerRatio * oldVisible);

      let nextStart = Math.round(centerIdx - centerRatio * nextVisible);
      nextStart = Math.max(0, Math.min(MAX_CANDLES - nextVisible, nextStart));

      setVisibleCandles(nextVisible);
      setStartIndex(nextStart);
    },
    [visibleCandles, startIndex, MAX_CANDLES, w]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartIndex.current = startIndex;
    document.body.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStartX.current;
    const chartW = w - LEFT_AXIS_WIDTH;
    const moveCandles = Math.round((-dx / chartW) * visibleCandles);
    let nextStart = dragStartIndex.current + moveCandles;
    nextStart = Math.max(0, Math.min(MAX_CANDLES - visibleCandles, nextStart));
    setStartIndex(nextStart);
  };
  const onMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = "";
  };

  const getNearestCandleIdx = (offsetX: number) => {
    return Math.round(offsetX / candleSpacing);
  };

  const handleCandleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const idx = getNearestCandleIdx(offsetX);
    const candle = slicedData[idx];

    // dotData이면 툴팁 안 뜨게 처리
    if (!candle || (dotData && dotData.some((d) => d.date === candle.date))) {
      setTooltip(null);
      return;
    }

    setTooltip({
      show: true,
      x: offsetX + LEFT_AXIS_WIDTH,
      y: e.clientY - rect.top,
      idx,
      data: candle,
      section: "candle",
    });
  };

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleCandleMouseMove(e);
    onMouseMove(e);
  };

  const handleCandleMouseLeave = () => setTooltip(null);

  const handleVolumeMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const idx = getNearestCandleIdx(offsetX);
    const candle = slicedData[idx];

    // dotData이면 툴팁 안 뜨게 처리
    if (
      idx < 0 ||
      idx >= slicedData.length ||
      (dotData && dotData.some((d) => d.date === candle.date))
    ) {
      setTooltip(null);
      return;
    }

    setTooltip({
      show: true,
      x: offsetX + LEFT_AXIS_WIDTH,
      y: e.clientY - rect.top,
      idx,
      data: candle,
      section: "candle",
    });
  };

  const handleVolumeChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleVolumeMouseMove(e);
    onMouseMove(e);
  };

  const handleVolumeMouseLeave = () => setTooltip(null);

  // ==== 스케일 계산 ====
  const chartWidth = w - LEFT_AXIS_WIDTH;
  const highs = slicedData
    .filter((d) => d.close !== -1)
    .map((d) => d.high)
    .filter((v) => typeof v === "number");

  const lows = slicedData
    .filter((d) => d.close !== -1)
    .map((d) => d.low)
    .filter((v) => typeof v === "number");

  const maxPrice = highs.length ? Math.max(...highs) : 0;
  const minPrice = lows.length ? Math.min(...lows) : 0;
  const midPrice = Math.round((maxPrice + minPrice) / 2);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;
  const getY = (price: number) => {
    if (typeof price !== "number" || isNaN(price)) return CHART_HEIGHT;
    if (!isFinite(chartMax) || !isFinite(chartMin) || chartRange === 0)
      return CHART_HEIGHT / 2;
    return ((chartMax - price) / chartRange) * CHART_HEIGHT;
  };

  // 가격 축 3개만
  const getPriceTicks = () => [
    { y: getY(maxPrice), price: maxPrice },
    { y: getY(midPrice), price: midPrice },
    { y: getY(minPrice), price: minPrice },
  ];

  const volumes = slicedData.map((d) => d.volume ?? 0);
  const maxVolume = Math.max(...volumes, 1);
  const getVolumeY = (volume: number) =>
    VOLUME_HEIGHT - (volume / maxVolume) * VOLUME_HEIGHT;

  // candleSpacing은 항상 (visibleCandles - 1)로 나누기!
  const candleSpacing =
    visibleCandles > 1 ? chartWidth / (visibleCandles - 1) : chartWidth;
  const candleWidth = Math.min(40, candleSpacing * 0.7, 24);

  function getLinePoints(
    arr: (number | null)[],
    candleSpacing: number,
    getY: (v: number) => number
  ) {
    return arr
      .map((val, i) =>
        typeof val === "number" && !isNaN(val)
          ? `${i * candleSpacing},${getY(val)}`
          : null
      )
      .filter(Boolean)
      .join(" ");
  }

  const ma5Points = getLinePoints(ma5_visible, candleSpacing, getY);
  const ma20Points = getLinePoints(ma20_visible, candleSpacing, getY);
  const ma60Points = getLinePoints(ma60_visible, candleSpacing, getY);
  const ma120Points = getLinePoints(ma120_visible, candleSpacing, getY);
  const bb_upper_points = getLinePoints(
    bb_visible.map((b) => b?.upper),
    candleSpacing,
    getY
  );
  const bb_middle_points = getLinePoints(
    bb_visible.map((b) => b?.middle),
    candleSpacing,
    getY
  );
  const bb_lower_points = getLinePoints(
    bb_visible.map((b) => b?.lower),
    candleSpacing,
    getY
  );

  const chartRef = useRef<HTMLDivElement>(null);

  // addEventListener로 등록
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleWheelLikeReact(e);
    };
    chart.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      chart.removeEventListener("wheel", onWheel);
    };
  }, [handleWheelLikeReact]);

  // 날짜를 기준으로 dotData를 필터링하여 렌더링 대상만 추출
  const slicedDateMap = new Map(
    slicedData.map((candle, index) => [
      dayjs(candle.date).format("YYYY-MM-DD"),
      index,
    ])
  );

  const dotPoints = (dotData ?? [])
    .filter((dot) => dot.close !== -1)
    .map((dot) => {
      const key = dayjs(dot.date).format("YYYY-MM-DD");
      const i = slicedDateMap.get(key);
      if (i === undefined) return null;
      const x = i * candleSpacing;
      const y = getY(dot.close);
      if (typeof y !== "number" || isNaN(y)) return null;
      return { x, y };
    })
    .filter(Boolean) as { x: number; y: number }[];

  //오늘시세
  const todayDot = useMemo(() => {
    if (!todayPrice) return null;

    const today = dayjs().format("YYYY-MM-DD");
    const index = slicedData.findIndex((d) =>
      dayjs(d.date).isSame(today, "day")
    );
    if (index === -1) return null;

    const x = index * candleSpacing;
    const y = getY(todayPrice);

    return { x, y };
  }, [todayPrice, slicedData, candleSpacing]);

  const PADDING_RIGHT = 8;

  // 볼린저 밴드 영역 채우기를 위한 path 데이터 생성
  const createBollingerBandPath = () => {
    const upperPoints = [];
    const lowerPoints = [];

    bb_visible.forEach((bb, i) => {
      if (bb?.upper && bb?.lower) {
        const x = i * candleSpacing;
        upperPoints.push(`${x},${getY(bb.upper)}`);
        lowerPoints.push(`${x},${getY(bb.lower)}`);
      }
    });

    if (upperPoints.length === 0) return "";

    // 상단선을 그리고, 하단선을 역순으로 연결해서 닫힌 영역 만들기
    const pathData = [
      `M ${upperPoints[0]}`, // 시작점으로 이동
      `L ${upperPoints.slice(1).join(" L ")}`, // 상단선 그리기
      `L ${lowerPoints.slice().reverse().join(" L ")}`, // 하단선을 역순으로 그리기
      "Z", // path 닫기
    ].join(" ");

    return pathData;
  };

  // --- 렌더 ---
  return (
    <div
      className="flex flex-col "
      style={{
        width: "100%",
        maxWidth: w,
        position: "relative",
        // overflow: "hidden",
        background: "inherit",
      }}
      ref={chartRef}
    >
      {/* 1. 캔들차트 (상단) */}
      <div className="flex" style={{ width: "100%" }}>
        <svg width={LEFT_AXIS_WIDTH} height={CHART_HEIGHT}>
          {getPriceTicks().map((line, i) => (
            <text
              key={i}
              x={LEFT_AXIS_WIDTH - 5}
              y={line.y + 5}
              fill="#9CA3AF"
              fontSize="12"
              textAnchor="end"
            >
              {line.price.toLocaleString()}
            </text>
          ))}
        </svg>
        <svg
          width={chartWidth + PADDING_RIGHT}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth + PADDING_RIGHT} ${CHART_HEIGHT}`}
          style={{
            width: "100%",
            background: "#1b1b1b",
            userSelect: "none",
            outline: "none",
            display: "block",
            flex: 1,
          }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleCandleMouseLeave}
          tabIndex={0}
        >
          {/* 그리드 3개만 */}
          {getPriceTicks().map((line, i) => (
            <line
              key={i}
              x1={0}
              y1={line.y}
              x2={chartWidth}
              y2={line.y}
              stroke="#374151"
              strokeDasharray="3,3"
              strokeWidth="1"
              opacity={0.7}
            />
          ))}
          {/* 볼린저 밴드 영역 채우기 */}
          {showLine?.bb && (
            <path
              d={createBollingerBandPath()}
              fill="#EDCB37"
              fillOpacity={0.1}
              stroke="none"
            />
          )}
          {/* 이동평균선/BB */}
          {showLine?.ma5 && (
            <polyline
              fill="none"
              stroke="#00D5C0"
              strokeWidth="2"
              points={ma5Points}
              opacity={0.8}
            />
          )}
          {showLine?.ma20 && (
            <polyline
              fill="none"
              stroke="#E8395F"
              strokeWidth="2"
              points={ma20Points}
              opacity={0.85}
            />
          )}
          {showLine?.ma60 && (
            <polyline
              fill="none"
              stroke="#F87800"
              strokeWidth="2"
              points={ma60Points}
              opacity={0.85}
            />
          )}
          {showLine?.ma120 && (
            <polyline
              fill="none"
              stroke="#7339FB"
              strokeWidth="2"
              points={ma120Points}
              opacity={0.7}
            />
          )}
          {/* <polyline
            fill="none"
            stroke="#EDCB37"
            strokeWidth="2"
            points={bb_middle_points}
            opacity={0.8}
          /> */}
          {showLine?.bb && (
            <polyline
              fill="none"
              stroke="#EDCB37"
              strokeWidth="1.5"
              points={bb_upper_points}
              opacity={0.7}
            />
          )}
          {showLine?.bb && (
            <polyline
              fill="none"
              stroke="#EDCB37"
              strokeWidth="1.5"
              points={bb_lower_points}
              opacity={0.7}
            />
          )}
          {tooltip?.show && tooltip.idx !== undefined && (
            <line
              x1={tooltip.idx * candleSpacing}
              y1={0}
              x2={tooltip.idx * candleSpacing}
              y2={CHART_HEIGHT}
              stroke="#53A6FA"
              strokeWidth={1.5}
              opacity={0.7}
              pointerEvents="none"
            />
          )}

          {/** 캔들 */}
          {slicedData.map((candle, i) => {
            // 종가만 존재하거나 dotData와 날짜가 겹치면 캔들 생략
            const isDotOnly =
              candle.open === candle.close &&
              candle.high === candle.close &&
              candle.low === candle.close &&
              candle.volume === 0 &&
              dotData?.some((d) => d.date === candle.date);

            if (candle.close === -1 || isDotOnly) return null;

            const x = i * candleSpacing;
            const isRising = candle.close > candle.open;
            const bodyTop = getY(Math.max(candle.open, candle.close));
            const bodyBottom = getY(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
            const wickTop = getY(candle.high);
            const wickBottom = getY(candle.low);
            const highlight = tooltip?.show && tooltip.idx === i;

            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={wickTop}
                  x2={x}
                  y2={wickBottom}
                  stroke={isRising ? "#3B82F6" : "#EF4444"}
                  strokeWidth="2"
                />
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isRising ? "#3B82F6" : "#EF4444"}
                  rx={4}
                  style={
                    highlight
                      ? {
                          filter: "drop-shadow(0 0 8px #53A6FA88)",
                          stroke: "#53A6FA",
                          strokeWidth: 2,
                        }
                      : {}
                  }
                />
              </g>
            );
          })}

          {/* dot 포인트 연결선 (todayDot 제외) */}
          {dotPoints.length > 1 && (
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              points={dotPoints
                .filter(
                  (p) => !todayDot || p.x !== todayDot.x || p.y !== todayDot.y // todayDot과 좌표 일치하면 제외
                )
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              opacity={0.9}
            />
          )}

          {/* dot 포인트 원형 표시 */}
          {dotPoints.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={5}
              fill="#10B981"
              stroke="#10B981"
              strokeWidth={2}
              style={{ pointerEvents: "none" }}
            />
          ))}
          {todayDot && (
            <circle
              cx={todayDot.x}
              cy={todayDot.y}
              r={5}
              fill="#e75480"
              stroke="#f4f4f4"
              strokeWidth={2}
              opacity={0.9}
              style={{ pointerEvents: "none" }}
            />
          )}
        </svg>
      </div>

      {/* 2. 거래량(볼륨) 차트 (중간) */}
      <div className="flex" style={{ position: "relative", width: "100%" }}>
        <svg width={LEFT_AXIS_WIDTH} height={VOLUME_HEIGHT}>
          <text
            x={LEFT_AXIS_WIDTH - 5}
            y={16}
            fill="#b9b9b9"
            fontSize="11"
            textAnchor="end"
          >
            {maxVolume.toLocaleString()}
          </text>
        </svg>
        <svg
          width={chartWidth + PADDING_RIGHT}
          height={VOLUME_HEIGHT}
          viewBox={`0 0 ${chartWidth + PADDING_RIGHT} ${VOLUME_HEIGHT}`}
          style={{
            width: "100%",
            background: "#1b1b1b",
            outline: "none",
            display: "block",
            flex: 1,
          }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={handleVolumeChartMouseMove}
          onMouseLeave={handleVolumeMouseLeave}
          tabIndex={0}
        >
          <line
            x1={0}
            y1={0}
            x2={chartWidth}
            y2={0}
            stroke="#444"
            strokeDasharray="2,2"
          />
          {tooltip?.show && tooltip.idx !== undefined && (
            <line
              x1={tooltip.idx * candleSpacing}
              y1={0}
              x2={tooltip.idx * candleSpacing}
              y2={VOLUME_HEIGHT}
              stroke="#53A6FA"
              strokeWidth={1.5}
              opacity={0.7}
              pointerEvents="none"
            />
          )}
          {/* 볼륨 막대 */}
          {slicedData.map((candle, i) => {
            if (candle.close === -1) return null;
            const x = i * candleSpacing;
            const vol = candle.volume ?? 0;
            const isRising = candle.close > candle.open;
            const barY = getVolumeY(vol);
            const barHeight = VOLUME_HEIGHT - barY;
            const highlight = tooltip?.show && tooltip.idx === i;
            return (
              <rect
                key={i}
                x={x - candleWidth / 2}
                y={barY}
                width={candleWidth}
                height={barHeight}
                fill={isRising ? "#3B82F6" : "#EF4444"}
                opacity="0.6"
                rx={2}
                style={
                  highlight
                    ? {
                        filter: "drop-shadow(0 0 7px #53A6FA88)",
                        stroke: "#53A6FA",
                        strokeWidth: 2,
                      }
                    : {}
                }
              />
            );
          })}
        </svg>
      </div>

      {/* 3. RSI 차트 (중간) */}
      <div className="flex" style={{ position: "relative", width: "100%" }}>
        <svg width={LEFT_AXIS_WIDTH} height={RSI_HEIGHT}>
          <text
            x={LEFT_AXIS_WIDTH - 8}
            y={16}
            fill="#b9b9b9"
            fontSize="11"
            textAnchor="end"
          >
            RSI
          </text>
        </svg>
        <svg
          width={chartWidth + PADDING_RIGHT}
          height={RSI_HEIGHT}
          viewBox={`0 0 ${chartWidth + PADDING_RIGHT} ${RSI_HEIGHT}`}
          style={{
            width: "100%",
            background: "#181818",
            outline: "none",
            display: "block",
            flex: 1,
          }}
        >
          {/* 70선 */}
          <line
            x1={0}
            y1={(1 - 0.7) * RSI_HEIGHT}
            x2={chartWidth}
            y2={(1 - 0.7) * RSI_HEIGHT}
            stroke="#E8395F"
            strokeDasharray="3,2"
            strokeWidth="1"
            opacity={0.55}
          />
          {/* 30선 */}
          <line
            x1={0}
            y1={(1 - 0.3) * RSI_HEIGHT}
            x2={chartWidth}
            y2={(1 - 0.3) * RSI_HEIGHT}
            stroke="#00B0F0"
            strokeDasharray="3,2"
            strokeWidth="1"
            opacity={0.55}
          />
          {/* 50선 */}
          <line
            x1={0}
            y1={(1 - 0.5) * RSI_HEIGHT}
            x2={chartWidth}
            y2={(1 - 0.5) * RSI_HEIGHT}
            stroke="#aaa"
            strokeDasharray="2,3"
            strokeWidth="1"
            opacity={0.3}
          />
          {/* RSI 라인 */}
          <polyline
            fill="none"
            stroke="#e75480"
            strokeWidth="2"
            points={rsi_visible
              .map((val, i) =>
                typeof val === "number" && isFinite(val)
                  ? `${i * candleSpacing},${(1 - val / 100) * RSI_HEIGHT}`
                  : null
              )
              .filter((v): v is string => v !== null)

              .join(" ")}
            opacity={0.96}
          />
        </svg>
      </div>

      {/* 4. 날짜 라벨 (아래) */}
      <div className="flex" style={{ position: "relative", width: "100%" }}>
        <svg width={LEFT_AXIS_WIDTH} height={DATE_AXIS_HEIGHT} />
        <svg
          width={chartWidth + PADDING_RIGHT}
          height={DATE_AXIS_HEIGHT}
          viewBox={`0 0 ${chartWidth + PADDING_RIGHT} ${DATE_AXIS_HEIGHT}`}
          style={{
            width: "100%",
            background: "#1b1b1b",
            display: "block",
            flex: 1,
          }}
        >
          {slicedData.map((candle, i) => {
            const x = i * candleSpacing;
            const label = getDateTickFormat(i, candle, visibleCandles);
            return (
              label && (
                <text
                  key={i}
                  x={x}
                  y={18}
                  fill="#9CA3AF"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {label}
                </text>
              )
            );
          })}
        </svg>
      </div>
      {/* 툴팁 */}
      {tooltip?.show && tooltip.data && tooltip.idx !== undefined && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 18,
            top:
              tooltip.section === "volume"
                ? CHART_HEIGHT + VOLUME_HEIGHT / 2 - 60
                : 40,
            background: "#232323",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 8,
            pointerEvents: "none",
            fontSize: 13,
            boxShadow: "0 2px 10px #0003",
            zIndex: 100,
            width: 220, // <<--- 추가!
            //minWidth: 130,     // 필요에 따라 minWidth는 지워도 됨
            whiteSpace: "normal",
            border: "1px solid #396FFB88",
          }}
        >
          <div>
            <b>{tooltip.data.date}</b>
          </div>
          <div>시: {tooltip.data.open.toLocaleString()}</div>
          <div>고: {tooltip.data.high.toLocaleString()}</div>
          <div>저: {tooltip.data.low.toLocaleString()}</div>
          <div>종: {tooltip.data.close.toLocaleString()}</div>
          <div>거래량: {tooltip.data.volume.toLocaleString()}</div>
          {/* ====== 뉴스 영역 추가!! ====== */}
          {tooltipNews.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>📰 뉴스</div>
              {tooltipNews.map((item, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <a
                    href={item.news_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#5dbbff",
                      textDecoration: "underline",
                      fontWeight: 500,
                    }}
                  >
                    {item.title}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
