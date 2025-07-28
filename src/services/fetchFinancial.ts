export async function fetchFinancial(stockCode: string, date: string) {
  const replaceDate = date.replace(/-/g, ".");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/financial/metrics?stockCode=${stockCode}&date=${replaceDate}`
  );

  if (!res.ok) {
    throw new Error("재무 정보를 불러오는 데 실패했습니다.");
  }

  return res.json();
}
