"use client";
import React, { useState } from "react";

type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type CandleChartProps = {
  w: number;
  h: number;
  data: Candle[];
};

export default function CandleChart({ w, h, data }: CandleChartProps) {
  // 차트 계산
  const maxPrice = Math.max(...data.map((d) => d.high));
  const minPrice = Math.min(...data.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;

  const chartWidth = w;
  const chartHeight = h;

  // 10개 이상일 때와 이하일 때 다른 로직 적용
  const maxVisibleCandles = 10;
  const shouldScroll = data.length > maxVisibleCandles;

  // 캔들 크기 고정 (스크롤 시에도 일정한 크기 유지)
  const fixedCandleWidth = 40;
  const fixedCandleSpacing = 60;

  // 실제 SVG 너비 계산
  const actualChartWidth = shouldScroll
    ? data.length * fixedCandleSpacing
    : chartWidth;

  const candleWidth = shouldScroll
    ? fixedCandleWidth
    : Math.min(40, (chartWidth / data.length) * 0.5);

  const candleSpacing = shouldScroll
    ? fixedCandleSpacing
    : chartWidth / Math.max(data.length, 1);

  const getY = (price) => {
    return chartHeight - ((price - chartMin) / chartRange) * chartHeight;
  };

  const getGridLines = () => {
    const lines = [];

    const stepCount = 8;
    const roughStep = chartRange / stepCount;

    // 반올림
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
      // y축이 차트 영역 내에 있는지 확인
      if (y >= 0 && y <= chartHeight) {
        lines.push({ y, price });
      }
    }

    return lines;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 rounded-lg">
      {/* 차트 */}
      {data.length > 0 && (
        <div className="mb-6">
          <div className="relative rounded-lg p-4">
            <div
              className={`${shouldScroll ? "overflow-x-auto" : ""}`}
              style={{
                width: shouldScroll ? chartWidth + 100 : "auto",
                maxWidth: shouldScroll ? chartWidth + 100 : "none",
              }}
            >
              <svg
                width={actualChartWidth + 100}
                height={chartHeight + 80}
                className="overflow-visible"
                style={{
                  minWidth: shouldScroll ? actualChartWidth + 100 : "auto",
                }}
              >
                {/* 격자선 */}
                {getGridLines().map((line, i) => (
                  <g key={i}>
                    <line
                      x1={60}
                      y1={line.y + 40}
                      x2={actualChartWidth + 60}
                      y2={line.y + 40}
                      stroke="#374151"
                      strokeDasharray="3,3"
                      strokeWidth="1"
                    />
                    <text
                      x={50}
                      y={line.y + 45}
                      fill="#9CA3AF"
                      fontSize="12"
                      textAnchor="end"
                    >
                      {line.price.toLocaleString()}
                    </text>
                  </g>
                ))}

                {/* 캔들스틱 */}
                {data.map((candle, i) => {
                  const x = 60 + i * candleSpacing + candleSpacing / 2;
                  const isRising = candle.close > candle.open;
                  const bodyTop =
                    getY(Math.max(candle.open, candle.close)) + 40;
                  const bodyBottom =
                    getY(Math.min(candle.open, candle.close)) + 40;
                  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
                  const wickTop = getY(candle.high) + 40;
                  const wickBottom = getY(candle.low) + 40;

                  return (
                    <g key={i}>
                      {/* 상하 심지 */}
                      <line
                        x1={x}
                        y1={wickTop}
                        x2={x}
                        y2={wickBottom}
                        stroke={isRising ? "#3B82F6" : "#EF4444"}
                        strokeWidth="2"
                      />

                      {/* 캔들 몸통 */}
                      <rect
                        x={x - candleWidth / 2}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={isRising ? "#3B82F6" : "#EF4444"}
                        stroke={isRising ? "#3B82F6" : "#EF4444"}
                        strokeWidth="1"
                        rx={10}
                      />

                      {/* 날짜 라벨 */}
                      <text
                        x={x}
                        y={chartHeight + 60}
                        fill="#9CA3AF"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {candle.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
