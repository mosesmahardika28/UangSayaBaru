import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

export default function BudgetSettingScreen() {
  const router = useRouter();
  const { budget, setBudget } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [period, setPeriod] = useState<"monthly" | "custom" | "yearly">(
    budget?.period || "monthly",
  );
  const [durationMonths, setDurationMonths] = useState(
    budget?.durationMonths ? budget.durationMonths.toString() : "3",
  );

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");

  const handleSave = () => {
    const newBudget = {
      amount: budget.amount, // Tetap menggunakan total akumulasi dari kategori
      period,
      durationMonths:
        period === "custom" ? parseInt(durationMonths) || 3 : undefined,
      startDate: budget.startDate || new Date().toISOString().split("T")[0],
    };

    if (setBudget) {
      setBudget(newBudget);
    }

    Alert.alert("Berhasil", "Pengaturan periode anggaran berhasil disimpan!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>
            Atur Anggaran
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Kartu Informasi Total Anggaran Otomatis (Bottom-Up) */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Total Anggaran (Otomatis dari Kategori):
            </Text>
            <Text style={[styles.infoVal, { color: colors.primary }]}>
              {formatRp(budget.amount)}
            </Text>
            <Text style={[styles.infoSub, { color: colors.textMuted }]}>
              Ubah nominal anggaran melalui menu Kategori & Anggaran.
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.textMain }]}>
            Pilih Periode Anggaran
          </Text>
          <View style={styles.periodRow}>
            <TouchableOpacity
              style={[
                styles.periodBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                period === "monthly" && {
                  borderColor: colors.primary,
                  backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                },
              ]}
              onPress={() => setPeriod("monthly")}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: colors.textMuted },
                  period === "monthly" && {
                    color: colors.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                Per Bulan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                period === "custom" && {
                  borderColor: colors.primary,
                  backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                },
              ]}
              onPress={() => setPeriod("custom")}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: colors.textMuted },
                  period === "custom" && {
                    color: colors.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                Beberapa Bulan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                period === "yearly" && {
                  borderColor: colors.primary,
                  backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                },
              ]}
              onPress={() => setPeriod("yearly")}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: colors.textMuted },
                  period === "yearly" && {
                    color: colors.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                Per Tahun
              </Text>
            </TouchableOpacity>
          </View>

          {period === "custom" && (
            <>
              <Text style={[styles.label, { color: colors.textMain }]}>
                Jumlah Bulan Durasi
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.textMain,
                  },
                ]}
                placeholder="Contoh: 3 atau 6"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={durationMonths}
                onChangeText={setDurationMonths}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "center",
  },
  infoLabel: { fontSize: 13, marginBottom: 4 },
  infoVal: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  infoSub: { fontSize: 11, textAlign: "center" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  periodText: { fontSize: 13, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
