"use client";
import React from "react";

// 타입 정의
export type Candle = {
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
  const maxPrice = Math.max(...data.map((d) => d.high));
  const minPrice = Math.min(...data.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;

  const chartHeight = h;
  const maxVisibleCandles = 10;
  const shouldScroll = data.length > maxVisibleCandles;

  const fixedCandleWidth = 30;
  const fixedCandleSpacing = 50;

  const actualChartWidth = shouldScroll
    ? data.length * fixedCandleSpacing
    : w - 60;

  const candleWidth = shouldScroll
    ? fixedCandleWidth
    : Math.min(40, ((w - 60) / data.length) * 0.5);

  const candleSpacing = shouldScroll
    ? fixedCandleSpacing
    : (w - 60) / Math.max(data.length, 1);

  const getY = (price: number) => {
    return chartHeight - ((price - chartMin) / chartRange) * chartHeight;
  };

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

  return (
    <div className="flex" style={{ width: w }}>
      {/* 왼쪽 가격 축 */}
      <svg width={60} height={chartHeight + 80}>
        {getGridLines().map((line, i) => (
          <g key={i}>
            <text
              x={55}
              y={line.y + 45}
              fill="#9CA3AF"
              fontSize="12"
              textAnchor="end"
            >
              {line.price.toLocaleString()}
            </text>
          </g>
        ))}
      </svg>

      {/* 오른쪽 차트 영역 */}
      <div className="overflow-x-auto" style={{ width: w - 60 }}>
        <div style={{ width: actualChartWidth }}>
          <svg width={actualChartWidth} height={chartHeight + 80}>
            {/* 격자선 */}
            {getGridLines().map((line, i) => (
              <line
                key={i}
                x1={0}
                y1={line.y + 40}
                x2={actualChartWidth}
                y2={line.y + 40}
                stroke="#374151"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
            ))}

            {/* 캔들스틱 */}
            {data.map((candle, i) => {
              const x = i * candleSpacing + candleSpacing / 2;
              const isRising = candle.close > candle.open;
              const bodyTop = getY(Math.max(candle.open, candle.close)) + 40;
              const bodyBottom = getY(Math.min(candle.open, candle.close)) + 40;
              const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
              const wickTop = getY(candle.high) + 40;
              const wickBottom = getY(candle.low) + 40;

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
                  <text
                    x={x}
                    y={chartHeight + 60}
                    fill="#9CA3AF"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {candle.date.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
