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
  pid?: string;
  problem_id?: {
    _id?: string;
    title?: string;
    stock_code?: string;
    date?: string;
    problemtype: number;
  };
};

export type GetPracticeScore = {
  answer: string;
  user_id?: {
    nickname: string;
  };
  feedback?: string;
  score: number;
  logic: number;
  momentum: number;
  macroEconomy: number;
  marketIssues: number;
  quantEvidence: number;
  date: Date;
  problem_id?: string;
};
