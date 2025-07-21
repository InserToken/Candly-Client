/**
 * 이동평균(MA) 계산 함수
 * @param data   {Array<{close: number}>} - 가격 데이터 배열 (각 원소에 close 속성 필요)
 * @param period {number} - 이동평균 기간 (예: 20, 60, 120)
 * @returns      {Array<number|null>} - 이동평균 값 (period-1까지는 null)
 */
import { RSI } from "technicalindicators";

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

export function getRSI(
  data: { close: number }[],
  period = 14
): (number | null)[] {
  if (!Array.isArray(data) || data.length < period + 1)
    return Array(data.length).fill(null);

  const result: (number | null)[] = Array(period).fill(null);

  // 1. 첫 period개 변화량 누적
  let gainSum = 0,
    lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gainSum += diff;
    else lossSum -= diff; // diff < 0 이면 -diff가 양수
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + rs)); // period번째

  // 2. 나머지는 Smoothed 방식
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

export function libraryRSI(
  data: { close: number }[],
  period: number = 14
): (number | null)[] {
  const closeArr = data.map((d) => d.close);
  const rsiArr = RSI.calculate({ values: closeArr, period });
  // rsiArr의 길이는 data.length - (period-1)
  // 앞부분을 null로 채워서 원본 길이와 맞춤
  const nulls = Array(period - 1).fill(null);
  return [...nulls, ...rsiArr];
}

export function getBollingerBands(data, period = 20, k = 2) {
  if (!Array.isArray(data)) return [];
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ middle: null, upper: null, lower: null });
      continue;
    }
    const window = data.slice(i - period + 1, i + 1).map((d) => d.close);
    // 기준선 (SMA)
    const mean = window.reduce((acc, v) => acc + v, 0) / period;
    // 표준편차 (Python과 맞추기 위해 분모를 period - 1)
    const std = Math.sqrt(
      window.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (period - 1)
    );

    result.push({
      middle: mean,
      upper: mean + k * std,
      lower: mean - k * std,
    });
  }
  return result;
}
