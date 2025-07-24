// services/fetchMyPageInvest.ts
export default async function fetchMyPageInvest(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/myPage/real/scores`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("실전투자 데이터를 불러오는 데 실패했습니다.");
  }

  const data = await res.json();
  return data.data; // [{ stock_code, stock_id, scores: [...] }]
}
