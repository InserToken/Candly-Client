import MyPageInvestment from "@/components/blocks/MyPageInvestment";
import MyPageProblem from "@/components/blocks/MyPageProblem";

export default function MyPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* 상단 제목 */}
        <p className="text-4xl font-semibold mb-10">마이페이지</p>

        {/* 연습문제 히스토리 */}
        <section className="mb-16">
          <MyPageProblem />
        </section>

        {/* 실전투자 히스토리 */}
        <section>
          <MyPageInvestment />
        </section>
      </div>
    </main>
  );
}
