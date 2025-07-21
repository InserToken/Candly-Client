"use client";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import CircularProgressChart from "./CircularProgressChart";
import { useEffect, useState } from "react";
import { fetchMyPagePractice } from "@/services/fetchMyPagePractice";
import type { ProblemScore } from "@/types/ProblemScore";

export default function MyPagePracticeClient() {
  const [today, setToday] = useState<Date | null>(null);
  const [pastDate, setPastDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [solvedProblem, setSolvedProblem] = useState(0);
  const [problemScoreAvg, setProblemScoreAvg] = useState<ProblemScore>();
  const [calendarData, setCalendarData] = useState<
    { date: string; count: number }[]
  >([]);
  const [recentProblemList, setRecentProblemList] = useState<ProblemScore[]>(
    []
  );

  useEffect(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 40);
    setToday(now);
    setPastDate(past);
  }, []);

  useEffect(() => {
    fetchMyPagePractice().then((res) => {
      const scoreList = res.data;
      setSolvedProblem(scoreList.length);

      const convertedScores: ProblemScore[] = scoreList.map(
        (item: ProblemScore) => ({
          answer: item.answer,
          feedback: item.feedback,
          score: item.score,
          logic: item.logic,
          momentum: item.momentum,
          macroEconomy: item.macroEconomy,
          marketIssues: item.marketIssues,
          quantEvidence: item.quantEvidence,
          date: new Date(item.date),
          title: item.problem_id?.title,
        })
      );

      // 평균 계산
      if (convertedScores.length > 0) {
        const average = (key: keyof ProblemScore) => {
          const total = convertedScores.reduce((sum, item) => {
            const value = item[key];
            return typeof value === "number" ? sum + value : sum;
          }, 0);
          return Math.round(total / convertedScores.length);
        };

        const avgData: ProblemScore = {
          answer: "",
          feedback: "",
          date: new Date(),
          score: average("score"),
          logic: average("logic"),
          momentum: average("momentum"),
          macroEconomy: average("macroEconomy"),
          marketIssues: average("marketIssues"),
          quantEvidence: average("quantEvidence"),
        };
        setProblemScoreAvg(avgData);
      }

      // 캘린더 데이터 처리
      const dateCountMap: Record<string, number> = {};
      convertedScores.forEach((item) => {
        const dateStr = item.date.toISOString().slice(0, 10);
        dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
      });

      const heatmapData = Object.entries(dateCountMap).map(([date, count]) => ({
        date,
        count,
      }));
      setCalendarData(heatmapData);

      // 최근 문제 5개 추출
      const recentList = [...convertedScores]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);
      console.log(recentList);
      setRecentProblemList(recentList);
    });
  }, []);

  if (!today || !pastDate) return null;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <p className="text-2xl font-semibold mb-6">연습문제 히스토리</p>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#16161A] w-55 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-4 justify-center">
          <p className="text-xl font-semibold">푼 문제 수</p>
          <p className="text-4xl font-bold">{solvedProblem}</p>
        </div>
        <div className="bg-[#16161A] w-60 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-4 justify-center">
          <p className="text-xl font-semibold">평균 점수</p>
          <p className="text-4xl font-bold">{problemScoreAvg?.score}</p>
          <p className="text-xl font-semibold">점</p>
        </div>
        <div className="bg-[#16161A] w-60 h-20 rounded-lg flex items-center justify-center">
          <button
            onClick={openModal}
            className="text-xl font-semibold text-white cursor-pointer"
          >
            최근 푼 문제 확인
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-80 h-70 bg-[#16161A] rounded-lg flex items-center justify-center p-8">
          <CalendarHeatmap
            startDate={pastDate}
            endDate={today}
            values={calendarData}
            showMonthLabels={false}
            weekdayLabels={["S", "M", "T", "W", "T", "F", "S"]}
            showOutOfRangeDays={true}
            horizontal={false}
            gutterSize={0}
            classForValue={(value) => {
              if (!value || !value.count || value.count === 0) {
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
            { label: "예측 논리", value: problemScoreAvg?.logic },
            { label: "모멘텀 인식", value: problemScoreAvg?.momentum },
            { label: "거시경제", value: problemScoreAvg?.macroEconomy },
            { label: "시황 이슈", value: problemScoreAvg?.marketIssues },
            { label: "정량적 근거", value: problemScoreAvg?.quantEvidence },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <CircularProgressChart value={item.value ?? 0} />
              <span className="text-sm text-white mt-3">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#16161A] rounded-xl w-[600px] h-[500px] shadow-xl flex flex-col">
            <div className="p-6 border-b border-[#2A2A30]">
              <h4 className="text-2xl font-bold text-white">
                최근 푼 문제 상세 정보
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {recentProblemList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E1E24] p-4 rounded-lg border border-[#2A2A30]"
                >
                  <p className="text-sm text-gray-400 mb-1">
                    {item.date.toISOString().slice(0, 10)}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {item.title}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-blue-400 font-bold">
                      점수: {item.score}점
                    </span>
                    <span className="text-sm text-gray-300 italic">
                      {item.feedback || item.answer.slice(0, 40) + "..."}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[#2A2A30]">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#396FFB] text-white rounded hover:bg-blue-500 w-full cursor-pointer "
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
