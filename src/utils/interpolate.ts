import { ChartData } from "@/components/charts/Mixedchart";
import { parseDateString, dateToString } from "./date";

export function interpolateBetween(
  start: ChartData,
  end: ChartData
): ChartData[] {
  const startDate = parseDateString(start.date);
  const endDate = parseDateString(end.date);
  const daysDiff =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const result: ChartData[] = [];

  for (let i = 1; i < daysDiff; i++) {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    result.push({
      date: dateToString(newDate),
      close: Math.round(
        start.close! + ((end.close! - start.close!) * i) / daysDiff
      ),
      type: "dot",
    });
  }

  return result;
}
