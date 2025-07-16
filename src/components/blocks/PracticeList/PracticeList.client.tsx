"use client";
import React, { useState, useEffect } from "react";
import { PracticeProblems } from "@/types/PracticeProblems";
import { getPracticeList } from "@/services/practiceProblems-service";
import Link from "next/link";
import Image from "next/image";

export default function PracticeListClient() {
  const [problems, setProblems] = useState<PracticeProblems[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all"); // 문자열로 관리

  const categories = [
    { label: "전체", value: "all" },
    { label: "유형 1", value: "1" },
    { label: "유형 2", value: "2" },
    { label: "유형 3", value: "3" },
    { label: "유형 4", value: "4" },
    { label: "유형 5", value: "5" },
    { label: "유형 6", value: "6" },
    { label: "유형 7", value: "7" },
    { label: "유형 8", value: "8" },
    { label: "유형 9", value: "9" },
    { label: "유형 10", value: "10" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPracticeList(page, keyword, category);
      setProblems(result.practiceProblem);
      setTotalPages(result.totalPages);
    };
    fetchData();
  }, [page, keyword, category]);

  return (
    <div className="p-6 mb-16">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg mb-4 ml-56">연습문제 목록</h3>
        {/* 검색 및 카테고리 선택 */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="제목 검색"
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
            className="flex-1 px-4 py-2 rounded bg-[#16161A] border border-gray-400"
          />

          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            className="px-3 py-2 rounded bg-[#16161A] border border-gray-400"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* 문제리스트 */}
        <ul className="grid grid-cols-1 gap-4">
          {problems.map((problem, idx) => (
            <li key={problem._id}>
              <Link href={`/practice/${problem._id}`}>
                <div className="group p-4 bg-[#313136] pl-4 rounded-lg hover:bg-[#396FFB] cursor-pointer flex items-center gap-3">
                  <span>{(page - 1) * 20 + idx + 1}. </span>

                  {/* ✅ 로고 있으면 원형으로 보여주기 */}
                  {problem.stock_code.logo && (
                    <Image
                      src={problem.stock_code.logo}
                      alt={problem.stock_code.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  {problem.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-16 gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 w-25 h-10 whitespace-nowrap rounded bg-[#16161A] disabled:opacity-30 "
          >
            처음
          </button>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 w-25 h-10 whitespace-nowrap rounded bg-[#16161A] disabled:opacity-30"
          >
            이전
          </button>
          {/* 페이지 숫자 (최대 10개 보여주기) */}
          {(() => {
            const maxVisible = 7;
            let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
            let endPage = startPage + maxVisible - 1;

            if (endPage > totalPages) {
              endPage = totalPages;
              startPage = Math.max(1, endPage - maxVisible + 1);
            }

            const pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(i);
            }

            return pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 rounded w-25 h-10 whitespace-nowrap ${
                  page === pageNum ? "bg-[#396FFB]" : "bg-[#16161A]"
                }`}
              >
                {pageNum}
              </button>
            ));
          })()}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 w-25 h-10 whitespace-nowrap rounded bg-[#16161A] disabled:opacity-30"
          >
            다음
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 w-25 h-10 whitespace-nowrap rounded bg-[#16161A] disabled:opacity-30"
          >
            마지막
          </button>
        </div>
      </div>
    </div>
  );
}
