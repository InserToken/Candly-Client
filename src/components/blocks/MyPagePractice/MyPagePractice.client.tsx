"use client";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import CircularProgressChart from "./CircularProgressChart";
import { useEffect, useState } from "react";
import { fetchMyPagePractice } from "@/services/fetchMyPagePractice";
import type { ProblemScore } from "@/types/ProblemScore";
import Link from "next/link";

export default function MyPagePracticeClient() {
  const [today, setToday] = useState<Date | null>(null);
  const [pastDate, setPastDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avgScore, setAvgScore] = useState(0);
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
    past.setDate(now.getDate() - 60);
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
          technical: item.technical,
          macroEconomy: item.macroEconomy,
          marketIssues: item.marketIssues,
          quantEvidence: item.quantEvidence,
          date: new Date(item.date),
          title: item.problem_id?.title,
          pid: item.problem_id?._id,
        })
      );
      const sum = convertedScores.reduce(
        (acc, cur) => acc + (cur.score ?? 0),
        0
      );
      setAvgScore(scoreList.length == 0 ? 0 : sum / scoreList.length);
      // 항목별 만점 기준
      const maxScores = {
        logic: 15,
        technical: 50,
        macroEconomy: 10,
        marketIssues: 10,
        quantEvidence: 15,
      };

      if (convertedScores.length > 0) {
        const average = (key: keyof typeof maxScores) => {
          const total = convertedScores.reduce((sum, item) => {
            const value = item[key];
            return typeof value === "number" ? sum + value : sum;
          }, 0);
          const rawAvg = total / convertedScores.length;
          const percent = Math.round((rawAvg / maxScores[key]) * 100);
          return percent;
        };

        const avgData: ProblemScore = {
          answer: "",
          feedback: "",
          date: new Date(),
          score:
            average("logic") +
            average("technical") +
            average("macroEconomy") +
            average("marketIssues") +
            average("quantEvidence"),
          logic: average("logic"),
          technical: average("technical"),
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
      <main>
        <p className="text-2xl font-semibold mb-6">연습문제 히스토리</p>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#16161A] w-55 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-4 justify-center">
            <p className="text-xl font-semibold pr-1">푼 문제 수</p>
            <p className="text-4xl font-bold">{solvedProblem}</p>
          </div>
          <div className="bg-[#16161A] w-60 h-20 rounded-lg items-baseline flex text-center gap-1.5 pt-4 justify-center">
            <p className="text-xl font-semibold pr-1">평균 점수</p>
            <p className="text-4xl font-bold">{avgScore}</p>
            <p className="text-xl font-semibold">점</p>
          </div>
          <div className="bg-[#16161A] hover:bg-[#24242C] w-60 h-20 rounded-lg flex items-center justify-center">
            <button
              onClick={openModal}
              className="text-xl font-semibold text-white cursor-pointer"
            >
              최근 푼 문제 확인
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[360px] h-70 bg-[#16161A] rounded-lg flex flex-col items-center justify-center p-4">
            <CalendarHeatmap
              startDate={pastDate}
              endDate={today}
              values={calendarData}
              showMonthLabels={true}
              weekdayLabels={["S", "M", "T", "W", "T", "F", "S"]}
              showOutOfRangeDays={true}
              horizontal={true}
              gutterSize={0.5}
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
            <div className="flex items-center justify-center mt-3 text-xs text-gray-400 gap-1">
              <span className="mr-1">Less</span>
              {[
                "#313136",
                "#B6C8F8",
                "#7FA0F8",
                "#5683F8",
                "#396FFB",
                "#1856F8",
              ].map((color, idx) => (
                <div
                  key={idx}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
              <span className="ml-1">More</span>
            </div>
          </div>

          <div className="w-200 h-70 bg-[#16161A] rounded-lg flex items-center justify-center gap-6 px-6 py-8 font-semibold">
            {[
              {
                label: "예측 논리",
                value: problemScoreAvg?.logic,
                explain:
                  "주가 상승/하락에 대한 명확한 이유나 흐름을 논리적으로 설명했는지 평가합니다.",
              },
              {
                label: "기술적 분석",
                value: problemScoreAvg?.technical,
                explain:
                  "이동평균선, 거래량, RSI 등 차트 기반 지표를 근거로 판단했는지 평가합니다.",
              },
              {
                label: "거시경제",
                value: problemScoreAvg?.macroEconomy,
                explain:
                  "금리, 환율, 인플레이션 등 거시경제 요소가 주가에 미치는 영향을 고려했는지 평가합니다.",
              },
              {
                label: "시황 이슈",
                value: problemScoreAvg?.marketIssues,
                explain:
                  "해당 시점의 뉴스나 업종 이슈 등 시장 상황을 제대로 반영했는지 평가합니다.",
              },
              {
                label: "정량적 근거",
                value: problemScoreAvg?.quantEvidence,
                explain:
                  "PER, PBR, 실적 등 수치 기반 재무 데이터를 근거로 판단했는지 평가합니다.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <CircularProgressChart value={item.value ?? 0} />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white mt-3">{item.label}</span>
                  <span className="mt-3 relative group cursor-pointer text-gray-400">
                    ⓘ
                    <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                      <b className="text-[#f4f4f4]">{item.explain}</b>
                    </div>
                  </span>
                </div>
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
                  <Link
                    key={idx}
                    href={`/practice/${item.pid}`}
                    className="block"
                  >
                    <div className="bg-[#1E1E24] p-4 rounded-lg border border-[#2A2A30] hover:border-blue-500 transition-colors duration-150">
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
                      </div>
                    </div>
                  </Link>
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
      </main>
      <style jsx global>{`
        .react-calendar-heatmap rect {
          rx: 2;
          ry: 2;
        }

        .react-calendar-heatmap text {
          font-size: 5px;
          fill: #aaa;
        }
      `}</style>
    </div>
  );
}
