export type AccountKind =
  | "bills"
  | "spending"
  | "savings"
  | "investment"
  | "other";

export type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  monthly_income: number;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Account = {
  id: string;
  user_id: string;
  kind: AccountKind;
  name: string;
  allocation: number;
  balance: number;
  is_card: boolean;
  archived: boolean;
  position: number;
  plaid_account_id: string | null;
  bank_link_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  merchant: string;
  category: string;
  amount: number;
  note: string | null;
  posted_at: string;
  external_source: string | null;
  external_id: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type BankLink = {
  id: string;
  user_id: string;
  provider: string;
  plaid_item_id: string;
  access_token_encrypted: string;
  cursor: string | null;
  institution_id: string | null;
  institution_name: string | null;
  status: "active" | "login_required" | "revoked";
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};
