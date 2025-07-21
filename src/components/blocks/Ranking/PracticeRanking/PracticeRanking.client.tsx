/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getRankPracProblem,
  getRankPracScore,
} from "@/services/ranking-service";
import { GetPracticeScore, ProblemScore } from "@/types/ProblemScore";
import { useAuthStore } from "@/stores/authStore";

export default function PracticeRankingClient() {
  const [problems, setProblem] = useState<ProblemScore[]>([]);
  const auth = useAuthStore((s) => s.auth);
  const [rankingData, setRankingData] = useState<{
    [key: string]: { name: string; score: number; answer: string }[];
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await getRankPracProblem(auth.token);
      setProblem(result.data);
      console.log("내가 푼 문제 조회:", result);
    };

    const fetchRankingData = async () => {
      const result = await getRankPracScore();
      console.log("랭킹 조회", result);
      const grouped: {
        [key: string]: {
          name: string;
          score: number;
          answer: string;
          feedback: string;
        }[];
      } = {};

      (result.data as GetPracticeScore[]).forEach((item) => {
        const problemId = item.problem_id ?? "0";
        const name = item.user_id?.nickname ?? "알 수 없음";
        const score = item.score ?? 0;
        const answer = item.answer ?? "";
        const feedback = item.feedback ?? "";

        if (!grouped[problemId]) grouped[problemId] = [];
        grouped[problemId].push({ name, score, answer, feedback });
      });

      console.log("grouped", grouped);
      setRankingData(grouped);
    };

    fetchData();
    fetchRankingData();
  }, []);

  const uniqueProblems = problems.filter((p, idx, arr) => {
    const id = p.problem_id?._id;
    return id && arr.findIndex((other) => other.problem_id?._id === id) === idx;
  });

  const [selectedProblem, setSelectedProblem] = useState<string>("");

  useEffect(() => {
    if (uniqueProblems.length > 0 && !selectedProblem) {
      const id = uniqueProblems[0].problem_id?._id;
      if (id) setSelectedProblem(id);
    }
  }, [uniqueProblems, selectedProblem]);

  const ranking = rankingData[selectedProblem] || [];

  const [isModalOpen, setIsModalOpen] = useState(false);

  type RankUser = {
    name: string;
    score: number;
    answer: string;
    feedback: string;
  };
  const [selectedUser, setSelectedUser] = useState<RankUser | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState("");

  const openModal = (user: RankUser) => {
    setSelectedUser(user);
    setSelectedAnswer(user.answer);
    setSelectedFeedback(user.feedback);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="pt-4">
      <div className="mx-auto">
        <h2 className="text-lg mb-8 text-center">연습문제 랭킹</h2>

        <div className="flex justify-center gap-4 flex-wrap h-[600px]">
          {/* 내가 푼 문제들 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-md overflow-y-auto">
            <div className="space-y-2">
              {uniqueProblems.map((q, idx) => (
                <div
                  key={q.problem_id?._id ?? idx}
                  onClick={() => setSelectedProblem(q.problem_id?._id ?? "")}
                  className={`flex items-center justify-between px-5 py-4 rounded-lg cursor-pointer ${
                    selectedProblem === q.problem_id?._id
                      ? "bg-[#396FFB]"
                      : "bg-[#313136]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{q.problem_id?.title}</span>
                  </div>
                  {/* <span>{q.problem_id?.date}</span> */}
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 종목의 랭킹 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-xl overflow-y-auto">
            <div className="w-full">
              <div className="grid grid-cols-4 text-left text-sm px-3 mb-2">
                <div>순위</div>
                <div>이름</div>
                <div>점수</div>
                <div>답변 보기</div>
              </div>
              {ranking.map((r, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 items-center px-3 py-3 mb-2 rounded-lg text-left ${
                    i % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#16161A]"
                  }`}
                >
                  <div>{i + 1}</div>
                  <div>{r.name}</div>
                  <div>{r.score}점</div>
                  <div
                    className="text-gray-300 cursor-pointer"
                    onClick={() => openModal(r)}
                  >
                    <span className="text-lg">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[3px] z-50">
          <div className="bg-[#16161A] rounded-xl p-6 w-150 h-100 shadow-lg">
            <div className="h-75">
              <h4 className="text-xl font-bold mb-4">답변</h4>
              <div className="mb-28">{selectedAnswer}</div>
              <h4 className="text-xl">피드백</h4>
              <div>{selectedFeedback}</div>
            </div>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-[#396FFB] rounded hover:bg-blue-500 w-full"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
