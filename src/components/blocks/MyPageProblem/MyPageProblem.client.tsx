"use client";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import ReactTooltip from "react-tooltip";
import { useEffect, useState } from "react";

export default function MyPageProblemClient() {
  const [today, setToday] = useState<Date | null>(null);
  const [pastDate, setPastDate] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 60);
    setToday(now);
    setPastDate(past);
  }, []);

  if (!today || !pastDate) return null; // 클라이언트에서 날짜 준비될 때까지 렌더링 안 함

  return (
    <div>
      <p className="text-2xl font-semibold mb-6">연습문제 히스토리</p>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#16161A] rounded-lg px-10 py-3 text-center">
          <p className="text-xl">푼 문제 수</p>
        </div>
        <div className="bg-[#16161A] rounded-lg px-6 py-3 text-center">
          <p className="text-xl">평균 점수</p>
        </div>
        <div className="bg-[#16161A] rounded-lg px-6 py-3 text-center">
          <p className="text-xl">최근 푼 문제 확인</p>
        </div>
      </div>
      <div className="flex items-center gap-4   ">
        <div className="w-1/2 bg-[#16161A] rounded-lg px-30 py-20 flex justify-center">
          <CalendarHeatmap
            startDate={pastDate}
            endDate={today}
            values={[
              { date: "2025-06-10", count: 2 },
              { date: "2025-07-1", count: 1 },
              { date: "2025-07-2", count: 2 },
              { date: "2025-07-3", count: 3 },
              { date: "2025-07-5", count: 4 },
              { date: "2025-07-7", count: 10 },
              { date: "2025-07-10", count: 2 },
              { date: "2025-07-11", count: 2 },
              { date: "2025-07-12", count: 6 },
              { date: "2025-07-13", count: 5 },
            ]}
            // titleForValue={(value) => "날짜는 ${value.date}"}
            tooltipDataAttrs={(value): { [key: string]: string } => {
              if (!value || !value.date) return {};
              return {
                "data-tip": `${value.date} (${value.count ?? 0}개)`,
              };
            }}
            showWeekdayLabels={true}
            showOutOfRangeDays={true}
            horizontal={false}
            gutterSize={0}
            // onMouseOver={(event, value) => console.log(event, value)}
            weekdayLabels={["S", "M", "T", "W", "T", "F", "S"]}
            classForValue={(value) => {
              if (!value || value.count === 0) {
                return "fill-[#313136]";
              } else if (value.count < 2) {
                return "fill-[#B6C8F8]";
              } else if (value.count < 3) {
                return "fill-[#7FA0F8]";
              } else if (value.count < 4) {
                return "fill-[#5683F8]";
              } else if (value.count < 5) {
                return "fill-[#396FFB]";
              } else {
                return "fill-[#1856F8]";
              }
            }}
          />
          <ReactTooltip
            place="top"
            type="light"
            effect="solid"
            className="!text-sm !rounded-md !px-3 !py-2 !bg-white !text-black shadow-lg"
          />
        </div>
        <div className="bg-[#16161A]"></div>
      </div>
    </div>
  );
}
