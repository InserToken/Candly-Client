// user별 보유 주식 조회
export async function getPracticeList() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/practice`);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "연습 문제 전체 조회 실패");
  }
  console.log("연습문제 전체 조회", data);
  return data;
}
