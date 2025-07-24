"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ClickCard from "@/components/buttons/ClickCard";
import CandleChart from "@/components/charts/Candlechart";
import { fetchPracticeProblem } from "@/services/fetchPracticeProblem";
import { fetchProblemTypeMeta } from "@/services/fetchProblemTypeMeta";
import { fetchPracticeNews } from "@/services/fetchPracticeNews";
import { gradeWithGemini } from "@/services/gradeWithGemini";
import { postPracticeScore } from "@/services/practiceScoreService";
import FinanceTable from "@/components/charts/FinanceTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type PriceItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type PracticeProblemData = {
  title: string;
  prices: PriceItem[];
  stock_code: string;
  date: string;
  problemtype: string;
};

type NewsItem = {
  _id: string;
  title: string;
  date: string;
  context: string;
  news_url: string;
  img_url?: string;
};

export default function PracticeClient() {
  const router = useRouter();
  const params = useParams<{ problemId: string }>();
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chart" | "finance">("chart");
  const [problemData, setProblemData] = useState<PracticeProblemData | null>(
    null
  );
  const [news, setNews] = useState<NewsItem[]>([]);
  const [problemType, setProblemType] = useState<number | null>(null);
  const [typeMeta, setTypeMeta] = useState<any>(null);
  const chartBoxRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(780);
  const [showHint, setShowHint] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLine, setShowLine] = useState({
    ma5: true,
    ma20: true,
    ma60: true,
    ma120: true,
    bb: true,
  });

  // === 피드백 상태 ===
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  // === 차트 오버레이 상태 ===
  const [isAnswered, setIsAnswered] = useState(false);

  // 채점 및 저장
  const handleGrade = async () => {
    setLoading(true);
    setGradeResult(null);
    try {
      const result = await gradeWithGemini(prompt, input);
      let dataStr = result.result;
      dataStr = dataStr.replace(/```json|```/gi, "");
      dataStr = dataStr.replace(/'''json|'''/gi, "");
      dataStr = dataStr.trim();

      let data;
      try {
        data = typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;
      } catch (err) {
        toast.error("AI 응답을 JSON으로 변환할 수 없습니다.");
        setLoading(false);
        return;
      }
      setGradeResult(data);

      try {
        const token =
          sessionStorage.getItem("token") ||
          localStorage.getItem("accessToken");
        const practiceScoreData = {
          problem_id: params.problemId,
          answer: input,
          score: data.score,
          feedback: data.feedback,
          logic: data.breakdown?.logic,
          technical: data.breakdown?.technical,
          macroEconomy: data.breakdown?.macroEconomy,
          marketIssues: data.breakdown?.marketIssues,
          quantEvidence: data.breakdown?.quantEvidence,
          date: new Date().toISOString(),
        };
        await postPracticeScore(token, practiceScoreData);
        toast.success("채점 및 저장 완료!");
        setFeedback(data.feedback || "피드백 없음.");
        setShowFeedback(true);
        setIsAnswered(true); // <- 차트 오버레이 해제
      } catch {
        toast.error("채점은 완료되었으나 저장에 실패했습니다.");
      }
    } catch (e: any) {
      toast.error(e.message || "채점 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleLine = (key: keyof typeof showLine) => {
    setShowLine((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    function updateWidth() {
      if (chartBoxRef.current) {
        setParentWidth(chartBoxRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    fetchPracticeProblem(params.problemId).then((data) => {
      setProblemData(data);
      setProblemType(data.problemtype);
    });
  }, [params.problemId]);

  useEffect(() => {
    fetchPracticeNews(params.problemId).then((data) => {
      setNews(data);
    });
  }, [params.problemId]);

  useEffect(() => {
    if (problemType !== null) {
      fetchProblemTypeMeta(problemType)
        .then((data) => {
          setTypeMeta(data);
          setPrompt(data.typeData?.[0]?.Prompting || "");
        })
        .catch((err) => console.error("fetchProblemTypeMeta error:", err));
    }
  }, [problemType]);

  function getBadges(problemtype: number) {
    if ([1, 2].includes(problemtype)) return ["SMA"];
    if ([3, 4].includes(problemtype)) return ["RSI"];
    if ([5, 6].includes(problemtype)) return ["거래량"];
    if ([7, 8].includes(problemtype)) return ["볼린저 밴드"];
    if ([9, 10].includes(problemtype)) return ["볼린저 밴드", "RSI"];
    return ["기타"];
  }

  const stockData = problemData?.prices;

  return (
    <div className="min-h-screen px-[80px] pt-1 relative">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
          <span className="text-white text-xl">채점 중...</span>
        </div>
      )}

      <div className="mb-1">
        {getBadges(Number(problemData?.problemtype)).map((badge) => (
          <span
            key={badge}
            className="px-2 py-0.5 mr-2 rounded-full text-xs border border-white"
          >
            {badge}
          </span>
        ))}
      </div>
      <div className="flex">
        <h2 className="mb-3 text-2xl">{problemData?.title.split("_")[0]}</h2>
        <span className="ml-2 px-2 py-0.5 rounded text-sm mt-auto mb-4">
          {problemData?.date}
        </span>
      </div>

      <main className="flex flex-col lg:flex-row gap-6">
        <section className="flex-1 max-w-[894px]">
          <div className="text-sm text-gray-300 mb-4">
            <div className="flex flex-wrap items-center gap-1 mb-4">
              <button
                className={`px-3 py-1 rounded-full ${
                  tab === "chart" ? "bg-[#2a2a2a] text-white" : "text-gray-400"
                }`}
                onClick={() => setTab("chart")}
              >
                차트
              </button>
              <button
                className={`px-3 py-1 rounded-full ${
                  tab === "finance"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400"
                }`}
                onClick={() => setTab("finance")}
              >
                재무 정보
              </button>
              {tab === "chart" && (
                <div className="flex flex-wrap gap-4 items-center justify-end text-sm text-gray-300 ml-auto pr-3">
                  <span className="flex items-center gap-1">
                    <span className="text-white pr-1">이동평균선</span>
                    <span
                      className={`cursor-pointer ${
                        showLine.ma5 ? "text-[#00D5C0]" : "text-gray-500"
                      }`}
                      onClick={() => toggleLine("ma5")}
                    >
                      5
                    </span>
                    ·
                    <span
                      className={`cursor-pointer ${
                        showLine.ma20 ? "text-[#E8395F]" : "text-gray-500"
                      }`}
                      onClick={() => toggleLine("ma20")}
                    >
                      20
                    </span>
                    ·
                    <span
                      className={`cursor-pointer ${
                        showLine.ma60 ? "text-[#F87800]" : "text-gray-500"
                      }`}
                      onClick={() => toggleLine("ma60")}
                    >
                      60
                    </span>
                    ·
                    <span
                      className={`cursor-pointer ${
                        showLine.ma120 ? "text-[#7339FB]" : "text-gray-500"
                      }`}
                      onClick={() => toggleLine("ma120")}
                    >
                      120
                    </span>
                  </span>
                  <span
                    className={`cursor-pointer ${
                      showLine.bb ? "text-[#EDCB37]" : "text-gray-500"
                    }`}
                    onClick={() => toggleLine("bb")}
                  >
                    볼린저밴드
                  </span>
                  |<span className="text-[#396FFB]">거래량</span>
                  <span className="text-[#e75480]">RSI</span>
                </div>
              )}
            </div>

            {/** 차트 / 재무정보 컨테이너 **/}
            <div
              className={`w-full bg-[#1b1b1b] rounded-lg mb-6 flex overflow-auto ${
                tab === "chart"
                  ? "h-[400px] items-center justify-center"
                  : "h-[calc(100vh-300px)] flex-col"
              }`}
              ref={chartBoxRef}
            >
              {tab === "chart" ? (
                Array.isArray(stockData) ? (
                  <CandleChart
                    w={parentWidth}
                    data={stockData}
                    indi_data={stockData}
                    news={news}
                    isAnswered={isAnswered}
                    showLine={showLine}
                  />
                ) : (
                  <div>문제가 없습니다.</div>
                )
              ) : (
                <FinanceTable
                  stock_code={problemData!.stock_code}
                  date={problemData!.date}
                />
              )}
            </div>

            {/* === 답변/피드백 === */}
            <div className="relative">
              {showFeedback && (
                <div className="w-full mb-3 p-4 rounded border border-[#396FFB] bg-[#f7fafd] text-black shadow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#396FFB]">
                      AI 피드백
                    </span>
                    <button
                      className="text-gray-400 hover:text-black text-xl"
                      onClick={() => setShowFeedback(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="whitespace-pre-line">{feedback}</div>
                </div>
              )}
            </div>

            {/* 답변 입력 */}
            <div className="mt-6 relative">
              <div className="font-semibold mb-2 flex items-center gap-2">
                답변 작성
                <span className="relative group cursor-pointer text-gray-400">
                  ⓘ
                  <div className="absolute bottom-full mb-2 left-0 w-max max-w-xs bg-black text-sm px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <b className="text-[#f4f4f4]">
                      차트, 거시경제, 뉴스 등을 참고해 예측을 구체적으로
                      입력하세요.
                    </b>
                  </div>
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="답변을 입력하세요"
                maxLength={300}
                className="w-full h-32 p-4 rounded border border-gray-600 bg-transparent resize-none focus:outline-none"
              />
              <div className="flex float-right items-center mt-2 gap-4">
                <span className="text-sm text-gray-400">
                  {input.length} / 300 자
                </span>
                <button
                  className="bg-[#396FFB] px-5 py-1.5 rounded text-sm"
                  onClick={handleGrade}
                  disabled={loading}
                >
                  {loading ? "채점 중..." : "제출"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
          <div className="flex justify-between">
            <ClickCard
              name="힌트"
              icon="hint.svg"
              onClick={() => setShowHint(true)}
            />
            <ClickCard
              name="답변 랭킹"
              icon="ranking.svg"
              onClick={() => router.push(`/ranking/practice`)}
            />
          </div>

          {/* 뉴스 */}
          <div className="mt-4">
            <p className="text-2xl font-semibold mb-3.5">관련 뉴스</p>
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto">
              {Array.isArray(news) && news.length > 0 ? (
                news
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1b1b1b] rounded-xl p-4 text-sm flex gap-4"
                    >
                      {item.img_url && (
                        <Image
                          src={item.img_url}
                          alt="뉴스 이미지"
                          width={80}
                          height={80}
                          className="rounded object-cover flex-shrink-0"
                          style={{ width: "80px", height: "80px" }}
                        />
                      )}
                      <div className="flex flex-col justify-between w-full">
                        <div>
                          <div className="font-semibold mb-1">
                            <a
                              href={item.news_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {item.title}
                            </a>
                          </div>
                          <div className="text-[#C7C7C7] text-xs font-thin line-clamp-2">
                            {item.context}
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs mt-2 self-end">
                          {item.date}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-gray-400 text-sm">뉴스가 없습니다.</div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {showHint && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 w-[530px] text-black shadow-2xl relative">
            <div className="text-lg font-bold mb-3">힌트</div>
            <div className="mb-4">
              {typeMeta?.typeData?.[0]?.hint || "힌트가 없습니다."}
            </div>
            <button
              className="absolute top-3 right-4 text-gray-400 text-xl"
              onClick={() => setShowHint(false)}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        hideProgressBar
        limit={3}
        toastStyle={{
          backgroundColor: "#366FFB",
          fontWeight: 600,
          color: "#FFFFFF",
        }}
      />
    </div>
  );
}
