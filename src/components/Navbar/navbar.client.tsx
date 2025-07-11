"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { label: "홈", href: "/" },
  { label: "연습문제", href: "/practice" },
  { label: "실전투자", href: "/investment" },
  { label: "랭킹", href: "/ranking" },
  { label: "마이페이지", href: "/mypage" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-[98px] flex items-center px-8 pl-10 whitespace-nowrap">
      <Link href="/" className="flex items-center pr-2.5">
        <img src="logo.svg" className="h-5" alt="로고" />
        <div className="text-2xl pr-20">오르락내리락</div>
      </Link>
      <ul className="flex gap-15">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
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
