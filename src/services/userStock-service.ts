// type StockItem = {
//   stock_code: string;
//   company: string;
// };

// export async function getStock(): Promise<StockItem[]> {
//   // 💡 더미 데이터
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve([
//         { stock_code: "005930", company: "삼성전자" },
//         { stock_code: "035420", company: "NAVER" },
//         { stock_code: "035720", company: "카카오" },
//         { stock_code: "000660", company: "SK하이닉스" },
//         { stock_code: "000270", company: "기아" },
//         { stock_code: "051910", company: "LG화학" },
//       ]);
//     }, 800); // 약간의 지연 시뮬레이션
//   });
// }

// 나중에 변경
export async function postStock(token: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/userStock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "연동불가");
    }
    const data = await res.json();
    console.log("service -> data.output1", data.output1);

    return data.output1 || [];
  } catch (err: any) {
    return { message: err.message };
  }
}

export async function checkUserStatus(token: string) {
  const res = await fetch("http://localhost:3001/api/userStock/status", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "상태 조회 실패");
  }

  return data; // { hasHoldings: true/false }
}
