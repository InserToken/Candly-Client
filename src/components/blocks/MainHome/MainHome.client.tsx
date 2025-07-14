"use client";
import React from "react";

export default function MainHomeClient() {
  return (
    <div className="flex justify-center gap-20 bg-[#0f0f0f]  items-center pt-28">
      {/* 연습문제 카드 */}
      <div className="group bg-[#1C1C20] hover:bg-[#396FFB] transition-colors rounded-2xl p-6 w-[400px] h-[530px] text-center shadow-lg flex flex-col cursor-pointer">
        <div className="pt-16 pb-7">
          <h2 className="text-[#F4F4F4] text-4xl font-semibold mb-3">
            연습문제
          </h2>
          <p className="text-[#F4F4F4] text-xl whitespace-nowrap">
            <span className="text-[#396FFB] group-hover:text-[#F4F4F4] font-medium">
              과거 차트 데이터
            </span>
            를 통해
            <br />
            흐름 예측 능력을 길러보세요
          </p>
        </div>
        <div>
          <img
            src="./practice_logo.svg"
            alt="연습문제 아이콘"
            className="mx-auto w-[300px]"
          />
        </div>
      </div>

      {/* 실전예측 카드 */}
      <div className="group bg-[#1C1C20] hover:bg-[#396FFB] rounded-2xl p-6 w-[400px] h-[530px] text-center shadow-lg flex flex-col ">
        <div className="pt-16 pb-7">
          <h2 className="text-[#F4F4F4] text-4xl font-semibold mb-3">
            실전예측
          </h2>
          <p className="text-[#F4F4F4] text-xl whitespace-nowrap">
            <span className="text-[#396FFB] group-hover:text-[#F4F4F4] font-medium">
              내 실제 주식 계좌
            </span>
            를 연결해
            <br />
            직접 흐름을 예측해보세요
          </p>
        </div>
        <div>
          <img
            src="./real_logo.svg"
            alt="실전예측 아이콘"
            className="mx-auto w-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
