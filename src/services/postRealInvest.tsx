type Prediction = {
  date: string;
  close: number;
};

export default async function postRealInvest(
  stock_code: string,
  token: string,
  prediction: Prediction[]
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/real/${stock_code}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        predictions: prediction.map(({ date, close }) => ({ date, close })),
      }),
    }
  );
  if (!response.ok) {
    throw new Error("서버에 예측값 전송 실패");
  }
  return await response.json();
}
