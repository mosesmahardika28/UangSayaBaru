import { Stack } from "expo-router";
import React from "react";
// Import Provider dari folder context (mundur satu folder dari app)
import { TransactionProvider } from "../context/TransactionContext";

export default function RootLayout() {
  return (
    <TransactionProvider>
      <Stack
        screenOptions={{
          headerShown: false, // Menyembunyikan header bawaan layar
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </TransactionProvider>
  );
}
