export type ProblemScore = {
  answer: string;
  feedback?: string;
  score: number;
  logic: number;
  momentum: number;
  macroEconomy: number;
  marketIssues: number;
  quantEvidence: number;
  date: Date;
  title?: string;

  problem_id?: {
    title?: string;
    stock_code?: string;
    date?: string;
  };
};
