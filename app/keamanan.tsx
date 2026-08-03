import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function KeamananScreen() {
  const router = useRouter();
  const { hasPin, setupPin, removePin } = useAuth();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [newPin, setNewPin] = useState("");

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      alert("PIN harus 4 digit angka!");
      return;
    }
    setupPin(newPin);
    setNewPin("");
    alert("PIN berhasil diaktifkan!");
  };

  const handleRemovePin = () => {
    Alert.alert("Matikan Keamanan", "Yakin ingin menghapus PIN?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => removePin() },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>
          Pengaturan Keamanan
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {hasPin ? (
          <View
            style={[
              styles.activeCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={48}
              color={colors.primary}
            />
            <Text style={[styles.statusText, { color: colors.textMain }]}>
              Keamanan Aktif
            </Text>
            <Text style={[styles.statusSub, { color: colors.textMuted }]}>
              Aplikasi dilindungi oleh PIN dan Sidik Jari
            </Text>

            <TouchableOpacity
              style={[
                styles.removeBtn,
                { backgroundColor: isDarkMode ? "#3E2723" : "#FFEBEE" },
              ]}
              onPress={handleRemovePin}
            >
              <Text style={styles.removeBtnText}>Matikan Keamanan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.setupCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="shield-half" size={48} color={colors.textMuted} />
            <Text style={[styles.statusText, { color: colors.textMain }]}>
              Keamanan Nonaktif
            </Text>
            <Text style={[styles.statusSub, { color: colors.textMuted }]}>
              Buat 4 digit PIN untuk mengamankan data Anda.
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textMain,
                },
              ]}
              placeholder="Masukkan 4 Digit Angka"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={newPin}
              onChangeText={setNewPin}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSetPin}
            >
              <Text style={styles.saveBtnText}>Aktifkan PIN & Sidik Jari</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  content: { padding: 20 },
  activeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  setupCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statusText: { fontSize: 18, fontWeight: "bold", marginTop: 16 },
  statusSub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 20,
  },
  saveBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  removeBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  removeBtnText: { color: "#C62828", fontWeight: "bold", fontSize: 15 },
});
