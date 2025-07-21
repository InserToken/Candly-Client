export async function fetchPracticeNews(problemId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/practice/${problemId}/news`
  );
  const data = await res.json();
  return data.news;
}
