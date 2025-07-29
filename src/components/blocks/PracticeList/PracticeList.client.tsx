"use client";
import React, { useState, useEffect } from "react";
import { PracticeProblems } from "@/types/PracticeProblems";
import { ProblemScore } from "@/types/ProblemScore";
import { getPracticeList } from "@/services/practiceProblems-service";
import { getRankPracProblem } from "@/services/ranking-service";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";

import { debounce } from "es-toolkit";

// 체크박스용 카테고리 정의 (value를 숫자 배열로)
const categories = [
  { label: "이동평균선", value: [1, 2] },
  { label: "RSI", value: [3, 4, 9, 10] },
  { label: "거래량", value: [5, 6] },
  { label: "볼린저 밴드", value: [7, 8, 9, 10] },
];

export default function PracticeListClient() {
  const [problems, setProblems] = useState<PracticeProblems[]>([]);
  const [correctProblems, setCorrectProblems] = useState<ProblemScore[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const auth = useAuthStore((s) => s.auth);
  // 체크된 카테고리 value(배열로 관리, 각 value는 숫자배열)
  const [checkedCategories, setCheckedCategories] = useState<number[][]>([]);

  // category string: 체크된 모든 value 합친 후, 중복 없이 flatten → 콤마로 join
  const filterCategory = Array.from(new Set(checkedCategories.flat())).join(
    ","
  );

  function getBadges(problemtype: number) {
    if ([1, 2].includes(problemtype)) return ["이동평균선"];
    if ([3, 4].includes(problemtype)) return ["RSI"];
    if ([5, 6].includes(problemtype)) return ["거래량"];
    if ([7, 8].includes(problemtype)) return ["볼린저 밴드"];
    if ([9, 10].includes(problemtype)) return ["볼린저 밴드", "RSI"];
    return ["기타"];
  }

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPracticeList(
        page,
        keyword,
        filterCategory || "all"
      );
      setProblems(result.practiceProblem);
      setTotalPages(result.totalPages);
    };

    const fetchCorrect = async () => {
      const result = await getRankPracProblem(auth.token);
      setCorrectProblems(result.data);
    };

    const fetchAll = debounce(() => {
      fetchData();
      fetchCorrect();
    }, 200);

    fetchAll();

    return () => {
      fetchAll.cancel();
    };
  }, [page, keyword, filterCategory]);

  // 체크박스 핸들러
  function handleCategoryCheck(idx: number) {
    setPage(1);
    setCheckedCategories((prev) => {
      const valueStr = String(categories[idx].value);
      // 이미 체크되어 있으면 해제(제거)
      if (prev.some((cat) => String(cat) === valueStr)) {
        return prev.filter((cat) => String(cat) !== valueStr);
      }
      // 없으면 추가
      return [...prev, categories[idx].value];
    });
  }

  return (
    <div className="p-6 mb-16">
      <div className="flex justify-center items-start  ml-64 gap-10">
        {/* 왼쪽: 검색+문제리스트 */}
        <div className="min-w-[550px] max-w-[650px] w-full">
          <h3 className="text-lg mb-4 ml-58">연습문제 목록</h3>
          {/* 검색창 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="검색창"
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
              className="w-full px-4 py-2 rounded bg-[#16161A] border border-gray-400"
            />
          </div>
          {/* 문제리스트 */}
          <ul className="grid grid-cols-1 gap-4">
            {problems.map((problem, idx) => (
              <li key={problem._id}>
                <Link href={`/practice/${problem._id}`}>
                  <div className="group p-4 bg-[#23232b] pl-4 rounded-lg hover:bg-[#396FFB] cursor-pointer flex items-center gap-3">
                    <span>{(page - 1) * 15 + idx + 1}. </span>
                    {problem.stock_code.logo && (
                      <Image
                        src={problem.stock_code.logo}
                        alt={problem.stock_code.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="font-semibold">
                      {problem.title.split("_")[0]}
                    </span>
                    {/* 문제타입 뱃지 */}
                    {getBadges(Number(problem?.problemtype)).map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded-full text-xs border border-[#fffff]"
                      >
                        {badge}
                      </span>
                    ))}
                    {correctProblems.some(
                      (item) => problem._id === item.problem_id?._id
                    ) && (
                      <span className="px-2 py-0.5 rounded-full text-xs text-[#396FFB] border">
                        푼 문제
                      </span>
                    )}

                    {/* 오른쪽 뱃지들 */}
                    <div className="flex items-center gap-2 ml-auto">
                      {/* 날짜 뱃지 */}
                      <span className="px-2 py-0.5 rounded text-sm">
                        {new Date(problem.date).toLocaleDateString("ko-KR", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* 오른쪽: 카테고리 필터, flex 컨테이너 안에 위치시킴 */}
        <div className="w-[200px] bg-[#23232b] rounded-2xl p-6 flex flex-col gap-3 shadow ml-4 mt-16">
          {categories.map((cat, idx) => (
            <label
              key={cat.label}
              className="flex items-center gap-2 text-base"
            >
              <input
                type="checkbox"
                checked={
                  checkedCategories.find((v) => String(v) === String(cat.value))
                    ? true
                    : false
                }
                onChange={() => handleCategoryCheck(idx)}
                className="accent-[#396FFB] w-4 h-4"
              />
              {cat.label}
            </label>
          ))}
          <button
            onClick={() => {
              setCheckedCategories([]);
              setPage(1);
            }}
            className="mt-4 px-2 py-2 rounded text-xs bg-[#396FFB] hover:bg-blue-500"
          >
            전체해제
          </button>
        </div>
      </div>
      {/* 페이지네이션 */}
      <div className="flex justify-center mt-16 gap-2">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="px-2 py-1 w-25 h-10 whitespace-nowrap rounded bg-[#16161A] disabled:opacity-30 "
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
  );
}
