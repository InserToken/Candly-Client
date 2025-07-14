export default function MyPageInvestmentClient() {
  return (
    <div>
      <p className="text-2xl font-semibold mb-6">실전투자 히스토리</p>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#16161A] rounded-lg px-10 py-3 text-center">
          <p className="text-xl">예측 종목</p>
        </div>
        <div className="bg-[#16161A] rounded-lg px-6 py-3 text-center">
          <p className="text-xl">적중률</p>
        </div>
        <div className="bg-[#16161A] rounded-lg px-6 py-3 text-center">
          <p className="text-xl">내 랭킹</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-8"></div>
    </div>
  );
}
