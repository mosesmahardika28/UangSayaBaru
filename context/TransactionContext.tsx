import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  initialBalance: number;
  balance?: number; // Saldo yang dihitung otomatis
}

export interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer"; // Ditambah jenis transfer
  amount: number;
  category: string;
  date: string;
  note: string;
  walletId: string; // Wajib: Dompet sumber dana
  toWalletId?: string; // Opsional: Hanya untuk transfer (Dompet tujuan)
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
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, "id">) => void;
  updateWallet: (id: string, wallet: Omit<Wallet, "id">) => void;
  deleteWallet: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@uangsaya_transactions";
const CATEGORY_STORAGE_KEY = "@uangsaya_categories";
const BUDGET_STORAGE_KEY = "@uangsaya_monthly_budget";
const WALLET_STORAGE_KEY = "@uangsaya_wallets";

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
    name: "Belanja",
    type: "expense",
    icon: "cart-outline",
    color: "#E91E63",
    bg: "#FCE4EC",
  },
  {
    id: "8",
    name: "Gaji",
    type: "income",
    icon: "wallet-outline",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
];

const defaultWallets: Wallet[] = [
  {
    id: "w1",
    name: "Tunai",
    icon: "wallet",
    color: "#43A047",
    initialBalance: 0,
  },
  {
    id: "w2",
    name: "Rekening BCA",
    icon: "card",
    color: "#1E88E5",
    initialBalance: 0,
  },
  {
    id: "w3",
    name: "GoPay",
    icon: "phone-portrait",
    color: "#0097A7",
    initialBalance: 0,
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
  const [wallets, setWallets] = useState<Wallet[]>(defaultWallets);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(1500000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load Dompet
      const storedWallets = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (storedWallets) {
        setWallets(JSON.parse(storedWallets));
      } else {
        await AsyncStorage.setItem(
          WALLET_STORAGE_KEY,
          JSON.stringify(defaultWallets),
        );
      }

      // Load Transaksi & Migrasi Data Lama
      const storedTx = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTx) {
        const parsedTx: any[] = JSON.parse(storedTx);
        // Jika ada transaksi lama yang belum punya walletId, masukkan ke Dompet Tunai ("w1")
        const migratedTx: Transaction[] = parsedTx.map((t) => ({
          ...t,
          walletId: t.walletId || "w1",
        }));
        setTransactions(migratedTx);

        // Simpan ulang jika ada migrasi
        if (parsedTx.some((t) => !t.walletId)) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migratedTx));
        }
      }

      // Load Kategori
      const storedCat = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
      if (storedCat) {
        setCategories(JSON.parse(storedCat));
      } else {
        await AsyncStorage.setItem(
          CATEGORY_STORAGE_KEY,
          JSON.stringify(defaultCategories),
        );
      }

      // Load Anggaran
      const storedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (storedBudget) {
        setMonthlyBudgetState(JSON.parse(storedBudget));
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  // --- CRUD TRANSAKSI ---
  const addTransaction = async (newTx: Omit<Transaction, "id">) => {
    const transaction: Transaction = { ...newTx, id: Date.now().toString() };
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
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedTransactions),
    );
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // --- CRUD KATEGORI ---
  const addCategory = async (newCat: Omit<CategoryItem, "id">) => {
    const category: CategoryItem = { ...newCat, id: Date.now().toString() };
    const updated = [...categories, category];
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

  // --- CRUD DOMPET ---
  const addWallet = async (newWallet: Omit<Wallet, "id">) => {
    const wallet: Wallet = { ...newWallet, id: `w${Date.now()}` };
    const updated = [...wallets, wallet];
    setWallets(updated);
    await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateWallet = async (
    id: string,
    updatedWallet: Omit<Wallet, "id">,
  ) => {
    const updatedWallets = wallets.map((w) =>
      w.id === id ? { ...updatedWallet, id } : w,
    );
    setWallets(updatedWallets);
    await AsyncStorage.setItem(
      WALLET_STORAGE_KEY,
      JSON.stringify(updatedWallets),
    );
  };

  const deleteWallet = async (id: string) => {
    // Opsional: Anda bisa tambahkan validasi agar tidak bisa dihapus jika ada transaksi
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updated));
  };

  const setMonthlyBudget = async (budget: number) => {
    setMonthlyBudgetState(budget);
    await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budget));
  };

  // --- PERHITUNGAN SALDO OTOMATIS (REAL-TIME) ---
  const walletsWithCalculatedBalance = wallets.map((wallet) => {
    let currentBalance = wallet.initialBalance;

    transactions.forEach((t) => {
      // Jika dompet ini adalah SUMBER DANA
      if (t.walletId === wallet.id) {
        if (t.type === "income") currentBalance += t.amount;
        if (t.type === "expense") currentBalance -= t.amount;
        if (t.type === "transfer") currentBalance -= t.amount; // Uang keluar dari dompet ini
      }
      // Jika dompet ini adalah TUJUAN TRANSFER
      if (t.toWalletId === wallet.id && t.type === "transfer") {
        currentBalance += t.amount; // Uang masuk ke dompet ini
      }
    });

    return { ...wallet, balance: currentBalance };
  });

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
        wallets: walletsWithCalculatedBalance, // Mengirimkan dompet beserta saldonya
        addWallet,
        updateWallet,
        deleteWallet,
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
