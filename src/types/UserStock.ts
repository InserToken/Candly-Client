interface UserStock {
  _id: string;
  user_id: {
    _id: string;
    nickname: string;
  } | null;
  stock_code: {
    _id: string;
    name: string;
  };
  cumulative_score: number;
}

export interface Stocks {
  _id: string;
  name: string;
}
