"use client";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type FinancialChartProps = {
  data: {
    label: string;
    bar1: number | null;
    bar2?: number | null;
    line: number | null;
  }[];

  bar1Key: string;
  bar2Key?: string;
  lineKey: string;
  bar1Label: string;
  bar2Label?: string;
  lineLabel: string;

  bar1Formatter?: (value: number | null) => string;
  bar2Formatter?: (value: number | null) => string;
  lineFormatter?: (value: number | null) => string;
};

export default function FinancialComboChart({
  data,
  bar1Key,
  bar2Key,
  lineKey,
  bar1Label,
  bar2Label,
  lineLabel,
  bar1Formatter,
  bar2Formatter,
  lineFormatter,
}: FinancialChartProps) {
  // 기존 축 기본 포맷 함수
  const defaultLargeFormatter = (value: number) => {
    if (value == null || isNaN(value)) return "-";
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}조`;
    if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`;
    if (value >= 1e4) return `${(value / 1e4).toFixed(1)}만`;
    return value.toLocaleString("ko-KR");
  };
  const defaultPercentFormatter = (value: number) =>
    value == null || isNaN(value) ? "-" : value.toFixed(2) + "%";

  // 툴팁 포맷 함수
  const tooltipFormatter = (
    value: string | number | number[] | undefined,
    name: string
  ) => {
    // recharts에서 value가 배열로 들어오는 경우도 있어서 number[] 체크
    const safeValue =
      typeof value === "number"
        ? value
        : Array.isArray(value)
        ? value[0]
        : Number(value);

    if (name === bar1Label)
      return [
        bar1Formatter
          ? bar1Formatter(safeValue)
          : defaultLargeFormatter(safeValue),
        name,
      ];
    if (bar2Key && name === bar2Label)
      return [
        bar2Formatter
          ? bar2Formatter(safeValue)
          : defaultLargeFormatter(safeValue),
        name,
      ];
    if (name === lineLabel)
      return [
        lineFormatter
          ? lineFormatter(safeValue)
          : defaultPercentFormatter(safeValue),
        name,
      ];
    return [safeValue, name];
  };

  return (
    <div className="w-full bg-[#1b1b1b] p-4 rounded-xl overflow-x-auto">
      <div style={{ minWidth: `${data.length * 80}px` }}>
        <ComposedChart
          width={data.length * 80}
          height={260}
          data={data}
          barCategoryGap={15}
          margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#aaa" />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#aaa"
            tick={{ fill: "#aaa" }}
            tickFormatter={
              bar1Formatter ? bar1Formatter : defaultLargeFormatter
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#aaa"
            tick={{ fill: "#aaa" }}
            tickFormatter={
              lineFormatter ? lineFormatter : defaultPercentFormatter
            }
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#2a2a2a",
              border: "1px solid #555",
              color: "white",
            }}
            formatter={tooltipFormatter}
          />

          {/* 막대 차트 */}
          <Bar
            yAxisId="left"
            dataKey={bar1Key}
            name={bar1Label}
            fill="#396FFB"
          />
          {bar2Key && (
            <Bar
              yAxisId="left"
              dataKey={bar2Key}
              name={bar2Label}
              fill="#F87800"
            />
          )}

          {/* 꺾은선 차트 */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={lineKey}
            name={lineLabel}
            stroke="#EDCB37"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </div>
    </div>
  );
}
