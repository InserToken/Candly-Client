"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { checkUserStatus, getStock } from "@/services/userStock-service";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

const menuItems = [
  { label: "홈", href: "/" },
  { label: "연습문제", href: "/practice" },
  { label: "실전투자", href: "/investment", dynamic: true },
  { label: "랭킹", href: "/ranking" },
  { label: "마이페이지", href: "/mypage" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // hydration mismatch 방지용
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInvestClick = async () => {
    try {
      if (!auth?.token) {
        console.warn("로그인 필요");
        return router.push("/auth/login");
      }

      const status = await checkUserStatus(auth.token);
      console.log("이미 연동 완료된 user: ", status.hasHoldings);

      if (status.hasHoldings) {
        const stockData = await getStock(auth.token);
        const firstCode = stockData.stocks[0]?._id;
        console.log("주식 조회", firstCode);
        if (firstCode) {
          router.push(`/investment/${firstCode}`);
        } else {
          router.push("/investment");
        }
      } else {
        router.push("/investment");
      }
    } catch (err) {
      console.error("실전투자 이동 중 오류:", err);
      router.push("/investment");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("서버 로그아웃 실패");
    }
    sessionStorage.removeItem("token");
    clearAuth();
    router.replace("/auth/login");
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  return (
    <nav className="h-[98px] flex items-center px-8 pl-10 whitespace-nowrap fixed bg-inherit w-screen z-20">
      <Link href="/" className="flex items-center pr-2.5">
        <Image
          src="/logo.svg"
          alt="로고"
          width={30}
          height={30}
          className="pr-2.5"
        />
        <div className="text-2xl pr-20">오르락내리락</div>
      </Link>
      <ul className="flex gap-15">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.dynamic) {
            return (
              <li key={item.href}>
                <button
                  onClick={handleInvestClick}
                  className={
                    "text-base transition-colors cursor-pointer " +
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

      {/* 로그인/로그아웃 버튼 */}
      <div className="ml-auto pr-5">
        {mounted ? (
          auth?.token ? (
            <button
              onClick={handleLogout}
              className="text-sm text-[#E2E2E2] hover:text-white transition"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="text-sm text-[#E2E2E2] hover:text-white transition"
            >
              로그인
            </button>
          )
        ) : (
          // 서버에서 렌더링되는 placeholder (같은 구조 유지)
          <div className="w-[64px] h-[20px]" />
        )}
      </div>
    </nav>
  );
}
