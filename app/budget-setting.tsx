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
import { useTransactions } from "../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
};

export default function BudgetSettingScreen() {
  const router = useRouter();
  const { budget, setBudget } = useTransactions();

  const [amount, setAmount] = useState(
    budget?.amount ? budget.amount.toString() : "",
  );
  const [period, setPeriod] = useState<"monthly" | "custom" | "yearly">(
    budget?.period || "monthly",
  );
  const [durationMonths, setDurationMonths] = useState(
    budget?.durationMonths ? budget.durationMonths.toString() : "3",
  );

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Masukkan nominal anggaran yang valid.");
      return;
    }

    const newBudget = {
      amount: numericAmount,
      period,
      durationMonths:
        period === "custom" ? parseInt(durationMonths) || 3 : undefined,
      startDate: new Date().toISOString().split("T")[0],
    };

    if (setBudget) {
      setBudget(newBudget);
    }

    Alert.alert("Berhasil", "Pengaturan anggaran berhasil disimpan!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Atur Anggaran</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Pilih Periode Anggaran</Text>
          <View style={styles.periodRow}>
            <TouchableOpacity
              style={[
                styles.periodBtn,
                period === "monthly" && styles.periodBtnActive,
              ]}
              onPress={() => setPeriod("monthly")}
            >
              <Text
                style={[
                  styles.periodText,
                  period === "monthly" && styles.periodTextActive,
                ]}
              >
                Per Bulan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodBtn,
                period === "custom" && styles.periodBtnActive,
              ]}
              onPress={() => setPeriod("custom")}
            >
              <Text
                style={[
                  styles.periodText,
                  period === "custom" && styles.periodTextActive,
                ]}
              >
                Beberapa Bulan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodBtn,
                period === "yearly" && styles.periodBtnActive,
              ]}
              onPress={() => setPeriod("yearly")}
            >
              <Text
                style={[
                  styles.periodText,
                  period === "yearly" && styles.periodTextActive,
                ]}
              >
                Per Tahun
              </Text>
            </TouchableOpacity>
          </View>

          {period === "custom" && (
            <>
              <Text style={styles.label}>Jumlah Bulan Durasi</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 3 atau 6"
                keyboardType="numeric"
                value={durationMonths}
                onChangeText={setDurationMonths}
              />
            </>
          )}

          <Text style={styles.label}>Batas Nominal Anggaran (Rp)</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 2000000"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Simpan Anggaran</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  container: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMain,
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
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: colors.card,
  },
  periodBtnActive: { borderColor: colors.primary, backgroundColor: "#E8F5E9" },
  periodText: { fontSize: 13, fontWeight: "500", color: colors.textMuted },
  periodTextActive: { color: colors.primary, fontWeight: "bold" },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.textMain,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
