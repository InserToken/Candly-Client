/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";

export default function PracticeRankingClient() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const solvedQuestions = [
    { company: "삼성전자", logo: "/samsung.png", date: "2025년 5월" },
    { company: "네이버", logo: "/naver.png", date: "2021년 4월" },
    { company: "신한투자증권", logo: "/shinhan.png", date: "2015년 11월" },
  ];

  // 더미 랭킹 데이터 (종목별로)
  const rankingData: { [key: string]: { name: string; score: number }[] } = {
    삼성전자: [
      { name: "예경", score: 70 },
      { name: "은서", score: 65 },
    ],
    네이버: [
      { name: "은동", score: 60 },
      { name: "지환", score: 55 },
    ],
    신한투자증권: [
      { name: "민선", score: 10 },
      { name: "예경", score: 45 },
    ],
  };

  const [selectedCompany, setSelectedCompany] = useState("삼성전자");

  const ranking = rankingData[selectedCompany] || [];

  return (
    <div className="pt-4">
      <div className="mx-auto">
        <h2 className="text-lg mb-8 text-center">연습문제 랭킹</h2>

        <div className="flex justify-center gap-4 flex-wrap h-[600px]">
          {/* 내가 푼 문제들 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-md overflow-y-auto">
            <div className="space-y-2">
              {solvedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCompany(q.company)}
                  className={`flex items-center justify-between px-5 py-4 rounded-lg cursor-pointer ${
                    selectedCompany === q.company
                      ? "bg-[#396FFB]"
                      : "bg-[#313136]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={q.logo}
                      alt="logo"
                      className="w-8 h-8 rounded-full"
                      width={32} // w-8 = 2rem = 32px
                      height={32}
                    />
                    <span>{q.company}</span>
                  </div>
                  <span>{q.date}</span>
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
              {ranking.map((r: any, i: any) => (
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
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center ">
          <div className="bg-[#16161A] rounded-xl p-6 w-150 h-100 shadow-lg">
            <h4 className="text-xl font-bold mb-4">사용자 상세 정보</h4>
            <div className="h-60">답변</div>

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
