// "use client";
// import React, { useRef, useState } from "react";
// import { getMovingAverage, getRSI, getBollingerBands } from "@/utils/indicator";

// export type Candle = {
//   date: string; // YYYY-MM-DD
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// };

// type CandleChartProps = {
//   w: number;
//   h: number;
//   data: Candle[];
//   indi_data: Candle[];
// };

// const PADDING_RATIO = 0.1;
// const LEFT_AXIS_WIDTH = 60;
// const BOTTOM_PADDING = 40;
// const MIN_CANDLES = 10;

// const SHOW_LEN = 200;
// const SKIP_LAST = 20;

// function getDateTickFormat(
//   index: number,
//   candle: Candle,
//   visibleCandles: number
// ) {
//   if (visibleCandles > 60) {
//     if (candle.date.slice(8, 10) === "01" || index === 0)
//       return candle.date.slice(2, 7).replace("-0", "-");
//     return "";
//   }
//   if (visibleCandles > 20) {
//     if (candle.date.slice(8, 10) === "01" || index === 0)
//       return candle.date.slice(2, 7).replace("-0", "-");
//     if (index % 5 === 0) return candle.date.slice(5);
//     return "";
//   }
//   if (candle.date.slice(8, 10) === "01" || index === 0)
//     return candle.date.slice(2, 7).replace("-0", "-");
//   return candle.date.slice(8);
// }

// export default function CandleChart({
//   w,
//   h,
//   data,
//   indi_data,
// }: CandleChartProps) {
//   // 1. 슬라이스 기준: chartData, 보조지표 동기화
//   const startIdx = Math.max(0, data.length - SHOW_LEN - SKIP_LAST);
//   const endIdx = Math.max(0, data.length - SKIP_LAST);
//   const chartData = data.slice(startIdx, endIdx);

//   const ma5_full = getMovingAverage(indi_data, 5).slice(startIdx, endIdx);
//   const ma20_full = getMovingAverage(indi_data, 20).slice(startIdx, endIdx);
//   const ma60_full = getMovingAverage(indi_data, 60).slice(startIdx, endIdx);
//   const ma120_full = getMovingAverage(indi_data, 120).slice(startIdx, endIdx);

//   // RSI, BB 등도 chartData와 맞춤
//   const rsi_full = getRSI(indi_data, 14).slice(startIdx, endIdx);
//   const bbands_full = getBollingerBands(data, 20, 2).slice(startIdx, endIdx);

//   const MAX_CANDLES = chartData.length;
//   const [visibleCandles, setVisibleCandles] = useState(
//     Math.min(40, MAX_CANDLES)
//   );
//   const [startIndex, setStartIndex] = useState(
//     Math.max(0, MAX_CANDLES - visibleCandles)
//   );
//   const dragging = useRef(false);
//   const dragStartX = useRef(0);
//   const dragStartIndex = useRef(0);

//   // === 팬/줌 구간 슬라이스 ===
//   const slicedData = chartData.slice(startIndex, startIndex + visibleCandles);
//   const ma5_visible = ma5_full.slice(startIndex, startIndex + visibleCandles);
//   const ma20_visible = ma20_full.slice(startIndex, startIndex + visibleCandles);
//   const ma60_visible = ma60_full.slice(startIndex, startIndex + visibleCandles);
//   const ma120_visible = ma120_full.slice(
//     startIndex,
//     startIndex + visibleCandles
//   );
//   const bb_visible = bbands_full.slice(startIndex, startIndex + visibleCandles);

//   // 디버깅
//   // console.log(
//   //   "BB 값:",
//   //   slicedData.map((d, i) => ({
//   //     date: d.date,
//   //     BB: bb_visible[i],
//   //   }))
//   // );

//   // === 휠 줌 ===
//   const handleWheel = (e: React.WheelEvent) => {
//     const oldVisible = visibleCandles;
//     let nextVisible = oldVisible;
//     if (e.deltaY < 0) nextVisible = Math.max(MIN_CANDLES, oldVisible - 2);
//     else nextVisible = Math.min(MAX_CANDLES, oldVisible + 2);

//     const mouseX = e.nativeEvent.offsetX;
//     const chartW = w - LEFT_AXIS_WIDTH;
//     const centerRatio = mouseX / chartW;
//     const centerIdx = startIndex + Math.floor(centerRatio * oldVisible);

//     let nextStart = Math.round(centerIdx - centerRatio * nextVisible);
//     nextStart = Math.max(0, Math.min(MAX_CANDLES - nextVisible, nextStart));

//     setVisibleCandles(nextVisible);
//     setStartIndex(nextStart);
//   };

//   // === 드래그 pan ===
//   const onMouseDown = (e: React.MouseEvent) => {
//     dragging.current = true;
//     dragStartX.current = e.clientX;
//     dragStartIndex.current = startIndex;
//     document.body.style.cursor = "grabbing";
//   };
//   const onMouseMove = (e: React.MouseEvent) => {
//     if (!dragging.current) return;
//     const dx = e.clientX - dragStartX.current;
//     const chartW = w - LEFT_AXIS_WIDTH;
//     const moveCandles = Math.round((-dx / chartW) * visibleCandles);
//     let nextStart = dragStartIndex.current + moveCandles;
//     nextStart = Math.max(0, Math.min(MAX_CANDLES - visibleCandles, nextStart));
//     setStartIndex(nextStart);
//   };
//   const onMouseUp = () => {
//     dragging.current = false;
//     document.body.style.cursor = "";
//   };

//   // === 스케일 계산 ===
//   const maxPrice = Math.max(...slicedData.map((d) => d.high));
//   const minPrice = Math.min(...slicedData.map((d) => d.low));
//   const priceRange = maxPrice - minPrice;
//   const padding = priceRange * PADDING_RATIO;
//   const chartMax = maxPrice + padding;
//   const chartMin = minPrice - padding;
//   const chartRange = chartMax - chartMin;
//   const chartHeight = h;
//   const chartWidth = w - LEFT_AXIS_WIDTH;
//   const candleSpacing =
//     visibleCandles > 1 ? chartWidth / (visibleCandles - 1) : chartWidth;
//   const candleWidth = Math.min(40, candleSpacing * 0.7, 24);

//   const getY = (price: number) =>
//     chartHeight - ((price - chartMin) / chartRange) * chartHeight;

//   function getLinePoints(
//     arr: (number | null)[],
//     candleSpacing: number,
//     getY: (v: number) => number
//   ) {
//     return arr
//       .map((val, i) =>
//         val !== null
//           ? `${i * candleSpacing},${getY(val) + BOTTOM_PADDING}`
//           : null
//       )
//       .filter(Boolean)
//       .join(" ");
//   }

//   const getGridLines = () => {
//     const lines = [];
//     const stepCount = 8;
//     const roughStep = chartRange / stepCount;
//     const pow10 = Math.pow(10, Math.floor(Math.log10(roughStep)));
//     const niceStep =
//       roughStep / pow10 < 2
//         ? pow10
//         : roughStep / pow10 < 5
//         ? 5 * pow10
//         : 10 * pow10;
//     const niceMin = Math.floor(chartMin / niceStep) * niceStep;
//     const niceMax = Math.ceil(chartMax / niceStep) * niceStep;

//     for (let price = niceMin; price <= niceMax; price += niceStep) {
//       const y = getY(price);
//       if (y >= 0 && y <= chartHeight) {
//         lines.push({ y, price });
//       }
//     }
//     return lines;
//   };

//   const ma5Points = getLinePoints(ma5_visible, candleSpacing, getY);
//   const ma20Points = getLinePoints(ma20_visible, candleSpacing, getY);
//   const ma60Points = getLinePoints(ma60_visible, candleSpacing, getY);
//   const ma120Points = getLinePoints(ma120_visible, candleSpacing, getY);

//   const bb_upper_points = getLinePoints(
//     bb_visible.map((b) => b?.upper),
//     candleSpacing,
//     getY
//   );
//   const bb_middle_points = getLinePoints(
//     bb_visible.map((b) => b?.middle),
//     candleSpacing,
//     getY
//   );
//   const bb_lower_points = getLinePoints(
//     bb_visible.map((b) => b?.lower),
//     candleSpacing,
//     getY
//   );

//   return (
//     <div className="flex flex-col" style={{ width: w }}>
//       <div className="flex" style={{ width: w }}>
//         <svg width={LEFT_AXIS_WIDTH} height={chartHeight + BOTTOM_PADDING * 2}>
//           {getGridLines().map((line, i) => (
//             <g key={i}>
//               <text
//                 x={LEFT_AXIS_WIDTH - 5}
//                 y={line.y + BOTTOM_PADDING + 5}
//                 fill="#9CA3AF"
//                 fontSize="12"
//                 textAnchor="end"
//               >
//                 {line.price.toLocaleString()}
//               </text>
//             </g>
//           ))}
//         </svg>
//         <div
//           className="overflow-x-hidden"
//           style={{
//             width: chartWidth,
//             cursor: dragging.current ? "grabbing" : "grab",
//             userSelect: "none",
//           }}
//           onWheel={handleWheel}
//           onMouseDown={onMouseDown}
//           onMouseMove={onMouseMove}
//           onMouseUp={onMouseUp}
//           onMouseLeave={onMouseUp}
//           tabIndex={0}
//         >
//           <svg
//             width={chartWidth}
//             height={chartHeight + BOTTOM_PADDING * 2}
//             style={{ userSelect: "none", background: "#1b1b1b" }}
//           >
//             {getGridLines().map((line, i) => (
//               <line
//                 key={i}
//                 x1={0}
//                 y1={line.y + BOTTOM_PADDING}
//                 x2={chartWidth}
//                 y2={line.y + BOTTOM_PADDING}
//                 stroke="#374151"
//                 strokeDasharray="3,3"
//                 strokeWidth="1"
//               />
//             ))}
//             {/* 이동평균선 */}
//             <polyline
//               fill="none"
//               stroke="#00D5C0"
//               strokeWidth="2"
//               points={ma5Points}
//               opacity={0.8}
//             />
//             <polyline
//               fill="none"
//               stroke="#E8395F"
//               strokeWidth="2"
//               points={ma20Points}
//               opacity={0.8}
//             />
//             <polyline
//               fill="none"
//               stroke="#F87800"
//               strokeWidth="2"
//               points={ma60Points}
//               opacity={0.85}
//             />
//             <polyline
//               fill="none"
//               stroke="#7339FB"
//               strokeWidth="2"
//               points={ma120Points}
//               opacity={0.7}
//             />
//             {/* 불린저 밴드 */}
//             <polyline
//               fill="none"
//               stroke="#EDCB37"
//               strokeWidth="2"
//               points={bb_middle_points}
//               opacity={0.8}
//             />
//             <polyline
//               fill="none"
//               stroke="#EDCB37"
//               strokeWidth="1.5"
//               points={bb_upper_points}
//               opacity={0.7}
//             />
//             <polyline
//               fill="none"
//               stroke="#EDCB37"
//               strokeWidth="1.5"
//               points={bb_lower_points}
//               opacity={0.7}
//             />
//             {/* 캔들 */}
//             {slicedData.map((candle, i) => {
//               const x = i * candleSpacing;
//               const isRising = candle.close > candle.open;
//               const bodyTop =
//                 getY(Math.max(candle.open, candle.close)) + BOTTOM_PADDING;
//               const bodyBottom =
//                 getY(Math.min(candle.open, candle.close)) + BOTTOM_PADDING;
//               const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
//               const wickTop = getY(candle.high) + BOTTOM_PADDING;
//               const wickBottom = getY(candle.low) + BOTTOM_PADDING;
//               const label = getDateTickFormat(i, candle, visibleCandles);

//               return (
//                 <g key={i}>
//                   <line
//                     x1={x}
//                     y1={wickTop}
//                     x2={x}
//                     y2={wickBottom}
//                     stroke={isRising ? "#3B82F6" : "#EF4444"}
//                     strokeWidth="2"
//                   />
//                   <rect
//                     x={x - candleWidth / 2}
//                     y={bodyTop}
//                     width={candleWidth}
//                     height={bodyHeight}
//                     fill={isRising ? "#3B82F6" : "#EF4444"}
//                     rx={4}
//                   />
//                   {label && (
//                     <text
//                       x={x}
//                       y={chartHeight + BOTTOM_PADDING + 15}
//                       fill="#9CA3AF"
//                       fontSize="12"
//                       textAnchor="middle"
//                     >
//                       {label}
//                     </text>
//                   )}
//                 </g>
//               );
//             })}
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useRef, useState } from "react";
import { getMovingAverage, getRSI, getBollingerBands } from "@/utils/indicator";

export type Candle = {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type CandleChartProps = {
  w: number;
  h?: number; // 선택적(디폴트 사용)
  data: Candle[];
  indi_data: Candle[];
};

const LEFT_AXIS_WIDTH = 60;
const CHART_HEIGHT = 220; // 캔들차트 영역
const VOLUME_HEIGHT = 60; // 볼륨(거래량) 영역
const DATE_AXIS_HEIGHT = 24; // x축 라벨 영역
const TOTAL_HEIGHT = CHART_HEIGHT + VOLUME_HEIGHT + DATE_AXIS_HEIGHT;

const MIN_CANDLES = 10;
const SHOW_LEN = 200;
const SKIP_LAST = 20;

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

export default function CandleChart({
  w,
  h = TOTAL_HEIGHT,
  data,
  indi_data,
}: CandleChartProps) {
  // ==== 데이터 슬라이싱 ====
  const startIdx = Math.max(0, data.length - SHOW_LEN - SKIP_LAST);
  const endIdx = Math.max(0, data.length - SKIP_LAST);
  const chartData = data.slice(startIdx, endIdx);

  const ma5_full = getMovingAverage(indi_data, 5).slice(startIdx, endIdx);
  const ma20_full = getMovingAverage(indi_data, 20).slice(startIdx, endIdx);
  const ma60_full = getMovingAverage(indi_data, 60).slice(startIdx, endIdx);
  const ma120_full = getMovingAverage(indi_data, 120).slice(startIdx, endIdx);
  const bbands_full = getBollingerBands(data, 20, 2).slice(startIdx, endIdx);

  const MAX_CANDLES = chartData.length;
  const [visibleCandles, setVisibleCandles] = useState(
    Math.min(40, MAX_CANDLES)
  );
  const [startIndex, setStartIndex] = useState(
    Math.max(0, MAX_CANDLES - visibleCandles)
  );
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);

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

  // ===== 팬/줌 핸들러 =====
  const handleWheel = (e: React.WheelEvent) => {
    const oldVisible = visibleCandles;
    let nextVisible = oldVisible;
    if (e.deltaY < 0) nextVisible = Math.max(MIN_CANDLES, oldVisible - 2);
    else nextVisible = Math.min(MAX_CANDLES, oldVisible + 2);

    const mouseX = e.nativeEvent.offsetX;
    const chartW = w - LEFT_AXIS_WIDTH;
    const centerRatio = mouseX / chartW;
    const centerIdx = startIndex + Math.floor(centerRatio * oldVisible);

    let nextStart = Math.round(centerIdx - centerRatio * nextVisible);
    nextStart = Math.max(0, Math.min(MAX_CANDLES - nextVisible, nextStart));

    setVisibleCandles(nextVisible);
    setStartIndex(nextStart);
  };

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

  // ==== 스케일 계산 ====
  const chartHeight = CHART_HEIGHT;
  const volumeHeight = VOLUME_HEIGHT;
  const dateAxisHeight = DATE_AXIS_HEIGHT;
  const chartWidth = w - LEFT_AXIS_WIDTH;

  // 캔들 가격 스케일 (0 ~ chartHeight)
  const maxPrice = Math.max(...slicedData.map((d) => d.high));
  const minPrice = Math.min(...slicedData.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;
  const getY = (price: number) =>
    ((chartMax - price) / chartRange) * chartHeight;

  // 볼륨 y 스케일 (0 ~ volumeHeight)
  const volumes = slicedData.map((d) => d.volume ?? 0);
  const maxVolume = Math.max(...volumes, 1);
  const getVolumeY = (volume: number) =>
    volumeHeight - (volume / maxVolume) * volumeHeight;

  // 캔들/볼륨 x좌표
  const candleSpacing =
    visibleCandles > 1 ? chartWidth / (visibleCandles - 1) : chartWidth;
  const candleWidth = Math.min(40, candleSpacing * 0.7, 24);

  // 그리드라인
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

  // 선 그리기 (ex. MA)
  function getLinePoints(
    arr: (number | null)[],
    candleSpacing: number,
    getY: (v: number) => number
  ) {
    return arr
      .map((val, i) =>
        val !== null ? `${i * candleSpacing},${getY(val)}` : null
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

  return (
    <div className="flex flex-col" style={{ width: w }}>
      <div className="flex" style={{ width: w }}>
        {/* Y축 (가격/볼륨) */}
        <svg width={LEFT_AXIS_WIDTH} height={h}>
          {/* 캔들 y축 */}
          {getGridLines().map((line, i) => (
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
          {/* 볼륨 y축 */}
          <text
            x={LEFT_AXIS_WIDTH - 5}
            y={chartHeight + getVolumeY(maxVolume) + 10}
            fill="#b9b9b9"
            fontSize="11"
            textAnchor="end"
          >
            {maxVolume.toLocaleString()}
          </text>
        </svg>

        <svg
          width={chartWidth}
          height={h}
          style={{ userSelect: "none", background: "#1b1b1b" }}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          tabIndex={0}
        >
          {/* 1. 캔들/지표/그리드 (상단) */}
          <g>
            {getGridLines().map((line, i) => (
              <line
                key={i}
                x1={0}
                y1={line.y}
                x2={chartWidth}
                y2={line.y}
                stroke="#374151"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
            ))}
            {/* 이동평균선/BB */}
            <polyline
              fill="none"
              stroke="#00D5C0"
              strokeWidth="2"
              points={ma5Points}
              opacity={0.8}
            />
            <polyline
              fill="none"
              stroke="#E8395F"
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
            <polyline
              fill="none"
              stroke="#EDCB37"
              strokeWidth="2"
              points={bb_middle_points}
              opacity={0.8}
            />
            <polyline
              fill="none"
              stroke="#EDCB37"
              strokeWidth="1.5"
              points={bb_upper_points}
              opacity={0.7}
            />
            <polyline
              fill="none"
              stroke="#EDCB37"
              strokeWidth="1.5"
              points={bb_lower_points}
              opacity={0.7}
            />
            {/* 캔들 */}
            {slicedData.map((candle, i) => {
              const x = i * candleSpacing;
              const isRising = candle.close > candle.open;
              const bodyTop = getY(Math.max(candle.open, candle.close));
              const bodyBottom = getY(Math.min(candle.open, candle.close));
              const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
              const wickTop = getY(candle.high);
              const wickBottom = getY(candle.low);
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
                </g>
              );
            })}
          </g>

          {/* 2. 볼륨 (중간) */}
          <g transform={`translate(0,${chartHeight})`}>
            {/* 볼륨 그리드라인 (맨 위) */}
            <line
              x1={0}
              y1={0}
              x2={chartWidth}
              y2={0}
              stroke="#444"
              strokeDasharray="2,2"
            />
            {/* 볼륨 막대 */}
            {slicedData.map((candle, i) => {
              const x = i * candleSpacing;
              const vol = candle.volume ?? 0;
              const isRising = candle.close > candle.open;
              const barY = getVolumeY(vol);
              const barHeight = volumeHeight - barY;
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
                />
              );
            })}
          </g>

          {/* 3. 날짜 라벨 (하단) */}
          <g transform={`translate(0,${chartHeight + volumeHeight})`}>
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
          </g>
        </svg>
      </div>
    </div>
  );
}
