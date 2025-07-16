"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postStock, checkUserStatus } from "@/services/userStock-service";
import { useAuthStore } from "@/stores/authStore";

export default function MainHomeClient() {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);

  const handleInvestClick = async () => {
    try {
      if (!auth?.token) {
        console.warn("로그인 필요");
        return router.push("/auth/login"); // 로그인 페이지로 이동 등 처리
      }

      const status = await checkUserStatus(auth.token);
      console.log("이미 연동 완료된 user: ", status.hasHoldings);

      if (status.hasHoldings) {
        const stockData = await postStock(auth.token);
        const firstCode = stockData[0]?.pdno;

        if (firstCode) {
          router.push(`/investment/${firstCode}`);
        } else {
          router.push("/investment");
        }
      } else {
        console.log("보유주식 없음");
        router.push("/investment");
      }
    } catch (err) {
      console.error("실전투자 이동 중 오류:", err);
      router.push("/investment");
    }
  };

  return (
    <div className="flex justify-center gap-20 bg-[#0f0f0f]  items-center pt-28 pb-20">
      {/* 연습문제 카드 */}
      <Link href="/practice" className="group">
        <div className="group bg-[#1C1C20] hover:bg-[#396FFB] transition-colors rounded-2xl p-6 pb-20 w-[400px] h-[530px] text-center shadow-lg flex flex-col cursor-pointer">
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
            <Image
              src="/practice_logo.svg"
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
      <div onClick={handleInvestClick} className="group cursor-pointer">
        <div className="group bg-[#1C1C20] hover:bg-[#396FFB] rounded-2xl p-6 w-[400px] h-[530px] text-center shadow-lg flex flex-col cursor-pointer">
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
            <Image
              src="/real_logo.svg"
              alt="실전예측 아이콘"
              className="mx-auto"
              width={300}
              height={0}
              style={{ height: "auto" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
