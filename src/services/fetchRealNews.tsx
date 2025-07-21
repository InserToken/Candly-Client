export async function fetchRealNews(stock_code: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/real/${stock_code}/news`
  );
  const data = await res.json();
  return data.newsdata;
}
