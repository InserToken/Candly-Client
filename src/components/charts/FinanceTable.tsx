"use client";

import React from "react";

interface RowProps {
  name: string;
  keyName: string;
  value: string;
}

const financeData = [
  {
    title: "기본 정보",
    rows: [
      { name: "종목코드", keyName: "stock_code", value: "005930" },
      { name: "기업 고유 번호", keyName: "corp_code", value: "00123456" },
      { name: "접수번호", keyName: "rcpt_no", value: "20240516001421" },
      { name: "사업 연도", keyName: "bsns_year", value: "2024" },
      { name: "보고서 코드", keyName: "report_code", value: "11011" },
      { name: "보고서명", keyName: "report_name", value: "2024년 1분기" },
      {
        name: "재무제표 요약",
        keyName: "summary",
        value: "전년 대비 매출 증가",
      },
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

const renderSection = (section: { title: string; rows: RowProps[] }) => (
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
      </tbody>
    </table>
  </div>
);

export default function FinanceTable() {
  return (
    <div className="w-full h-full overflow-x-auto bg-[#1b1b1b] rounded-lg text-sm text-white">
      <div className="p-6 min-w-[700px] max-h-full overflow-y-auto">
        {financeData.map(renderSection)}
      </div>
    </div>
  );
}
