"use client";

import React, { useEffect, useState } from "react";

interface RowProps {
  name: string;
  keyName: string;
  value: string;
}

interface Section {
  title: string;
  rows: RowProps[];
}

export default function FinanceTable() {
  const [updatedData, setUpdatedData] = useState<Section[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      const deepCopiedData: Section[] = JSON.parse(JSON.stringify(financeData));

      const stockCode = deepCopiedData[0].rows.find(
        (row) => row.keyName === "stock_code"
      )?.value;
      const epsRaw = deepCopiedData[2].rows.find(
        (row) => row.keyName === "eps"
      )?.value;

      if (!stockCode || !epsRaw) return;

      const eps = parseFloat(epsRaw.replace(/,/g, ""));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/currentStock/stock-price?code=${stockCode}`
      );
      const json = await res.json();
      const price = json.price;

      if (!price || !eps) return;

      setCurrentPrice(price);
      const calculatedPER = (price / eps).toFixed(2);

      const investmentSection = deepCopiedData.find(
        (section) => section.title === "주당 및 투자 지표"
      );
      const perRow = investmentSection?.rows.find(
        (row) => row.keyName === "per"
      );

      if (perRow) {
        perRow.value = calculatedPER.toString();
      }

      setUpdatedData(deepCopiedData);
    };

    run();
  }, []);

  const renderSection = (section: Section) => (
    <div className="mb-6 min-w-[700px]" key={section.title}>
      <h3 className="text-xl font-bold mb-3">{section.title}</h3>
      <table className="w-full table-fixed border-collapse">
        <thead className="text-left text-gray-400">
          <tr>
            <th className="w-1/3 px-2 py-1">항목명</th>
            <th className="w-1/3 px-2 py-1">정보</th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, idx) => (
            <tr key={idx} className="border-t border-gray-700">
              <td className="px-2 py-2">{row.name}</td>
              <td className="px-2 py-2">{row.value}</td>
            </tr>
          ))}
          {/* 현재가 추가 표시 */}
          {section.title === "주당 및 투자 지표" && currentPrice !== null && (
            <tr className="border-t border-gray-700">
              <td className="px-2 py-2 font-bold">현재 주가</td>
              <td className="px-2 py-2 text-green-400">
                {currentPrice.toLocaleString()} 원
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full h-full overflow-x-auto bg-[#1b1b1b] rounded-lg text-sm text-white">
      <div className="p-6 min-w-[700px] max-h-full overflow-y-auto">
        {(updatedData.length > 0 ? updatedData : financeData).map(
          renderSection
        )}
      </div>
    </div>
  );
}

// 👉 기존 static financeData
const financeData: Section[] = [
  {
    title: "기본 정보",
    rows: [
      { name: "종목코드", keyName: "stock_code", value: "005930" },
      { name: "기업 고유 번호", keyName: "corp_code", value: "00123456" },
      { name: "접수번호", keyName: "rcpt_no", value: "20240516001421" },
      { name: "사업 연도", keyName: "bsns_year", value: "2024" },
      { name: "보고서 코드", keyName: "report_code", value: "11011" },
      { name: "보고서명", keyName: "report_name", value: "2024년 1분기" },
    ],
  },
  {
    title: "손익 지표",
    rows: [
      { name: "매출", keyName: "revenue", value: "75,000,000,000" },
      {
        name: "순이익(당기순이익)",
        keyName: "netProfit",
        value: "8,200,000,000",
      },
      {
        name: "(지배주주) 당기순이익",
        keyName: "netProfit_govern",
        value: "7,500,000,000",
      },
      {
        name: "(비지배주주) 당기순이익",
        keyName: "netProfit_non_govern",
        value: "700,000,000",
      },
      {
        name: "당기순이익(최근 4분기)",
        keyName: "profit",
        value: "8,200,000,000",
      },
    ],
  },
  {
    title: "주당 및 투자 지표",
    rows: [
      { name: "EPS (주당순이익)", keyName: "eps", value: "1,800" },
      { name: "BPS (주당순자산)", keyName: "bps", value: "28,400" },
      { name: "ROE (자기자본이익률)", keyName: "roe", value: "8.4%" },
      { name: "PER (주가수익비율)", keyName: "per", value: "12.3" },
      { name: "PBR (주가순자산비율)", keyName: "pbr", value: "1.15" },
      { name: "PSR (주가매출비율)", keyName: "psr", value: "0.95" },
    ],
  },
];
