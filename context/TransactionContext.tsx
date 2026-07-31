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

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@uangsaya_transactions";

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1. Muat data saat aplikasi pertama kali dibuka
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setTransactions(JSON.parse(storedData));
      } else {
        // Data default jika penyimpanan masih kosong
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
    } catch (error) {
      console.error("Gagal memuat data transaksi:", error);
    }
  };

  // 2. Tambah transaksi dan simpan secara permanen
  const addTransaction = async (newTx: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTx,
      id: Date.now().toString(),
    };

    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedTransactions),
      );
    } catch (error) {
      console.error("Gagal menyimpan data transaksi:", error);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
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
