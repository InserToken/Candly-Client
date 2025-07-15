"use client";
import React, { useState } from "react";

export default function CandleChartInvest() {
  const [data, setData] = useState([
    { date: "1/1", open: 59700, high: 59900, low: 59600, close: 60000 },
    { date: "1/2", open: 60000, high: 60300, low: 59800, close: 60200 },
    { date: "1/3", open: 60200, high: 60800, low: 59700, close: 59900 },
    { date: "1/4", open: 59900, high: 62000, low: 60500, close: 61500 },
    { date: "1/5", open: 61500, high: 62500, low: 62000, close: 62200 },
    { date: "1/6", open: 62200, high: 62400, low: 60800, close: 61200 },
    { date: "1/7", open: 61200, high: 62700, low: 61000, close: 62500 },
  ]);

  const [newCandle, setNewCandle] = useState({
    date: "",
    open: "",
    high: "",
    low: "",
    close: "",
  });

  const addCandle = () => {
    if (
      newCandle.date &&
      newCandle.open &&
      newCandle.high &&
      newCandle.low &&
      newCandle.close
    ) {
      const candle = {
        date: newCandle.date,
        open: parseFloat(newCandle.open),
        high: parseFloat(newCandle.high),
        low: parseFloat(newCandle.low),
        close: parseFloat(newCandle.close),
      };
      setData([...data, candle]);
      setNewCandle({ date: "", open: "", high: "", low: "", close: "" });
    }
  };

  const removeCandle = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  // 차트 계산
  const maxPrice = Math.max(...data.map((d) => d.high));
  const minPrice = Math.min(...data.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;

  const chartWidth = 800;
  const chartHeight = 400;
  const candleWidth = Math.min(40, (chartWidth / data.length) * 0.6);
  const candleSpacing = chartWidth / Math.max(data.length, 1);

  const getY = (price) => {
    return chartHeight - ((price - chartMin) / chartRange) * chartHeight;
  };

  const getGridLines = () => {
    const lines = [];
    const stepCount = 8;
    for (let i = 0; i <= stepCount; i++) {
      const price = chartMin + (chartRange * i) / stepCount;
      const y = getY(price);
      lines.push({ y, price: Math.round(price) });
    }
    return lines;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 rounded-lg">
      {/* 데이터 입력 섹션 */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">새 캔들 추가</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <input
            type="text"
            placeholder="날짜 (예: 1/8)"
            value={newCandle.date}
            onChange={(e) =>
              setNewCandle({ ...newCandle, date: e.target.value })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="number"
            placeholder="시가"
            value={newCandle.open}
            onChange={(e) =>
              setNewCandle({ ...newCandle, open: e.target.value })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="number"
            placeholder="고가"
            value={newCandle.high}
            onChange={(e) =>
              setNewCandle({ ...newCandle, high: e.target.value })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="number"
            placeholder="저가"
            value={newCandle.low}
            onChange={(e) =>
              setNewCandle({ ...newCandle, low: e.target.value })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="number"
            placeholder="종가"
            value={newCandle.close}
            onChange={(e) =>
              setNewCandle({ ...newCandle, close: e.target.value })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={addCandle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            캔들 추가
          </button>
        </div>
      </div>

      {/* 차트 */}
      {data.length > 0 && (
        <div className="mb-6">
          <div className="relative rounded-lg p-4">
            <svg
              width={chartWidth + 100}
              height={chartHeight + 80}
              className="overflow-visible"
            >
              {/* 격자선 */}
              {getGridLines().map((line, i) => (
                <g key={i}>
                  <line
                    x1={60}
                    y1={line.y + 40}
                    x2={chartWidth + 60}
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
                const bodyTop = getY(Math.max(candle.open, candle.close)) + 40;
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
      )}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          데이터를 입력하여 캔들차트를 생성하세요.
        </div>
      )}
    </div>
  );
}
