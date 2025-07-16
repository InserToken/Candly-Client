export async function fetchPracticeProblem(problemId: string) {
  const res = await fetch(
    `http://localhost:3001/api/practice-problem/${problemId}`
  );
  return await res.json();
}
