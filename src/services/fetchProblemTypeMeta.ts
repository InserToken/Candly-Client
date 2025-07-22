export async function fetchProblemTypeMeta(problemTypeId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/practice/type/${problemTypeId}`
  );
  if (!res.ok) throw new Error("문제 유형 정보를 불러올 수 없습니다.");
  const data = await res.json();
  console.log("data", data);
  return data; // { hint, reference, prompting }
}
