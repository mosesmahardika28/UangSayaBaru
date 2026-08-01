import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function LockScreen() {
  const { verifyPin, unlockWithBiometrics } = useAuth();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  // Otomatis minta sidik jari saat layar kunci muncul
  useEffect(() => {
    unlockWithBiometrics();
  }, []);

  const handlePress = (val: string | number) => {
    if (val === "delete") {
      setInput((prev) => prev.slice(0, -1));
      setError(false);
    } else if (val === "biometric") {
      unlockWithBiometrics();
    } else {
      if (input.length < 4) {
        const newVal = input + val;
        setInput(newVal);

        // Cek PIN otomatis saat sudah 4 digit
        if (newVal.length === 4) {
          const isCorrect = verifyPin(newVal);
          if (!isCorrect) {
            setError(true);
            setTimeout(() => {
              setInput("");
              setError(false);
            }, 500); // Reset otomatis jika salah
          }
        }
      }
    }
  };

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "biometric", 0, "delete"];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={56} color="#43A047" />
        <Text style={styles.title}>Aplikasi Terkunci</Text>
        <Text style={[styles.subtitle, error && { color: "#E53935" }]}>
          {error
            ? "PIN Salah, silakan coba lagi."
            : "Masukkan 4 digit PIN Anda"}
        </Text>
      </View>

      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              input.length >= i && styles.dotActive,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      <View style={styles.padContainer}>
        {keys.map((val) => {
          if (val === "biometric") {
            return (
              <TouchableOpacity
                key={val}
                style={styles.key}
                onPress={() => handlePress(val)}
              >
                <Ionicons name="finger-print" size={36} color="#43A047" />
              </TouchableOpacity>
            );
          }
          if (val === "delete") {
            return (
              <TouchableOpacity
                key={val}
                style={styles.key}
                onPress={() => handlePress(val)}
              >
                <Ionicons name="backspace-outline" size={28} color="#212121" />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={val}
              style={styles.key}
              onPress={() => handlePress(val)}
            >
              <Text style={styles.keyText}>{val}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40, marginTop: 40 },
  title: { fontSize: 22, fontWeight: "bold", color: "#212121", marginTop: 16 },
  subtitle: { fontSize: 14, color: "#757575", marginTop: 8 },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 60,
    gap: 20,
  },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#E0E0E0" },
  dotActive: { backgroundColor: "#43A047" },
  dotError: { backgroundColor: "#E53935" },
  padContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 15,
  },
  key: {
    width: "28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  keyText: { fontSize: 28, fontWeight: "500", color: "#212121" },
});
