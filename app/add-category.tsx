import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
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

export default function AddCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: "expense" | "income" }>();
  const { addCategory } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">(
    params.type || "expense",
  );
  const [budgetVal, setBudgetVal] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState<
    "weekly" | "monthly" | "custom"
  >("monthly");
  const [budgetDuration, setBudgetDuration] = useState("3");
  const [selectedColor, setSelectedColor] = useState("#0097A7");

  const colorOptions = [
    "#0097A7",
    "#00838F",
    "#F57C00",
    "#EF6C00",
    "#E91E63",
    "#C2185B",
    "#2E7D32",
    "#1B5E20",
    "#1E88E5",
    "#1565C0",
    "#7B1FA2",
    "#4A148C",
    "#D32F2F",
    "#455A64",
  ];

  const handleSaveCategory = () => {
    if (!name.trim()) {
      Alert.alert("Perhatian", "Nama kategori tidak boleh kosong!");
      return;
    }

    const parsedBudget =
      type === "expense" && budgetVal
        ? parseFloat(budgetVal.replace(/[^0-9]/g, "")) || 0
        : undefined;

    const parsedDuration =
      type === "expense" && budgetPeriod === "custom"
        ? parseInt(budgetDuration) || 3
        : undefined;

    addCategory({
      name: name.trim(),
      type,
      icon: type === "expense" ? "cart-outline" : "wallet-outline",
      color: selectedColor,
      bg: selectedColor + "20",
      budget: type === "expense" ? parsedBudget : undefined,
      budgetPeriod: type === "expense" ? budgetPeriod : undefined,
      budgetDuration: parsedDuration,
    } as any);

    Alert.alert("Sukses", "Kategori baru berhasil ditambahkan!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Tambah Kategori Baru
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Jenis Kategori
          </Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                type === "expense" && styles.typeBtnExpenseActive,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: colors.textMain },
                  type === "expense" && { color: "#FFF" },
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                type === "income" && styles.typeBtnIncomeActive,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: colors.textMain },
                  type === "income" && { color: "#FFF" },
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Nama Kategori
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
            placeholder="Contoh: Hiburan, Tagihan"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {type === "expense" && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Batas Anggaran
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
                placeholder="Contoh: 500000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={budgetVal}
                onChangeText={setBudgetVal}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Periode Anggaran
              </Text>
              <View style={styles.periodRow}>
                <TouchableOpacity
                  style={[
                    styles.periodBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    budgetPeriod === "weekly" && {
                      borderColor: colors.primary,
                      backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                    },
                  ]}
                  onPress={() => setBudgetPeriod("weekly")}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.textMuted },
                      budgetPeriod === "weekly" && {
                        color: colors.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Mingguan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    budgetPeriod === "monthly" && {
                      borderColor: colors.primary,
                      backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                    },
                  ]}
                  onPress={() => setBudgetPeriod("monthly")}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.textMuted },
                      budgetPeriod === "monthly" && {
                        color: colors.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Bulanan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    budgetPeriod === "custom" && {
                      borderColor: colors.primary,
                      backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                    },
                  ]}
                  onPress={() => setBudgetPeriod("custom")}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.textMuted },
                      budgetPeriod === "custom" && {
                        color: colors.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Kustom
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {budgetPeriod === "custom" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Durasi (Jumlah Bulan)
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
                  placeholder="Contoh: 3 atau 6 bulan"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={budgetDuration}
                  onChangeText={setBudgetDuration}
                />
              </View>
            )}
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Pilih Warna Tema
          </Text>
          <View style={styles.colorGrid}>
            {colorOptions.map((col) => {
              const isSelected = selectedColor === col;
              return (
                <TouchableOpacity
                  key={col}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: col },
                    isSelected && [
                      styles.colorCircleActive,
                      { borderColor: colors.textMain },
                    ],
                  ]}
                  onPress={() => setSelectedColor(col)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveCategory}
        >
          <Text style={styles.saveBtnText}>Simpan Kategori</Text>
        </TouchableOpacity>
      </ScrollView>
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
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
  },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBtnExpenseActive: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  typeBtnIncomeActive: {
    backgroundColor: "#43A047",
    borderColor: "#43A047",
  },
  typeText: { fontSize: 14, fontWeight: "600" },
  periodRow: { flexDirection: "row", gap: 8 },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
  },
  periodText: { fontSize: 13, fontWeight: "500" },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  colorCircleActive: {
    borderWidth: 3,
    transform: [{ scale: 1.12 }],
  },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
