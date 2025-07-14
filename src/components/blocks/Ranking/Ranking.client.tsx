"use client";
import Link from "next/link";

export default function RankingClient() {
  return (
    <div className="flex justify-center items-center gap-10 bg-[#0f0f0f] pt-28">
      {/* 연습문제 카드 */}
      <Link href="/ranking/practice" className="group">
        <div className="group bg-[#1C1C20] hover:bg-[#396FFB] rounded-2xl p-6 w-[450px] h-[450px] text-center  flex flex-col justify-center cursor-pointer">
          <div className="mb-16">
            <h2 className="text-[#F4F4F4] text-3xl font-semibold mb-3">
              연습문제 랭킹
            </h2>
            <p className="text-[#F4F4F4] text-xl whitespace-nowrap">
              <span className="text-[#396FFB] group-hover:text-[#F4F4F4] font-medium">
                연습문제 점수
              </span>
              <br />
              랭킹을 확인하세요
            </p>
          </div>
        </div>
      </Link>

      {/* 실전예측 카드 */}
      <Link href="/ranking/real" className="group">
        <div className="group bg-[#1C1C20] hover:bg-[#396FFB] rounded-2xl p-6 w-[450px] h-[450px] text-center shadow-lg flex flex-col justify-center cursor-pointer">
          <div className="mb-16">
            <h2 className="text-[#F4F4F4] text-3xl font-semibold mb-3">
              실전예측 랭킹
            </h2>
            <p className="text-[#F4F4F4] text-xl whitespace-nowrap">
              <span className="text-[#396FFB] group-hover:text-[#F4F4F4] font-medium">
                실전 예측 누적 정확도
              </span>
              <br />
              랭킹을 확인하세요
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
