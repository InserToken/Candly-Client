// 계좌 연동하기 버튼 입력 시 db에 보유 주식 저장
export async function postStock(token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/userStock`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      }
    );
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

// 보유 주식 여부
export async function checkUserStatus(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/userStock/status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "상태 조회 실패");
  }

  return data;
}

// user별 보유 주식 조회
export async function getStock(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/userStock/stock`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "보유 주식 조회 실패");
  }

  return data;
}

// 종목별 보유 주식 DB 조회
export async function getRanking() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/userStock`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "보유 주식 조회 실패");
  }

  return data;
}
