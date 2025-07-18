/**
 * 이동평균(MA) 계산 함수
 * @param data   {Array<{close: number}>} - 가격 데이터 배열 (각 원소에 close 속성 필요)
 * @param period {number} - 이동평균 기간 (예: 20, 60, 120)
 * @returns      {Array<number|null>} - 이동평균 값 (period-1까지는 null)
 */

export function getMovingAverage(
  data: { close: number }[],
  period: number
): (number | null)[] {
  if (!Array.isArray(data)) return [];
  return data.map((d, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((acc, cur) => acc + cur.close, 0) / period;
    return avg;
  });
}
