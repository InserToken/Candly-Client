"use client";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import CircularProgressChart from "./CircularProgressChart";
import { useEffect, useState } from "react";

export default function MyPageProblemClient() {
  const [today, setToday] = useState<Date | null>(null);
  const [pastDate, setPastDate] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 40);
    setToday(now);
    setPastDate(past);
  }, []);

  if (!today || !pastDate) return null; // 클라이언트에서 날짜 준비될 때까지 렌더링 안 함

  return (
    <div>
      <p className="text-2xl font-semibold mb-6">연습문제 히스토리</p>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#16161A] w-55 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-4 justify-center">
          <p className="text-xl font-semibold">푼 문제 수</p>
          <p className="text-4xl font-bold">14</p>
        </div>
        <div className="bg-[#16161A] w-60 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-4 justify-center">
          <p className="text-xl font-semibold">평균 점수</p>
          <p className="text-4xl font-bold">60</p>
          <p className="text-xl font-semibold">점</p>
        </div>
        <div className="bg-[#16161A] w-60 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-6 justify-center">
          <p className="text-xl font-semibold ">최근 푼 문제 확인</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-80 h-70  bg-[#16161A] rounded-lg flex items-center justify-center p-8">
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
            // showWeekdayLabels={true}
            showMonthLabels={false}
            weekdayLabels={["S", "M", "T", "W", "T", "F", "S"]}
            showOutOfRangeDays={true}
            horizontal={false}
            gutterSize={0}
            // onMouseOver={(event, value) => console.log(event, value)}

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
        </div>

        <div className="w-200 h-70 bg-[#16161A] rounded-lg flex items-center justify-center gap-6 px-6 py-8 font-semibold">
          {[
            { label: "예측 논리", value: 55 },
            { label: "모멘텀 인식", value: 65 },
            { label: "거시경제", value: 75 },
            { label: "시황 이슈", value: 85 },
            { label: "정량적 근거", value: 100 },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <CircularProgressChart value={item.value} />
              <span className="text-sm text-white mt-3">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
