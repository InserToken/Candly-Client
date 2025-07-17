import { ChartData } from "@/components/charts/Mixedchart";
import { parseDateString, dateToString } from "./date";
import { format } from "date-fns";
import useHolidayStore from "@/stores/useHolidayStore";

export function interpolateBetween(
  start: ChartData,
  end: ChartData
): ChartData[] {
  const startDate = parseDateString(start.date);
  const endDate = parseDateString(end.date);

  const holidaySet = useHolidayStore.getState().holidaySet;
  if (!holidaySet) return []; // 아직 로딩 전이면 보간하지 않음

  // 총 유효일 수 계산 (휴일 제외)
  const interpolatedDates: Date[] = [];
  const current = new Date(startDate);

  while (current < endDate) {
    current.setDate(current.getDate() + 1);
    const formatted = format(current, "yyyy-MM-dd");
    if (!holidaySet.has(formatted) && current < endDate) {
      interpolatedDates.push(new Date(current));
    }
  }

  const result: ChartData[] = interpolatedDates.map((dateObj, idx) => {
    const ratio = (idx + 1) / (interpolatedDates.length + 1);
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
