export default function PracticeRankingClient() {
  const solvedQuestions = [
    { company: "삼성전자", logo: "/samsung.png", date: "2025년 5월" },
    { company: "네이버", logo: "/naver.png", date: "2021년 4월" },
    { company: "신한투자증권", logo: "/shinhan.png", date: "2015년 11월" },
  ];

  const ranking = [
    { name: "예경", score: 70 },
    { name: "은서", score: 65 },
    { name: "은동", score: 60 },
    { name: "지환", score: 55 },
    { name: "민선", score: 10 },
  ];

  return (
    <div className="pt-4 ">
      <div className="mx-auto">
        {/* 왼쪽 정렬 타이틀 */}
        <h2 className="text-lg mb-8 text-center">연습문제 랭킹</h2>

        {/* 중앙 카드 그룹 */}
        <div className="flex justify-center gap-4 flex-wrap h-[600px]">
          {/* 내가 푼 문제들 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-md overflow-y-auto">
            <div className="space-y-2">
              {solvedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#313136] px-5 py-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={q.logo}
                      alt="logo"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{q.company}</span>
                  </div>
                  <span>{q.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 답변 랭킹 */}
          <div className="bg-[#16161A] rounded-2xl p-6 w-full h-[600px] max-w-xl overflow-y-auto">
            <div className="w-full">
              <div className="grid grid-cols-4 text-center text-sm text-gray-400 px-3 mb-2">
                <div>순위</div>
                <div>이름</div>
                <div>점수</div>
                <div>답변 보기</div>
              </div>
              {ranking.map((r, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 items-center px-3 py-3 mb-2 rounded-lg text-center ${
                    i % 2 === 0 ? "bg-[#1C1C20]" : "bg-[#16161A]"
                  }`}
                >
                  <div>{i + 1}</div>
                  <div>{r.name}</div>
                  <div>{r.score}점</div>
                  <div className="text-gray-300 cursor-pointer">
                    <span className="text-lg">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
