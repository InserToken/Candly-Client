export async function fetchMyPracticeAnswer(currentProblemId: string) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/rank/practice`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();

  // null/undefined 방지
  const solved = data.data?.find(
    (item) => item.problem_id && item.problem_id._id === currentProblemId
  );

  return solved || null;
}
