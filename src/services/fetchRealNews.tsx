export async function fetchRealNews(stock_code: string) {
  const res = await fetch(`http://localhost:3001/api/real/${stock_code}/news`);
  const data = await res.json();
  return data.newsdata;
}
