"use client";
import React from "react";

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
};

export type ChartData = CandleData | DotData;

type MixedChartProps = {
  w: number;
  h: number;
  data: ChartData[];
};

export default function MixedChart({ w, h, data }: MixedChartProps) {
  const getAllValues = () => {
    const values: number[] = [];
    data.forEach((item) => {
      if (item.type === "candle") {
        values.push(item.high, item.low, item.open, item.close);
      } else {
        values.push(item.close);
      }
    });
    return values;
  };

  const allValues = getAllValues();
  const maxPrice = Math.max(...allValues);
  const minPrice = Math.min(...allValues);
  const padding = (maxPrice - minPrice) * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;

  const chartWidth = w;
  const chartHeight = h;

  const maxVisibleItems = 10;
  const shouldScroll = data.length > maxVisibleItems;

  const fixedItemWidth = 30;
  const fixedItemSpacing = 50;

  const actualChartWidth = shouldScroll
    ? data.length * fixedItemSpacing
    : chartWidth;

  const itemWidth = shouldScroll
    ? fixedItemWidth
    : Math.min(40, (chartWidth / data.length) * 0.5);

  const itemSpacing = shouldScroll
    ? fixedItemSpacing
    : chartWidth / Math.max(data.length, 1);

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

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // (이전 날짜 차이 기반 코드 제거)

  const gridLines = getGridLines();

  return (
    <div className="max-w-6xl mx-auto rounded-lg">
      {data.length > 0 && (
        <div className="mb-6 flex">
          {/* 왼쪽 가격 축 고정 */}
          <svg
            width={60}
            height={chartHeight + 80}
            className="shrink-0"
            style={{ backgroundColor: "transparent" }}
          >
            {gridLines.map((line, i) => (
              <text
                key={i}
                x={50}
                y={line.y + 45}
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="end"
              >
                {line.price.toLocaleString()}
              </text>
            ))}
          </svg>

          {/* 오른쪽 스크롤 차트 */}
          <div
            className={`${shouldScroll ? "overflow-x-auto" : ""}`}
            style={{
              width: shouldScroll ? chartWidth : "auto",
              maxWidth: shouldScroll ? chartWidth : "none",
            }}
          >
            <svg
              width={actualChartWidth + 60}
              height={chartHeight + 80}
              className="overflow-visible"
            >
              {/* 그리드 선 */}
              {gridLines.map((line, i) => (
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

              {/* 점 선 연결 (DotData) */}
              {(() => {
                const dotItems = data
                  .map((item, i) => ({ item, i }))
                  .filter(({ item }) => item.type === "dot");

                if (dotItems.length < 2) return null;

                const pathD = dotItems
                  .map(({ item, i }, idx) => {
                    const x = i * itemSpacing + itemSpacing / 2;
                    const y = getY((item as DotData).close) + 40;
                    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ");

                return (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                );
              })()}

              {/* 데이터 렌더링 */}
              {data.map((item, i) => {
                const x = i * itemSpacing + itemSpacing / 2;

                if (item.type === "candle") {
                  const isRising = item.close > item.open;
                  const bodyTop = getY(Math.max(item.open, item.close)) + 40;
                  const bodyBottom = getY(Math.min(item.open, item.close)) + 40;
                  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
                  const wickTop = getY(item.high) + 40;
                  const wickBottom = getY(item.low) + 40;

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
                        x={x - itemWidth / 2}
                        y={bodyTop}
                        width={itemWidth}
                        height={bodyHeight}
                        fill={isRising ? "#3B82F6" : "#EF4444"}
                        stroke={isRising ? "#3B82F6" : "#EF4444"}
                        strokeWidth="1"
                        rx={4}
                      />
                      <text
                        x={x}
                        y={chartHeight + 60}
                        fill="#9CA3AF"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {formatDateShort(item.date)}
                      </text>
                    </g>
                  );
                } else {
                  const y = getY(item.close) + 40;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={4} fill="#10B981" />
                      <text
                        x={x}
                        y={y - 10}
                        fill="#10B981"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {item.close.toLocaleString()}
                      </text>
                      <text
                        x={x}
                        y={chartHeight + 60}
                        fill="#9CA3AF"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {formatDateShort(item.date)}
                      </text>
                    </g>
                  );
                }
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
