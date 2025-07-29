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
  { label: "실전예측", href: "/investment", dynamic: true },
  { label: "랭킹", href: "/ranking" },
  { label: "마이페이지", href: "/mypage" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const loginRequiredPaths = ["/", "/practice", "/ranking", "/mypage"];

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const handleInvestClick = async () => {
    try {
      if (!auth?.token) return router.push("/auth/login");

      const status = await checkUserStatus(auth.token);
      const stockData = await getStock(auth.token);
      const firstCode = stockData.stocks[0]?.stock_code._id;
      router.push(firstCode ? `/investment/${firstCode}` : "/investment");
    } catch (err) {
      router.push("/investment");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    sessionStorage.removeItem("token");
    clearAuth();
    router.replace("/auth/login");
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const navButtonClass = (isActive: boolean) =>
    "text-base transition-colors cursor-pointer " +
    (isActive
      ? "text-[#396FFB] hover:text-blue-500 font-semibold"
      : "text-[#E2E2E2] hover:text-white");

  return (
    <nav className="h-[98px] flex items-center px-8 pl-10 fixed bg-inherit w-full z-20">
      {/* 로고 & 홈 이동 */}
      <button
        onClick={() => router.push(auth?.token ? "/" : "/auth/login")}
        className="flex items-center pr-2.5 bg-transparent border-none cursor-pointer"
      >
        <Image
          src="/logo.svg"
          alt="로고"
          width={30}
          height={30}
          className="pr-2.5"
        />
        <div className="text-2xl pr-20">Candly</div>
      </button>

      {/* 데스크탑 메뉴 */}
      <ul className="hidden md:flex gap-15">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isLoginRequired = loginRequiredPaths.includes(item.href);

          const onClick = item.dynamic
            ? handleInvestClick
            : () => {
                if (!auth?.token && isLoginRequired) {
                  router.push("/auth/login");
                } else {
                  router.push(item.href);
                }
              };

          return (
            <li key={item.href}>
              <button onClick={onClick} className={navButtonClass(isActive)}>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* 오른쪽 버튼 (데스크탑 전용) */}
      <div className="ml-auto hidden md:flex gap-4 items-center pr-5">
        {auth?.token ? (
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
        )}
      </div>

      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="ml-auto md:hidden text-white text-xl"
      >
        ☰
      </button>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="absolute top-[98px] left-0 w-full bg-black border-t border-neutral-700 px-5 py-4 flex flex-col gap-4 md:hidden z-40">
          {menuItems.map((item) => {
            const isLoginRequired = loginRequiredPaths.includes(item.href);
            const onClick = item.dynamic
              ? handleInvestClick
              : () => {
                  if (!auth?.token && isLoginRequired) {
                    router.push("/auth/login");
                  } else {
                    router.push(item.href);
                  }
                  setMenuOpen(false);
                };
            return (
              <button
                key={item.href}
                onClick={onClick}
                className="text-left text-base text-[#E2E2E2] hover:text-white"
              >
                {item.label}
              </button>
            );
          })}
          {auth?.token ? (
            <button
              onClick={handleLogout}
              className="text-left text-base text-[#E2E2E2] hover:text-white"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => {
                router.push("/auth/login");
                setMenuOpen(false);
              }}
              className="text-left text-base text-[#E2E2E2] hover:text-white"
            >
              로그인
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
