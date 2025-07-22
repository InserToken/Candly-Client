export async function fetchFinancial(stockCode: string, date: string) {
  const replaceDate = date.replace(/-/g, ".");
  const res = await fetch(
    `http://localhost:3001/api/financial/metrics?stockCode=${stockCode}&date=${replaceDate}`
  );
  const data = await res.json();
  return data;
}
