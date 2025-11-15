export type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  deleted: boolean;
};
