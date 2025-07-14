type StockItem = {
  stock_code: string;
  company: string;
};

export async function getStock(): Promise<StockItem[]> {
  // 💡 더미 데이터
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { stock_code: "005930", company: "삼성전자" },
        { stock_code: "035420", company: "NAVER" },
        { stock_code: "035720", company: "카카오" },
        { stock_code: "000660", company: "SK하이닉스" },
        { stock_code: "000270", company: "기아" },
        { stock_code: "051910", company: "LG화학" },
      ]);
    }, 800); // 약간의 지연 시뮬레이션
  });
}

// 나중에 변경
// export async function getStock() {
//   try {
//     const res = await fetch(`http://localhost:3001/api/real`);
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.message || "연동불가");
//     }
//     const data = await res.json();
//     console.log(data);
//     const stocks = data.output1.map((item: any) => ({
//       stock_code: item.pdno,
//       company: item.prdt_name,
//     }));

//     return stocks;
//   } catch (err: any) {
//     return { message: err.message };
//   }
// }
