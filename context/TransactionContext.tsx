import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  bg: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  categories: CategoryItem[];
  addCategory: (category: Omit<CategoryItem, "id">) => void;
  deleteCategory: (id: string) => void;
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@uangsaya_transactions";
const CATEGORY_STORAGE_KEY = "@uangsaya_categories";
const BUDGET_STORAGE_KEY = "@uangsaya_monthly_budget";

const defaultCategories: CategoryItem[] = [
  {
    id: "1",
    name: "Makan",
    type: "expense",
    icon: "restaurant-outline",
    color: "#0097A7",
    bg: "#E0F7FA",
  },
  {
    id: "2",
    name: "Transportasi",
    type: "expense",
    icon: "bus-outline",
    color: "#F57C00",
    bg: "#FFF3E0",
  },
  {
    id: "3",
    name: "Kuliah",
    type: "expense",
    icon: "school-outline",
    color: "#388E3C",
    bg: "#E8F5E9",
  },
  {
    id: "4",
    name: "Belanja",
    type: "expense",
    icon: "cart-outline",
    color: "#E91E63",
    bg: "#FCE4EC",
  },
  {
    id: "5",
    name: "Hiburan",
    type: "expense",
    icon: "game-controller-outline",
    color: "#673AB7",
    bg: "#EDE7F6",
  },
  {
    id: "6",
    name: "Kesehatan",
    type: "expense",
    icon: "medical-outline",
    color: "#F44336",
    bg: "#FFEBEE",
  },
  {
    id: "7",
    name: "Lainnya",
    type: "expense",
    icon: "ellipsis-horizontal-outline",
    color: "#757575",
    bg: "#EEEEEE",
  },
  {
    id: "8",
    name: "Gaji",
    type: "income",
    icon: "wallet-outline",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    id: "9",
    name: "Bonus",
    type: "income",
    icon: "gift-outline",
    color: "#F9A825",
    bg: "#FFF9C4",
  },
  {
    id: "10",
    name: "Investasi",
    type: "income",
    icon: "trending-up-outline",
    color: "#1565C0",
    bg: "#E3F2FD",
  },
  {
    id: "11",
    name: "Lainnya",
    type: "income",
    icon: "ellipsis-horizontal-outline",
    color: "#757575",
    bg: "#EEEEEE",
  },
];

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] =
    useState<CategoryItem[]>(defaultCategories);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(1500000); // Default anggaran Rp 1.5jt

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedTx = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTx) {
        setTransactions(JSON.parse(storedTx));
      } else {
        const initialData: Transaction[] = [
          {
            id: "1",
            type: "income",
            amount: 2500000,
            category: "Gaji",
            date: new Date().toISOString(),
            note: "Gaji bulan ini",
          },
        ];
        setTransactions(initialData);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }

      const storedCat = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
      if (storedCat) {
        setCategories(JSON.parse(storedCat));
      } else {
        await AsyncStorage.setItem(
          CATEGORY_STORAGE_KEY,
          JSON.stringify(defaultCategories),
        );
      }

      const storedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (storedBudget) {
        setMonthlyBudgetState(JSON.parse(storedBudget));
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  const addTransaction = async (newTx: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTx,
      id: Date.now().toString(),
    };
    const updated = [transaction, ...transactions];
    setTransactions(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateTransaction = async (
    id: string,
    updatedTx: Omit<Transaction, "id">,
  ) => {
    const updatedTransactions = transactions.map((t) =>
      t.id === id ? { ...updatedTx, id } : t,
    );
    setTransactions(updatedTransactions);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedTransactions),
      );
    } catch (error) {
      console.error("Gagal memperbarui transaksi:", error);
    }
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addCategory = async (newCat: Omit<CategoryItem, "id">) => {
    const category: CategoryItem = {
      ...newCat,
      id: Date.now().toString(),
    };
    const updated = [...categories, category];
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const setMonthlyBudget = async (budget: number) => {
    setMonthlyBudgetState(budget);
    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budget));
    } catch (error) {
      console.error("Gagal menyimpan anggaran:", error);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        addCategory,
        deleteCategory,
        monthlyBudget,
        setMonthlyBudget,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactions harus digunakan di dalam TransactionProvider",
    );
  }
  return context;
}
