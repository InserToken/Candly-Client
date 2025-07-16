export async function fetchPracticeNews(problemId: string) {
  const res = await fetch(
    `http://localhost:3001/api/practice/${problemId}/news`
  );
  const data = await res.json();
  return data.news;
}
