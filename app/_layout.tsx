import { Stack } from "expo-router";
import LockScreen from "../components/LockScreen";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TransactionProvider } from "../context/TransactionContext";

// Komponen perantara untuk mengecek status kunci
function RootLayoutNav() {
  const { isLocked } = useAuth();

  // Jika terkunci, tampilkan layar PIN (menutupi seluruh aplikasi)
  if (isLocked) {
    return <LockScreen />;
  }

  // Jika tidak terkunci, jalankan aplikasi normal
  return (
    <TransactionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* Tambahkan screen lain di sini jika ada */}
      </Stack>
    </TransactionProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
