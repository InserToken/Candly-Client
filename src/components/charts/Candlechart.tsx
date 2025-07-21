"use client";
import React, { useRef, useState } from "react";
import dayjs from "dayjs";
import { getMovingAverage, getBollingerBands } from "@/utils/indicator";

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
};

const LEFT_AXIS_WIDTH = 60;
const CHART_HEIGHT = 220;
const VOLUME_HEIGHT = 100;
const DATE_AXIS_HEIGHT = 24;

const MIN_CANDLES = 10;
const SHOW_LEN = 200;
const SKIP_LAST = 20;
const HIDE_COUNT = 10; // 마지막 10개를 가림

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
  news,
}: CandleChartProps) {
export default function CandleChart({ w, data, indi_data }: CandleChartProps) {
  // 데이터 슬라이싱
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

  // 팬/줌 핸들러
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

  const getNearestCandleIdx = (offsetX: number) => {
    return Math.round(offsetX / candleSpacing);
  };

  const handleCandleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const idx = getNearestCandleIdx(offsetX);
    if (idx < 0 || idx >= slicedData.length) {
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
    if (idx < 0 || idx >= slicedData.length) {
      setTooltip(null);
      return;
    }
    setTooltip({
      show: true,
      x: offsetX + LEFT_AXIS_WIDTH,
      y: e.clientY + CHART_HEIGHT + 8,
      idx,
      data: slicedData[idx],
      section: "volume",
    });
  };
  const handleVolumeChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleVolumeMouseMove(e);
    onMouseMove(e);
  };

  const handleVolumeMouseLeave = () => setTooltip(null);

  // ==== 스케일 계산 ====
  const chartWidth = w - LEFT_AXIS_WIDTH;
  const maxPrice = Math.max(...slicedData.map((d) => d.high));
  const minPrice = Math.min(...slicedData.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1;
  const chartMax = maxPrice + padding;
  const chartMin = minPrice - padding;
  const chartRange = chartMax - chartMin;
  const getY = (price: number) =>
    ((chartMax - price) / chartRange) * CHART_HEIGHT;

  const volumes = slicedData.map((d) => d.volume ?? 0);
  const maxVolume = Math.max(...volumes, 1);
  const getVolumeY = (volume: number) =>
    VOLUME_HEIGHT - (volume / maxVolume) * VOLUME_HEIGHT;

  const candleSpacing =
    visibleCandles > 1 ? chartWidth / (visibleCandles - 1) : chartWidth;
  const candleWidth = Math.min(40, candleSpacing * 0.7, 24);

  // 그리드
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
      if (y >= 0 && y <= CHART_HEIGHT) {
        lines.push({ y, price });
      }
    }
    return lines;
  };

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

  // --- [QUIZ Overlay: 보이는 영역만큼만 가림] ---
  // 전체 chartData 기준 오버레이 적용 구간(global index)
  const overlayStartGlobalIdx = startIdx + chartData.length - HIDE_COUNT;
  const chartLastGlobalIdx = startIdx + chartData.length - 1;

  // slicedData의 global index 구간
  const slicedStartGlobalIdx = startIdx + startIndex;
  const slicedEndGlobalIdx = slicedStartGlobalIdx + slicedData.length - 1;

  // 실제 오버레이가 붙을 slicedData 내 인덱스 계산
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

  // --- 렌더 ---
  return (
    <div className="flex flex-col" style={{ width: w, position: "relative" }}>
      {/* 1. 캔들차트 (상단) */}
      <div className="flex">
        <svg width={LEFT_AXIS_WIDTH} height={CHART_HEIGHT}>
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
        </svg>
        <svg
          width={chartWidth}
          height={CHART_HEIGHT}
          style={{ userSelect: "none", background: "#1b1b1b", outline: "none" }}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleCandleMouseLeave}
          tabIndex={0}
        >
          {/* 그리드라인 */}
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
        {numVisibleOverlay > 0 && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: CHART_HEIGHT,
              background: "rgba(20,20,20,0.8)",
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
                {/* <br />
                이후 구간을 예측해보세요 */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 거래량(볼륨) 차트 (하단) */}
      <div className="flex" style={{ position: "relative" }}>
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
          style={{ background: "#1b1b1b", outline: "none" }}
          onWheel={handleWheel}
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
        {numVisibleOverlay > 0 && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: VOLUME_HEIGHT,
              background: "rgba(20,20,20,0.7)",
              pointerEvents: "none",
              zIndex: 5,
              display: "block",
            }}
          />
        )}
      </div>

      {/* 3. 날짜 라벨 (아래) */}
      <div className="flex" style={{ position: "relative" }}>
        <svg width={LEFT_AXIS_WIDTH} height={DATE_AXIS_HEIGHT} />
        <svg
          width={chartWidth}
          height={DATE_AXIS_HEIGHT}
          style={{ background: "#1b1b1b" }}
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
        {numVisibleOverlay > 0 && (
          <div
            style={{
              position: "absolute",
              left: overlayLeft,
              top: 0,
              width: overlayWidth,
              height: DATE_AXIS_HEIGHT,
              background: "rgba(20,20,20,0.55)",
              pointerEvents: "none",
              zIndex: 5,
              display: "block",
            }}
          />
        )}
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
            minWidth: 130,
            whiteSpace: "nowrap",
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
                  <div
                    style={{
                      color: "#d6d6d6",
                      fontSize: 12,
                      marginTop: 2,
                      maxHeight: 40,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: "1.35",
                    }}
                  >
                    {item.context}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
