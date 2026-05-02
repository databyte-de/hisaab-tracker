export type Category = "tab" | "on_the_house";

export interface Entry {
  id: string;
  category: Category;
  person_name: string;
  purpose: string;
  amount: number;
  note: string | null;
  date: string | null;
  is_settled: boolean;
  created_at: string;
  // Included relation array for joins
  repayments?: Repayment[];
}

export interface Repayment {
  id: string;
  entry_id: string;
  amount_received: number;
  note: string | null;
  date: string | null;
  created_at: string;
}

export interface CategorySummary {
  category: Category;
  total: number;
}
