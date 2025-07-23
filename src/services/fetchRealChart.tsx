export async function fetchRealChart(stock_code: string) {
  const res = await fetch(`http://localhost:3001/api/real/${stock_code}/chart`);
  const data = await res.json();
  return data.prices;
}
