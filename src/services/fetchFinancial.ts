export async function fetchFinancial(stockCode: string, date: string) {
  const replaceDate = date.replace(/-/g, ".");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/financial/metrics?stockCode=${stockCode}&date=${replaceDate}`
  );
  const data = await res.json();
  return data;
}
