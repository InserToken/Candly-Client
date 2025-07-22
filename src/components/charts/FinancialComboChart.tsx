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
};

export default function FinancialComboChart({
  data,
  bar1Key,
  bar2Key,
  lineKey,
  bar1Label,
  bar2Label,
  lineLabel,
}: FinancialChartProps) {
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
          <YAxis yAxisId="left" stroke="#aaa" tick={{ fill: "#aaa" }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#aaa"
            tick={{ fill: "#aaa" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#2a2a2a",
              border: "1px solid #555",
              color: "white",
            }}
          />
          <Legend wrapperStyle={{ color: "white" }} />

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
