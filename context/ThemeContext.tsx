import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  card: string;
  textMain: string;
  textMuted: string;
  border: string;
  primary: string;
  danger: string;
  incomeBg: string;
  expenseBg: string;
  incomeText: string;
  expenseText: string;
  transfer: string;
  accent: string;
}

const lightColors: ThemeColors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  border: "#EEEEEE",
  primary: "#43A047",
  danger: "#E53935",
  incomeBg: "#E8F5E9",
  expenseBg: "#FFEBEE",
  incomeText: "#2E7D32",
  expenseText: "#C62828",
  transfer: "#1E88E5",
  accent: "#F57C00",
};

const darkColors: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  textMain: "#E0E0E0",
  textMuted: "#A0A0A0",
  border: "#2C2C2C",
  primary: "#66BB6A",
  danger: "#EF5350",
  incomeBg: "#1B3E2B",
  expenseBg: "#3E1E1E",
  incomeText: "#81C784",
  expenseText: "#E57373",
  transfer: "#64B5F6",
  accent: "#FFB74D",
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = "@uangsaya_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }
    } catch (e) {
      console.error("Gagal memuat tema:", e);
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    await setTheme(newTheme);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }
  return context;
}
