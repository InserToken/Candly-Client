import { ChartData } from "@/components/charts/Mixedchart";
import { parseDateString, dateToString } from "./date";
import { format, isWeekend } from "date-fns";
import useHolidayStore from "@/stores/useHolidayStore";

export function interpolateBetween(
  start: ChartData,
  end: ChartData
): ChartData[] {
  const startDate = parseDateString(start.date);
  const endDate = parseDateString(end.date);

  const holidaySet = useHolidayStore.getState().holidaySet;
  if (!holidaySet) return []; // 아직 로딩 전이면 보간하지 않음

  // 시작일과 종료일 사이의 모든 날짜 수집 (exclusive)
  const allDates: Date[] = [];
  const current = new Date(startDate);

  while (current < endDate) {
    current.setDate(current.getDate() + 1);
    allDates.push(new Date(current));
  }

  // 영업일(주말, 공휴일 제외) 필터링
  const businessDates = allDates.filter((dateObj) => {
    const formatted = format(dateObj, "yyyy-MM-dd");
    return !holidaySet.has(formatted) && !isWeekend(dateObj);
  });

  if (businessDates.length === 0) return []; // 영업일 없으면 보간 없음

  // 영업일 개수 (중간 날짜 수)
  const businessDaysCount = businessDates.length;

  const result: ChartData[] = businessDates.map((dateObj, idx) => {
    // 영업일 기준 비율 계산
    const ratio = (idx + 1) / (businessDaysCount + 1);
    const interpolatedClose = Math.round(
      start.close! + (end.close! - start.close!) * ratio
    );

    return {
      date: dateToString(dateObj),
      close: interpolatedClose,
      type: "dot",
    };
  });

  return result;
}
