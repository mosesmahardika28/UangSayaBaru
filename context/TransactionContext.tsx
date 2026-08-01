import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  initialBalance: number;
  balance?: number;
}

export interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  date: string;
  note: string;
  walletId: string;
  toWalletId?: string;
  isDebtRelated?: boolean; // <-- Flag penanda agar mudah dikecualikan di statistik
}

export interface CategoryItem {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  bg: string;
  budget?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  targetDate?: string;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  type: "lend" | "borrow"; // 'lend' = Piutang, 'borrow' = Utang
  dueDate: string;
  isPaid: boolean;
  walletId: string; // Dompet asal/tujuan saat utang dibuat
  transactionId?: string; // ID transaksi otomatis saat utang dibuat
  paidTransactionId?: string; // ID transaksi otomatis saat dilunasi
  note?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;

  categories: CategoryItem[];
  addCategory: (category: Omit<CategoryItem, "id">) => void;
  updateCategory: (id: string, category: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, "id">) => void;
  updateWallet: (id: string, wallet: Omit<Wallet, "id">) => void;
  deleteWallet: (id: string) => void;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "currentAmount">) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, walletId: string, amount: number) => void;
  withdrawFromGoal: (goalId: string, walletId: string, amount: number) => void;

  debts: Debt[];
  addDebt: (
    debt: Omit<Debt, "id" | "isPaid" | "transactionId">,
    walletId: string,
  ) => void;
  toggleDebtPaid: (id: string, paidWalletId?: string) => void;
  deleteDebt: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@uangsaya_transactions";
const CATEGORY_STORAGE_KEY = "@uangsaya_categories";
const BUDGET_STORAGE_KEY = "@uangsaya_monthly_budget";
const WALLET_STORAGE_KEY = "@uangsaya_wallets";
const GOAL_STORAGE_KEY = "@uangsaya_goals";
const DEBT_STORAGE_KEY = "@uangsaya_debts";

const defaultCategories: CategoryItem[] = [
  {
    id: "1",
    name: "Makan",
    type: "expense",
    icon: "restaurant-outline",
    color: "#0097A7",
    bg: "#E0F7FA",
    budget: 1500000,
  },
  {
    id: "2",
    name: "Transportasi",
    type: "expense",
    icon: "bus-outline",
    color: "#F57C00",
    bg: "#FFF3E0",
    budget: 500000,
  },
  {
    id: "3",
    name: "Belanja",
    type: "expense",
    icon: "cart-outline",
    color: "#E91E63",
    bg: "#FCE4EC",
    budget: 1000000,
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
    name: "Piutang",
    type: "expense",
    icon: "swap-horizontal",
    color: "#1E88E5",
    bg: "#E3F2FD",
  },
  {
    id: "10",
    name: "Utang",
    type: "income",
    icon: "swap-horizontal",
    color: "#E53935",
    bg: "#FFEBEE",
  },
  {
    id: "11",
    name: "Pelunasan Piutang",
    type: "income",
    icon: "checkmark-circle-outline",
    color: "#43A047",
    bg: "#E8F5E9",
  },
  {
    id: "12",
    name: "Pelunasan Utang",
    type: "expense",
    icon: "checkmark-circle-outline",
    color: "#E53935",
    bg: "#FFEBEE",
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(1500000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedWallets = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (storedWallets) setWallets(JSON.parse(storedWallets));

      const storedTx = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTx) setTransactions(JSON.parse(storedTx));

      const storedCat = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
      if (storedCat) setCategories(JSON.parse(storedCat));
      else
        await AsyncStorage.setItem(
          CATEGORY_STORAGE_KEY,
          JSON.stringify(defaultCategories),
        );

      const storedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (storedBudget) setMonthlyBudgetState(JSON.parse(storedBudget));

      const storedGoals = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      if (storedGoals) setGoals(JSON.parse(storedGoals));

      const storedDebts = await AsyncStorage.getItem(DEBT_STORAGE_KEY);
      if (storedDebts) setDebts(JSON.parse(storedDebts));
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

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

  const addCategory = async (newCat: Omit<CategoryItem, "id">) => {
    const category: CategoryItem = { ...newCat, id: Date.now().toString() };
    const updated = [...categories, category];
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateCategory = async (
    id: string,
    updatedFields: Partial<CategoryItem>,
  ) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, ...updatedFields } : c,
    );
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
  };

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
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updated));
  };

  const addGoal = async (newGoal: Omit<Goal, "id" | "currentAmount">) => {
    const goal: Goal = { ...newGoal, id: `g${Date.now()}`, currentAmount: 0 };
    const updated = [...goals, goal];
    setGoals(updated);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateGoal = async (id: string, updatedFields: Partial<Goal>) => {
    const updatedGoals = goals.map((g) =>
      g.id === id ? { ...g, ...updatedFields } : g,
    );
    setGoals(updatedGoals);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updatedGoals));
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const depositToGoal = async (
    goalId: string,
    walletId: string,
    amount: number,
  ) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedGoals = goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g,
    );
    setGoals(updatedGoals);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updatedGoals));
    await addTransaction({
      type: "expense",
      amount: amount,
      category: "Tabungan",
      date: new Date().toISOString(),
      note: `Nabung Target: ${goal.name}`,
      walletId: walletId,
    });
  };

  const withdrawFromGoal = async (
    goalId: string,
    walletId: string,
    amount: number,
  ) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const actualWithdraw = Math.min(amount, goal.currentAmount);
    const updatedGoals = goals.map((g) =>
      g.id === goalId
        ? { ...g, currentAmount: g.currentAmount - actualWithdraw }
        : g,
    );
    setGoals(updatedGoals);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updatedGoals));
    await addTransaction({
      type: "income",
      amount: actualWithdraw,
      category: "Pencairan Target",
      date: new Date().toISOString(),
      note: `Cairkan Target: ${goal.name}`,
      walletId: walletId,
    });
  };

  // Fungsi Utang Piutang dengan Flag isDebtRelated: true
  const addDebt = async (
    newDebt: Omit<Debt, "id" | "isPaid" | "transactionId">,
    walletId: string,
  ) => {
    const debtId = `d${Date.now()}`;
    const txId = `tx_debt_${Date.now()}`;

    const txType = newDebt.type === "lend" ? "expense" : "income";
    const categoryName = newDebt.type === "lend" ? "Piutang" : "Utang";
    const noteText =
      newDebt.type === "lend"
        ? `Piutang ke: ${newDebt.name}`
        : `Utang dari: ${newDebt.name}`;

    const newTransaction: Transaction = {
      id: txId,
      type: txType,
      amount: newDebt.amount,
      category: categoryName,
      date: new Date().toISOString(),
      note: newDebt.note ? `${noteText} (${newDebt.note})` : noteText,
      walletId: walletId,
      isDebtRelated: true, // <-- Ditandai sebagai transaksi utang piutang
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedTransactions),
    );

    const debt: Debt = {
      ...newDebt,
      id: debtId,
      walletId,
      isPaid: false,
      transactionId: txId,
    };

    const updatedDebts = [debt, ...debts];
    setDebts(updatedDebts);
    await AsyncStorage.setItem(DEBT_STORAGE_KEY, JSON.stringify(updatedDebts));
  };

  const toggleDebtPaid = async (id: string, paidWalletId?: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;

    let updatedTransactions = [...transactions];
    let newPaidTransactionId = debt.paidTransactionId;

    if (!debt.isPaid) {
      const txId = `tx_paid_${Date.now()}`;
      const targetWalletId = paidWalletId || debt.walletId;
      const txType = debt.type === "lend" ? "income" : "expense";
      const categoryName =
        debt.type === "lend" ? "Pelunasan Piutang" : "Pelunasan Utang";
      const noteText =
        debt.type === "lend"
          ? `Pelunasan piutang dari: ${debt.name}`
          : `Pelunasan utang ke: ${debt.name}`;

      const paymentTransaction: Transaction = {
        id: txId,
        type: txType,
        amount: debt.amount,
        category: categoryName,
        date: new Date().toISOString(),
        note: noteText,
        walletId: targetWalletId,
        isDebtRelated: true, // <-- Ditandai sebagai transaksi utang piutang
      };

      updatedTransactions = [paymentTransaction, ...updatedTransactions];
      newPaidTransactionId = txId;
    } else {
      if (debt.paidTransactionId) {
        updatedTransactions = updatedTransactions.filter(
          (t) => t.id !== debt.paidTransactionId,
        );
      }
      newPaidTransactionId = undefined;
    }

    setTransactions(updatedTransactions);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedTransactions),
    );

    const updatedDebts = debts.map((d) =>
      d.id === id
        ? { ...d, isPaid: !d.isPaid, paidTransactionId: newPaidTransactionId }
        : d,
    );
    setDebts(updatedDebts);
    await AsyncStorage.setItem(DEBT_STORAGE_KEY, JSON.stringify(updatedDebts));
  };

  const deleteDebt = async (id: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;

    const updatedTransactions = transactions.filter(
      (t) => t.id !== debt.transactionId && t.id !== debt.paidTransactionId,
    );
    setTransactions(updatedTransactions);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedTransactions),
    );

    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    await AsyncStorage.setItem(DEBT_STORAGE_KEY, JSON.stringify(updated));
  };

  const setMonthlyBudget = async (budget: number) => {
    setMonthlyBudgetState(budget);
    await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budget));
  };

  const walletsWithCalculatedBalance = wallets.map((wallet) => {
    let currentBalance = wallet.initialBalance;
    transactions.forEach((t) => {
      if (t.walletId === wallet.id) {
        if (t.type === "income") currentBalance += t.amount;
        if (t.type === "expense") currentBalance -= t.amount;
        if (t.type === "transfer") currentBalance -= t.amount;
      }
      if (t.toWalletId === wallet.id && t.type === "transfer")
        currentBalance += t.amount;
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
        updateCategory,
        deleteCategory,
        monthlyBudget,
        setMonthlyBudget,
        wallets: walletsWithCalculatedBalance,
        addWallet,
        updateWallet,
        deleteWallet,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        withdrawFromGoal,
        debts,
        addDebt,
        toggleDebtPaid,
        deleteDebt,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactions error");
  return context;
}
