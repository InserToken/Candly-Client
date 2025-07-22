export async function gradeWithGemini(prompt: string, userAnswer: string) {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/gemini/grade`
      : "/api/gemini/grade",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        user_answer: userAnswer,
      }),
    }
  );

  if (!res.ok) throw new Error("Gemini 채점 실패");
  return await res.json();
}
