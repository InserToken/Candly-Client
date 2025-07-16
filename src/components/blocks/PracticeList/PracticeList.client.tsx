"use client";
import React, { useState, useEffect } from "react";
import { PracticeProblems } from "@/types/PracticeProblems";
import { getPracticeList } from "@/services/practiceProblems-service";
import Link from "next/link";

export default function PracticeListClient() {
  const [problems, setProblems] = useState<PracticeProblems[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const result = await getPracticeList(page, keyword);
      setProblems(result.practiceProblem);
      setTotalPages(result.totalPages);
    };
    fetchData();
  }, [page, keyword]);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg mb-4 ml-56">연습문제 목록</h3>
        {/* ✅ 검색 입력창 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="제목 검색"
            value={keyword}
            onChange={(e) => {
              setPage(1); // 검색 시 1페이지로 초기화
              setKeyword(e.target.value);
            }}
            className="w-full px-4 py-2 rounded bg-[#1f1f1f] text-white border border-gray-600"
          />
        </div>

        {/* 문제리스트 */}
        <ul className="grid grid-cols-1 gap-4">
          {problems.map((problem, idx) => (
            <li key={problem._id}>
              <Link href={`/practice/${problem._id}`}>
                <div className="group p-4 bg-[#313136] pl-8 rounded-lg text-white hover:bg-[#396FFB] cursor-pointer">
                  {(page - 1) * 20 + idx + 1}. {problem.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-600 text-white disabled:opacity-30"
          >
            처음
          </button>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-600 text-white disabled:opacity-30"
          >
            이전
          </button>

          {/* 페이지 숫자 (최대 5개만 보여주기) */}
          {Array.from({ length: totalPages })
            .slice(Math.max(0, page - 3), page + 2)
            .map((_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    page === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-600 text-white disabled:opacity-30"
          >
            다음
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-600 disabled:opacity-30"
          >
            마지막
          </button>
        </div>
      </div>
    </div>
  );
}
