"use client";
import React, { useRef, useState } from "react";
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

  isAnswered?: boolean;
  showLine: ShowLine;
};

const LEFT_AXIS_WIDTH = 60;
const CHART_HEIGHT = 220;
const VOLUME_HEIGHT = 100;
const RSI_HEIGHT = 80;
const DATE_AXIS_HEIGHT = 24;

const TOTAL_HEIGHT =
  CHART_HEIGHT + VOLUME_HEIGHT + RSI_HEIGHT + DATE_AXIS_HEIGHT;

const MIN_CANDLES = 10;
const SHOW_LEN = 200;
const SKIP_LAST = 20;
const HIDE_COUNT = 21; // 마지막 21개 가림

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
  data,
  indi_data,
  news,
  isAnswered = false,
  showLine,
}: CandleChartProps) {
  // 예외값 보정
  data = data.map((d) =>
    d.open === 0 && d.high === 0 && d.low === 0 && d.close > 0
      ? { ...d, open: d.close, high: d.close, low: d.close }
      : d
  );
  // ==== 데이터 슬라이싱 ====
  const startIdx = Math.max(0, data.length - SHOW_LEN - SKIP_LAST);
  const endIdx = data.length;
  const chartData = data.slice(startIdx, endIdx);

  const ma5_full = getMovingAverage(indi_data, 5).slice(startIdx, endIdx);
  const ma20_full = getMovingAverage(indi_data, 20).slice(startIdx, endIdx);
  const ma60_full = getMovingAverage(indi_data, 60).slice(startIdx, endIdx);
  const ma120_full = getMovingAverage(indi_data, 120).slice(startIdx, endIdx);
  const bbands_full = getBollingerBands(data, 20, 2).slice(startIdx, endIdx);
  const rsi_full = getRSI(data, 20).slice(startIdx, endIdx);

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

    // const offsetX = e.clientX - rect.left;
    const offsetX = e.clientX - rect.left;

    const idx = getNearestCandleIdx(offsetX);

    // === overlay 영역이면 tooltip 안뜸! ===
    if (idx < 0 || idx >= slicedData.length || isOverlayIdx(idx)) {
      setTooltip(null);
      return;
    }

    setTooltip({
      show: true,
      x: offsetX + LEFT_AXIS_WIDTH,
      y: e.clientY - rect.top,
      idx,
      data: slicedData[idx],
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

    // === overlay 영역이면 tooltip 안뜸! ===
    if (idx < 0 || idx >= slicedData.length || isOverlayIdx(idx)) {
      setTooltip(null);
      return;
    }
    setTooltip({
      show: true,
      x: offsetX + LEFT_AXIS_WIDTH,
      y: e.clientY - rect.top,
      idx,
      data: slicedData[idx],
      section: "candle",
    });
  };
  const handleVolumeChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleVolumeMouseMove(e);
    onMouseMove(e);
  };

  const handleVolumeMouseLeave = () => setTooltip(null);

  const handleRSIMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const idx = getNearestCandleIdx(offsetX);

    // === overlay 영역이면 tooltip 안뜸! ===
    if (idx < 0 || idx >= slicedData.length || isOverlayIdx(idx)) {
      setTooltip(null);
      return;
    }
    setTooltip({
      show: true,
      x: offsetX + LEFT_AXIS_WIDTH,
      y: e.clientY - rect.top,
      idx,
      data: slicedData[idx],
      section: "candle",
    });
  };
  const handleRSIChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleRSIMouseMove(e);
    onMouseMove(e);
  };

  const handleRSIMouseLeave = () => setTooltip(null);

  // ==== 스케일 계산 ====
  const chartWidth = w - LEFT_AXIS_WIDTH;
  const maxPrice = Math.max(...slicedData.map((d) => d.high));
  const minPrice = Math.min(...slicedData.map((d) => d.low));
  const midPrice = Math.round((maxPrice + minPrice) / 2);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;
  const getY = (price: number) =>
    ((chartMax - price) / chartRange) * CHART_HEIGHT;

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

  // --- [QUIZ Overlay: 보이는 영역만큼만 가림] ---
  const overlayStartGlobalIdx = startIdx + chartData.length - HIDE_COUNT;
  const chartLastGlobalIdx = startIdx + chartData.length - 1;

  const slicedStartGlobalIdx = startIdx + startIndex;
  const slicedEndGlobalIdx = slicedStartGlobalIdx + slicedData.length - 1;

  const visibleOverlayStart = Math.max(
    overlayStartGlobalIdx,
    slicedStartGlobalIdx
  );
  const visibleOverlayEnd = Math.min(slicedEndGlobalIdx, chartLastGlobalIdx);

  const numVisibleOverlay = Math.max(
    0,
    visibleOverlayEnd - visibleOverlayStart + 1
  );
  const overlayLocalStart =
    numVisibleOverlay > 0 ? visibleOverlayStart - slicedStartGlobalIdx : 0;
  const overlayLeft = LEFT_AXIS_WIDTH + overlayLocalStart * candleSpacing;
  const overlayWidth = numVisibleOverlay * candleSpacing;
  const overlayLocalEnd = overlayLocalStart + numVisibleOverlay - 1;

  function isOverlayIdx(idx: number) {
    return (
      numVisibleOverlay > 0 && idx > overlayLocalStart && idx <= overlayLocalEnd
    );
  }

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

  // --- 렌더 ---
  return (
    <div
      className="flex flex-col"
      style={{
        width: "100%",
        maxWidth: w,
        position: "relative",
        overflow: "hidden",
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
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
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
          {/* 캔들 */}
          {slicedData.map((candle, i) => {
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
        </svg>
        {/* === 캔들 영역 Overlay === */}
        {numVisibleOverlay > 0 && !isAnswered && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: CHART_HEIGHT,
              background: "rgba(0,0,0,1)",
              pointerEvents: "none",
              zIndex: 5,
              borderLeft: "2px dashed #edcb37",
              display: "block",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {numVisibleOverlay > 2 && (
              <div
                style={{
                  color: "#edcb37",
                  fontWeight: 600,
                  fontSize: 18,
                  textAlign: "center",
                  marginTop: CHART_HEIGHT / 2 - 20,
                  opacity: 0.9,
                  textShadow: "0 1px 2px #000",
                  userSelect: "none",
                }}
              >
                ?
              </div>
            )}
          </div>
        )}
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
          width={chartWidth}
          height={VOLUME_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${VOLUME_HEIGHT}`}
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
        {/* === 볼륨 영역 Overlay === */}
        {numVisibleOverlay > 0 && !isAnswered && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: VOLUME_HEIGHT,
              background: "rgba(0, 0, 0, 1)",
              pointerEvents: "none",
              zIndex: 5,
              display: "block",
            }}
          />
        )}
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
          width={chartWidth}
          height={RSI_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${RSI_HEIGHT}`}
          style={{
            width: "100%",
            background: "#181818",
            outline: "none",
            display: "block",
            flex: 1,
          }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={handleRSIChartMouseMove}
          onMouseLeave={handleRSIMouseLeave}
          tabIndex={0}
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
          {/* RSI 라인 */}
          <polyline
            fill="none"
            stroke="#e75480"
            strokeWidth="2"
            points={rsi_visible
              .map((val, i) =>
                val !== null && !isNaN(val)
                  ? `${i * candleSpacing},${(1 - val / 100) * RSI_HEIGHT}`
                  : null
              )
              .filter(Boolean)
              .join(" ")}
            opacity={0.96}
          />
        </svg>
        {/* === RSI 영역 Overlay === */}
        {numVisibleOverlay > 0 && !isAnswered && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: RSI_HEIGHT,
              background: "rgba(0,0,0,1)",
              pointerEvents: "none",
              zIndex: 5,
              display: "block",
            }}
          />
        )}
      </div>

      {/* 4. 날짜 라벨 (아래) */}
      <div className="flex" style={{ position: "relative", width: "100%" }}>
        <svg width={LEFT_AXIS_WIDTH} height={DATE_AXIS_HEIGHT} />
        <svg
          width={chartWidth}
          height={DATE_AXIS_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${DATE_AXIS_HEIGHT}`}
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
        {/* === 날짜 Overlay === */}
        {numVisibleOverlay > 0 && !isAnswered && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: DATE_AXIS_HEIGHT,
              background: "rgba(0, 0, 0, 1)",
              pointerEvents: "none",
              zIndex: 5,
              display: "block",
            }}
          />
        )}
      </div>
      {/* 툴팁 */}

      {tooltip?.show && tooltip?.data && tooltip?.idx !== undefined && (
        <div
          style={{
            position: "fixed",
            // position: "absolute",

            // left: tooltip.x + 18,
            left: tooltip.x + 88,

            // top:
            //   tooltip.section === "volume"
            //     ? CHART_HEIGHT + VOLUME_HEIGHT / 2 - 60
            //     : 40,
            top:
              tooltip.section === "volume"
                ? CHART_HEIGHT + VOLUME_HEIGHT / 2 - 60
                : 120,
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
              {tooltipNews.map((item) => (
                <div key={item._id} style={{ marginBottom: 7 }}>
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
