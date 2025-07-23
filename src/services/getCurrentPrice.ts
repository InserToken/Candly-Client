export async function getCurrentPrice(stock_code: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/real/${stock_code}/currentprice`
  );
  const data = await res.json();
  return data.currentprice;
}
