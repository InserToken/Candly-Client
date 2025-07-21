// 내가 푼 문제 조회
export async function getRankPracProblem(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/rank/practice`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "내가 푼 문제 조회 실패");
  }
  return data;
}

// 문제별 점수 조회
export async function getRankPracScore() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/rank/problem`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "문제별 점수 조회 실패");
  }

  return data;
}
