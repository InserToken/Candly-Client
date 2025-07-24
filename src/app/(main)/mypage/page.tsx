"use client";
import MyPageInvestment from "@/components/blocks/MyPageInvestment";
import MyPagePractice from "@/components/blocks/MyPagePractice";
import { useAuthStore } from "@/stores/authStore";
export default function MyPage() {
  const { auth } = useAuthStore();

  return (
    <main className=" text-white min-h-screen ">
      <div className="max-w-6xl mx-auto px-6 py-10 ">
        {/* 상단 제목 */}
        <p className="text-4xl font-semibold mb-7">
          {auth?.nickname}
          <span className="ml-1 text-2xl">님의 마이페이지</span>
        </p>

        <div className="px-5">
          {/* 연습문제 히스토리 */}
          <section className="mb-16">
            <MyPagePractice />
          </section>

          {/* 실전투자 히스토리 */}
          <section>
            <MyPageInvestment />
          </section>
        </div>
      </div>
    </main>
  );
}
