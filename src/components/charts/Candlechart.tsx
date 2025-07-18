"use client";
import React, { useRef, useState } from "react";
import { getMovingAverage } from "@/utils/indicator";

export type Candle = {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
};

type CandleChartProps = {
  w: number;
  h: number;
  data: Candle[];
  indi_data: Candle[];
};

const PADDING_RATIO = 0.1;
const LEFT_AXIS_WIDTH = 60;
const BOTTOM_PADDING = 40;
const MIN_CANDLES = 10;

function getDateTickFormat(
  index: number,
  candle: Candle,
  visibleCandles: number
) {
  // 매우 축소: 월별만
  if (visibleCandles > 60) {
    if (candle.date.slice(8, 10) === "01" || index === 0)
      return candle.date.slice(2, 7).replace("-0", "-"); // '25-7'
    return "";
  }
  // 보통: 5일 단위 + 월 시작
  if (visibleCandles > 20) {
    if (candle.date.slice(8, 10) === "01" || index === 0)
      return candle.date.slice(2, 7).replace("-0", "-");
    if (index % 5 === 0) return candle.date.slice(5); // MM-DD
    return "";
  }
  // 확대: 일별 + 월 시작은 월만
  if (candle.date.slice(8, 10) === "01" || index === 0)
    return candle.date.slice(2, 7).replace("-0", "-");
  return candle.date.slice(8); // 'DD'
}

export default function CandleChart({
  w,
  h,
  data,
  indi_data,
}: CandleChartProps) {
  const MAX_CANDLES = data.length;
  const [visibleCandles, setVisibleCandles] = useState(
    Math.min(40, data.length)
  );
  const [startIndex, setStartIndex] = useState(
    Math.max(0, data.length - visibleCandles)
  );
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);

  // 휠 줌 (마우스 위치 기준)
  const handleWheel = (e: React.WheelEvent) => {
    // e.preventDefault();
    const oldVisible = visibleCandles;
    let nextVisible = oldVisible;
    if (e.deltaY < 0)
      nextVisible = Math.max(MIN_CANDLES, oldVisible - 2); // 확대
    else nextVisible = Math.min(MAX_CANDLES, oldVisible + 2); // 축소

    const mouseX = e.nativeEvent.offsetX;
    const chartW = w - LEFT_AXIS_WIDTH;
    const centerRatio = mouseX / chartW;
    const centerIdx = startIndex + Math.floor(centerRatio * oldVisible);

    let nextStart = Math.round(centerIdx - centerRatio * nextVisible);
    nextStart = Math.max(0, Math.min(data.length - nextVisible, nextStart));

    setVisibleCandles(nextVisible);
    setStartIndex(nextStart);
  };

  // 마우스 드래그 pan
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
    nextStart = Math.max(0, Math.min(data.length - visibleCandles, nextStart));
    setStartIndex(nextStart);
  };
  const onMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = "";
  };

  // 보여줄 데이터 구간
  const slicedData = data.slice(startIndex, startIndex + visibleCandles);

  // 이동평균 구간 맞추기
  const ma20_full = getMovingAverage(indi_data, 20);
  const ma20 = ma20_full.slice(
    startIndex + ma20_full.length - data.length,
    startIndex + ma20_full.length - data.length + visibleCandles
  );
  const ma60_data = indi_data.slice(
    Math.max(0, startIndex + indi_data.length - data.length - 60)
  );
  const ma60_full = getMovingAverage(ma60_data, 60);
  const ma60 = ma60_full.slice(-visibleCandles);
  const ma120_full = getMovingAverage(indi_data, 120);
  const ma120 = ma120_full.slice(
    startIndex + ma120_full.length - data.length,
    startIndex + ma120_full.length - data.length + visibleCandles
  );

  // 스케일
  const maxPrice = Math.max(...slicedData.map((d) => d.high));
  const minPrice = Math.min(...slicedData.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * PADDING_RATIO;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;
  const chartHeight = h;

  // TradingView 스타일: SVG width 고정, candleSpacing만 조절
  const chartWidth = w - LEFT_AXIS_WIDTH;
  const candleSpacing =
    visibleCandles > 1 ? chartWidth / (visibleCandles - 1) : chartWidth;
  const candleWidth = Math.min(40, candleSpacing * 0.7, 24);

  const getY = (price: number) =>
    chartHeight - ((price - chartMin) / chartRange) * chartHeight;

  const getGridLines = () => {
    const lines = [];
    const stepCount = 8;
    const roughStep = chartRange / stepCount;
    const pow10 = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const niceStep =
      roughStep / pow10 < 2
        ? pow10
        : roughStep / pow10 < 5
        ? 5 * pow10
        : 10 * pow10;
    const niceMin = Math.floor(chartMin / niceStep) * niceStep;
    const niceMax = Math.ceil(chartMax / niceStep) * niceStep;

    for (let price = niceMin; price <= niceMax; price += niceStep) {
      const y = getY(price);
      if (y >= 0 && y <= chartHeight) {
        lines.push({ y, price });
      }
    }
    return lines;
  };

  function getLinePoints(
    maArr: (number | null)[],
    candleSpacing: number,
    getY: (v: number) => number
  ) {
    return maArr
      .map((val, i) =>
        val !== null
          ? `${i * candleSpacing},${getY(val) + BOTTOM_PADDING}`
          : null
      )
      .filter(Boolean)
      .join(" ");
  }

  const ma20Points = getLinePoints(ma20, candleSpacing, getY);
  const ma60Points = getLinePoints(ma60, candleSpacing, getY);
  const ma120Points = getLinePoints(ma120, candleSpacing, getY);

  return (
    <div className="flex flex-col" style={{ width: w }}>
      {/* ==== 컨트롤 ==== */}
      <div className="flex" style={{ width: w }}>
        {/* ==== 왼쪽 가격축 ==== */}
        <svg width={LEFT_AXIS_WIDTH} height={chartHeight + BOTTOM_PADDING * 2}>
          {getGridLines().map((line, i) => (
            <g key={i}>
              <text
                x={LEFT_AXIS_WIDTH - 5}
                y={line.y + BOTTOM_PADDING + 5}
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="end"
              >
                {line.price.toLocaleString()}
              </text>
            </g>
          ))}
        </svg>
        {/* ==== 차트 ==== */}
        <div
          className="overflow-x-hidden"
          style={{
            width: chartWidth,
            cursor: dragging.current ? "grabbing" : "grab",
            userSelect: "none",
          }}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          tabIndex={0}
        >
          <svg
            width={chartWidth}
            height={chartHeight + BOTTOM_PADDING * 2}
            style={{ userSelect: "none", background: "#1b1b1b" }}
          >
            {/* === 그리드 === */}
            {getGridLines().map((line, i) => (
              <line
                key={i}
                x1={0}
                y1={line.y + BOTTOM_PADDING}
                x2={chartWidth}
                y2={line.y + BOTTOM_PADDING}
                stroke="#374151"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
            ))}
            {/* === MA선 === */}
            <polyline
              fill="none"
              stroke="#14B8A6"
              strokeWidth="2"
              points={ma20Points}
              opacity={0.8}
            />
            <polyline
              fill="none"
              stroke="#F87800"
              strokeWidth="2"
              points={ma60Points}
              opacity={0.85}
            />
            <polyline
              fill="none"
              stroke="#7339FB"
              strokeWidth="2"
              points={ma120Points}
              opacity={0.7}
            />
            {/* === 캔들 === */}
            {slicedData.map((candle, i) => {
              const x = i * candleSpacing;
              const isRising = candle.close > candle.open;
              const bodyTop =
                getY(Math.max(candle.open, candle.close)) + BOTTOM_PADDING;
              const bodyBottom =
                getY(Math.min(candle.open, candle.close)) + BOTTOM_PADDING;
              const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
              const wickTop = getY(candle.high) + BOTTOM_PADDING;
              const wickBottom = getY(candle.low) + BOTTOM_PADDING;
              const label = getDateTickFormat(i, candle, visibleCandles);

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
                  />
                  {/* === x축 날짜 라벨 === */}
                  {label && (
                    <text
                      x={x}
                      y={chartHeight + BOTTOM_PADDING + 15}
                      fill="#9CA3AF"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
