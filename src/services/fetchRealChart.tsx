export async function fetchRealChart(stock_code: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/real/${stock_code}/chart`
  );
  const data = await res.json();
  return data.prices;
}
