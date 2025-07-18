"use client";
import Link from "next/link";
import Image from "next/image";

export default function RankingClient() {
  return (
    <div className="flex justify-center items-center gap-20 bg-[#0f0f0f] pt-28 pb-20">
      {/* 연습문제 카드 */}
      <Link href="/ranking/practice" className="group">
        <div className="group bg-[#1C1C20] hover:bg-[#396FFB] rounded-2xl p-6 w-[450px] h-[450px] text-center shadow-lg flex items-center justify-center cursor-pointer">
          <div>
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
          <div>
            <Image
              src="/rank_prac.svg"
              alt="연습문제 아이콘"
              className="mx-auto"
              width={300}
              height={0} // auto height
              style={{ height: "auto" }}
            />
          </div>
        </div>
      </Link>

      {/* 실전예측 카드 */}
      <Link href="/ranking/real" className="group">
        <div className="group bg-[#1C1C20] hover:bg-[#396FFB] rounded-2xl p-6 w-[450px] h-[450px] text-center shadow-lg flex items-center justify-center cursor-pointer">
          <div>
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
          <div>
            <Image
              src="/rank_real.svg"
              alt="실전예측 아이콘"
              className="mx-auto"
              width={250}
              height={0}
              style={{ height: "auto" }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
