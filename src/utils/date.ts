// "2025-01-08" → Date 객체
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Date 객체 → "2025-01-08"
export function dateToString(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "2025-01-08" → 다음날 "2025-01-09"
export function getNextDateString(dateStr?: string) {
  if (!dateStr) return "2025-01-01"; // 기본값 혹은 오류 방지용
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}
