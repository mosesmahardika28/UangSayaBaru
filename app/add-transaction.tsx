import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const {
    transactions,
    wallets,
    categories,
    addTransaction,
    updateTransaction,
  } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [type, setType] = useState<"income" | "expense" | "transfer">(
    "expense",
  );
  const [amount, setAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [note, setNote] = useState("");
  const [txDate, setTxDate] = useState<string>(new Date().toISOString());

  const isEditing = Boolean(editId);

  useEffect(() => {
    if (isEditing && transactions.length > 0) {
      const existingTx = transactions.find((t) => t.id === editId);
      if (existingTx) {
        setType(existingTx.type);
        setAmount(existingTx.amount.toString());
        setSelectedWalletId(existingTx.walletId);
        setToWalletId(existingTx.toWalletId || "");
        setSelectedCategory(existingTx.category);
        setNote(existingTx.note || "");
        setTxDate(existingTx.date);
      }
    } else if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
      if (wallets.length > 1) setToWalletId(wallets[1].id);
    }
  }, [editId, transactions]);

  const availableCategories = categories.filter(
    (c) => type === "transfer" || c.type === type,
  );

  const formatRp = (val: string) => {
    const numbers = val.replace(/[^0-9]/g, "");
    if (!numbers) return "";
    return parseInt(numbers, 10).toLocaleString("id-ID");
  };

  const handleSave = async () => {
    const cleanAmount = parseInt(amount.replace(/[^0-9]/g, "")) || 0;
    if (cleanAmount <= 0) {
      Alert.alert("Perhatian", "Masukkan nominal transaksi yang valid!");
      return;
    }

    if (!selectedWalletId) {
      Alert.alert("Perhatian", "Pilih dompet terlebih dahulu!");
      return;
    }

    if (type === "transfer") {
      if (!toWalletId) {
        Alert.alert("Perhatian", "Pilih dompet tujuan transfer!");
        return;
      }
      if (selectedWalletId === toWalletId) {
        Alert.alert("Perhatian", "Dompet asal dan tujuan tidak boleh sama!");
        return;
      }
    } else {
      if (!selectedCategory) {
        Alert.alert("Perhatian", "Pilih kategori transaksi terlebih dahulu!");
        return;
      }
    }

    try {
      if (isEditing) {
        if (updateTransaction) {
          await updateTransaction(editId as string, {
            type,
            amount: cleanAmount,
            walletId: selectedWalletId,
            toWalletId: type === "transfer" ? toWalletId : undefined,
            category: type === "transfer" ? "Transfer" : selectedCategory,
            note,
            date: txDate,
          });
        }
        Alert.alert("Sukses", "Transaksi berhasil diperbarui!");
      } else {
        await addTransaction({
          type,
          amount: cleanAmount,
          walletId: selectedWalletId,
          toWalletId: type === "transfer" ? toWalletId : undefined,
          category: type === "transfer" ? "Transfer" : selectedCategory,
          note,
          date: new Date().toISOString(),
        });
        Alert.alert("Sukses", "Transaksi berhasil ditambahkan!");
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Gagal", error.message || "Terjadi kesalahan sistem.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          {isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.typeSelector,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "expense" && { backgroundColor: colors.expenseText },
              ]}
              onPress={() => {
                setType("expense");
                setSelectedCategory("");
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: colors.textMuted },
                  type === "expense" && { color: "#FFF", fontWeight: "bold" },
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "income" && { backgroundColor: colors.incomeText },
              ]}
              onPress={() => {
                setType("income");
                setSelectedCategory("");
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: colors.textMuted },
                  type === "income" && { color: "#FFF", fontWeight: "bold" },
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "transfer" && { backgroundColor: colors.transfer },
              ]}
              onPress={() => {
                setType("transfer");
                setSelectedCategory("Transfer");
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: colors.textMuted },
                  type === "transfer" && { color: "#FFF", fontWeight: "bold" },
                ]}
              >
                Transfer
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Nominal (Rp)
            </Text>
            <TextInput
              style={[
                styles.amountInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.textMain,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={formatRp(amount)}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {type === "transfer" ? "Dari Dompet" : "Dompet"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    selectedWalletId === w.id && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedWalletId(w.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textMain },
                      selectedWalletId === w.id && {
                        color: "#FFF",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {w.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {type === "transfer" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Ke Dompet Tujuan
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      toWalletId === w.id && {
                        backgroundColor: colors.transfer,
                        borderColor: colors.transfer,
                      },
                    ]}
                    onPress={() => setToWalletId(w.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.textMain },
                        toWalletId === w.id && {
                          color: "#FFF",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {type !== "transfer" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Kategori
              </Text>
              <View style={styles.categoryGrid}>
                {availableCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id || c.name}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      selectedCategory === c.name && {
                        borderColor: colors.primary,
                        backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                      },
                    ]}
                    onPress={() => setSelectedCategory(c.name)}
                  >
                    <Ionicons
                      name={c.icon as any}
                      size={22}
                      color={c.color || colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.textMain },
                        selectedCategory === c.name && {
                          fontWeight: "bold",
                          color: colors.primary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Catatan (Opsional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.textMain,
                },
              ]}
              placeholder="Contoh: Belanja bulanan di supermarket"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { paddingHorizontal: 20, paddingTop: 10 },
  typeSelector: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  typeBtnText: { fontSize: 14, fontWeight: "600" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 24,
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryCard: {
    width: "23%",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    margin: "1%",
  },
  categoryText: { fontSize: 11 },
  saveButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
