import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type BudgetPeriod = "monthly" | "custom" | "yearly";

export interface Budget {
  amount: number;
  period: BudgetPeriod;
  durationMonths?: number;
  startDate: string;
}

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
  isDebtRelated?: boolean;
  goalId?: string; // Melacak riwayat transaksi khusus target impian
}

export interface CategoryItem {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  bg: string;
  budget?: number;
  budgetPeriod?: "weekly" | "monthly" | "custom";
  budgetDuration?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  type: "lend" | "borrow";
  dueDate: string;
  isPaid: boolean;
  walletId: string;
  transactionId?: string;
  paidTransactionId?: string;
  note?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Omit<Transaction, "id">,
  ) => Promise<void>;
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
  depositToGoal: (
    goalId: string,
    walletId: string,
    amount: number,
  ) => Promise<void>;
  withdrawFromGoal: (
    goalId: string,
    walletId: string,
    amount: number,
  ) => Promise<void>;

  debts: Debt[];
  addDebt: (
    debt: Omit<Debt, "id" | "isPaid" | "transactionId">,
    walletId: string,
  ) => void;
  toggleDebtPaid: (id: string, paidWalletId?: string) => void;
  deleteDebt: (id: string) => void;

  budget: Budget;
  setBudget: (budget: Budget) => void;
  isTransactionWithinBudgetPeriod: (transactionDate: string) => boolean;
  resetAppData: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

const BUDGET_CONFIG_KEY = "@uangsaya_budget_config";
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
    budgetPeriod: "monthly",
  },
  {
    id: "2",
    name: "Transportasi",
    type: "expense",
    icon: "bus-outline",
    color: "#F57C00",
    bg: "#FFF3E0",
    budget: 500000,
    budgetPeriod: "monthly",
  },
  {
    id: "3",
    name: "Belanja",
    type: "expense",
    icon: "cart-outline",
    color: "#E91E63",
    bg: "#FCE4EC",
    budget: 1000000,
    budgetPeriod: "monthly",
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

  const [budget, setBudgetState] = useState<Budget>({
    amount: 1500000,
    period: "monthly",
    startDate: new Date().toISOString().split("T")[0],
  });

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

      const storedBudgetConfig = await AsyncStorage.getItem(BUDGET_CONFIG_KEY);
      if (storedBudgetConfig) setBudgetState(JSON.parse(storedBudgetConfig));

      const storedGoals = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      if (storedGoals) setGoals(JSON.parse(storedGoals));

      const storedDebts = await AsyncStorage.getItem(DEBT_STORAGE_KEY);
      if (storedDebts) setDebts(JSON.parse(storedDebts));
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  const resetAppData = async () => {
    try {
      await AsyncStorage.clear();
      setTransactions([]);
      setCategories(defaultCategories);
      setWallets(defaultWallets);
      setGoals([]);
      setDebts([]);
      setMonthlyBudgetState(1500000);
      setBudget({
        amount: 1500000,
        period: "monthly",
        startDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Gagal mereset aplikasi:", error);
    }
  };

  const setBudget = async (newBudget: Budget) => {
    setBudgetState(newBudget);
    await AsyncStorage.setItem(BUDGET_CONFIG_KEY, JSON.stringify(newBudget));
  };

  const isTransactionWithinBudgetPeriod = (transactionDate: string) => {
    const tDate = new Date(transactionDate);
    const startDate = new Date(budget.startDate);

    if (budget.period === "monthly") {
      return (
        tDate.getMonth() === startDate.getMonth() &&
        tDate.getFullYear() === startDate.getFullYear()
      );
    } else if (budget.period === "yearly") {
      return tDate.getFullYear() === startDate.getFullYear();
    } else if (budget.period === "custom" && budget.durationMonths) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + budget.durationMonths);
      return tDate >= startDate && tDate <= endDate;
    }
    return true;
  };

  // Hitung saldo dompet berdasarkan riwayat transaksi
  const getWalletBalance = (walletId: string, excludeTxId?: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return 0;
    let currentBalance = wallet.initialBalance;
    transactions.forEach((t) => {
      if (excludeTxId && t.id === excludeTxId) return;
      if (t.walletId === walletId) {
        if (t.type === "income") currentBalance += t.amount;
        if (t.type === "expense") currentBalance -= t.amount;
        if (t.type === "transfer") currentBalance -= t.amount;
      }
      if (t.toWalletId === walletId && t.type === "transfer")
        currentBalance += t.amount;
    });
    return currentBalance;
  };

  const addTransaction = async (newTx: Omit<Transaction, "id">) => {
    // Pengecekan saldo diabaikan jika transaksi keluar dari dompet virtual sistem (pencairan goal)
    if (newTx.type === "expense" || newTx.type === "transfer") {
      if (newTx.walletId !== "system_goal") {
        const currentBal = getWalletBalance(newTx.walletId);
        if (currentBal < newTx.amount) {
          return Promise.reject(
            new Error("Saldo dompet tidak mencukupi! Saldo tidak boleh minus."),
          );
        }
      }
    }
    const transaction: Transaction = { ...newTx, id: Date.now().toString() };
    const updated = [transaction, ...transactions];
    setTransactions(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateTransaction = async (
    id: string,
    updatedTx: Omit<Transaction, "id">,
  ) => {
    if (updatedTx.type === "expense" || updatedTx.type === "transfer") {
      if (updatedTx.walletId !== "system_goal") {
        const currentBal = getWalletBalance(updatedTx.walletId, id);
        if (currentBal < updatedTx.amount) {
          return Promise.reject(
            new Error("Saldo dompet tidak mencukupi! Saldo tidak boleh minus."),
          );
        }
      }
    }
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

  // MENABUNG: Transfer dari Dompet Asli -> Ke Dompet Virtual Sistem (Target)
  const depositToGoal = async (
    goalId: string,
    walletId: string,
    amount: number,
  ) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    // Cek saldo dompet asal mencukupi atau tidak
    const currentBal = getWalletBalance(walletId);
    if (currentBal < amount) {
      return Promise.reject(
        new Error("Saldo dompet tidak mencukupi untuk menabung!"),
      );
    }

    const updatedGoals = goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g,
    );
    setGoals(updatedGoals);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updatedGoals));

    // Catat transaksi transfer dengan menyematkan goalId
    await addTransaction({
      type: "transfer",
      amount: amount,
      category: "Tabungan",
      date: new Date().toISOString(),
      note: `Menabung ke Target: ${goal.name}`,
      walletId: walletId,
      toWalletId: "system_goal",
      goalId: goalId,
    });
  };

  // MENCAIRKAN: Transfer dari Dompet Virtual Sistem -> Ke Dompet Asli Pilihan
  const withdrawFromGoal = async (
    goalId: string,
    walletId: string,
    amount: number,
  ) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    if (goal.currentAmount <= 0) {
      return Promise.reject(new Error("Saldo target impian masih kosong!"));
    }

    const actualWithdraw = Math.min(amount, goal.currentAmount);

    const updatedGoals = goals.map((g) =>
      g.id === goalId
        ? { ...g, currentAmount: g.currentAmount - actualWithdraw }
        : g,
    );
    setGoals(updatedGoals);
    await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updatedGoals));

    // Catat transaksi transfer pencairan dengan menyematkan goalId
    await addTransaction({
      type: "transfer",
      amount: actualWithdraw,
      category: "Pencairan Target",
      date: new Date().toISOString(),
      note: `Cairkan Target: ${goal.name}`,
      walletId: "system_goal",
      toWalletId: walletId,
      goalId: goalId,
    });
  };

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
      isDebtRelated: true,
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
        isDebtRelated: true,
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

  const setMonthlyBudget = async (budgetVal: number) => {
    setMonthlyBudgetState(budgetVal);
    await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetVal));
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
        budget,
        setBudget,
        isTransactionWithinBudgetPeriod,
        resetAppData,
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
