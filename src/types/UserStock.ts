export interface UserStock {
  _id: string;
  user_id: {
    _id: string;
    nickname: string;
  } | null;
  stock_code: {
    _id: string;
    name: string;
    logo: string;
  };
  cumulative_score: number;
}

export interface Stocks {
  _id: string;
  name: string;
  logo: string;
}
