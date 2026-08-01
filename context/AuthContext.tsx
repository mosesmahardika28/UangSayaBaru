import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isLocked: boolean;
  hasPin: boolean;
  verifyPin: (pin: string) => boolean;
  setupPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
  unlockWithBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PIN_KEY = "@uangsaya_pin";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadPin();
  }, []);

  const loadPin = async () => {
    try {
      const pin = await AsyncStorage.getItem(PIN_KEY);
      if (pin) {
        setSavedPin(pin);
        setIsLocked(true); // Kunci aplikasi jika PIN sudah pernah dibuat
      }
    } catch (error) {
      console.error("Gagal memuat PIN", error);
    } finally {
      setIsReady(true);
    }
  };

  const setupPin = async (pin: string) => {
    await AsyncStorage.setItem(PIN_KEY, pin);
    setSavedPin(pin);
  };

  const removePin = async () => {
    await AsyncStorage.removeItem(PIN_KEY);
    setSavedPin(null);
    setIsLocked(false);
  };

  const verifyPin = (pin: string) => {
    if (pin === savedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const unlockWithBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Buka UangSaya",
        fallbackLabel: "Gunakan PIN",
        cancelLabel: "Batal",
      });

      if (result.success) {
        setIsLocked(false);
      }
    }
  };

  if (!isReady) return null; // Tahan render sampai status PIN selesai dicek

  return (
    <AuthContext.Provider
      value={{
        isLocked,
        hasPin: !!savedPin,
        verifyPin,
        setupPin,
        removePin,
        unlockWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
};
