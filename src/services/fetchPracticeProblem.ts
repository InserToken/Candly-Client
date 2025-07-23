export async function fetchPracticeProblem(problemId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/practice/${problemId}`
  );
  return await res.json();
}
