import { promises } from "dns";

type PredictionItem = {
  date: string;
  close: number;
};

export default async function fetchRealInvest(
  stock_code: string,
  token: string
): Promise<{ prediction: PredictionItem[] }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/real/${stock_code}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `예측 조회 실패: ${errorData.error || response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("fetchRealInvest 에러:", err);
    throw err;
  }
}
