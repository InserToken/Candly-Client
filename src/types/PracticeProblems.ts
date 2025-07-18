export interface PracticeProblems {
  _id: string;
  problemtype: number;
  stock_code: {
    _id: string;
    name: string;
    logo: string;
  };
  title: string;
  date: Date;
}
