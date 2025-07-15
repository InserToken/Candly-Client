"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getStock, checkUserStatus } from "@/services/userStock-service";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

const menuItems = [
  { label: "홈", href: "/" },
  { label: "연습문제", href: "/practice" },
  { label: "실전투자", href: "/investment", dynamic: true }, // ✅ 동적 처리
  { label: "랭킹", href: "/ranking" },
  { label: "마이페이지", href: "/mypage" },
];

export default function Navbar() {
  const pathname = usePathname();
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
        const stockData = await getStock(auth.token);
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
    <nav className="h-[98px] flex items-center px-8 pl-10 whitespace-nowrap fixed bg-inherit w-screen z-20">
      <Link href="/" className="flex items-center pr-2.5">
        <Image
          src="/logo.svg"
          alt="로고"
          width={20}
          height={20}
          className="pr-2.5"
        />
        <div className="text-2xl pr-20">오르락내리락</div>
      </Link>
      <ul className="flex gap-15">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.dynamic) {
            return (
              <li key={item.href}>
                <button
                  onClick={handleInvestClick}
                  className={
                    "text-base transition-colors " +
                    (isActive
                      ? "text-[#396FFB] font-semibold"
                      : "text-[#E2E2E2] hover:text-white")
                  }
                >
                  {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link href={item.href}>
                <span
                  className={
                    "text-base cursor-pointer transition-colors " +
                    (isActive
                      ? "text-[#396FFB] font-semibold"
                      : "text-[#E2E2E2] hover:text-white")
                  }
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
