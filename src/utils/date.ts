import useHolidayStore from "@/stores/useHolidayStore";

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

// 날짜 문자열 유효성 검사 (형식 + 존재 여부)
export function isValidDateString(dateStr: string): boolean {
  const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!datePattern.test(dateStr)) return false;

  const dateObj = parseDateString(dateStr);
  return dateToString(dateObj) === dateStr;
}

// 다음 영업일
export function getNextDateString(dateStr?: string): string {
  if (!dateStr) return "2025-01-01";

  const holidaySet = useHolidayStore.getState().holidaySet;
  if (!holidaySet) return dateStr; // 로딩 전이면 변경하지 않음

  let currentDate = parseDateString(dateStr);

  while (true) {
    currentDate.setDate(currentDate.getDate() + 1);
    const formatted = dateToString(currentDate);
    if (!holidaySet.has(formatted)) {
      return formatted;
    }
  }
}

// 예측 가능 연도 제한
export function isBeforeYearLimit(dateStr: string, maxYear: number): boolean {
  const dateObj = parseDateString(dateStr);
  return dateObj.getFullYear() <= maxYear;
}

// 영업일 여부
export function isValidTradingDate(date: string): boolean {
  const holidaySet = useHolidayStore.getState().holidaySet;
  if (!holidaySet) return false; // 아직 로딩 전이면 false 처리
  return !holidaySet.has(date); // 휴일이 아니면 true
}
