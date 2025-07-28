type PracticeScore = {
  user_id?: string; // <- optional로 변경, 내부에서 자동 채움
  problem_id: string;
  answer: string;
  score: number;
  feedback?: string;
  logic?: number;
  technical?: number;
  macroEconomy?: number;
  marketIssues?: number;
  quantEvidence?: number;
  date?: string;
};

export async function postPracticeScore(
  token: string | null,
  data: PracticeScore
) {
  //console.log("호출됨");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/practicescores`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "PracticeScore 등록 실패");
  }
  return await response.json();
}
