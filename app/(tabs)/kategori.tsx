import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CategoryItem,
  useTransactions,
} from "../../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  primary: "#43A047",
  textMain: "#212121",
  textMuted: "#757575",
  border: "#EEEEEE",
  danger: "#E53935",
};

export default function KategoriScreen() {
  const { categories, transactions, updateCategory } = useTransactions();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    null,
  );
  const [budgetInput, setBudgetInput] = useState("");

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");

  // Ambil hanya kategori pengeluaran
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Hitung pengeluaran bulan ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const expensesThisMonth = transactions.filter(
    (t) =>
      t.type === "expense" &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear,
  );

  const getSpentAmount = (catName: string) => {
    return expensesThisMonth
      .filter((t) => t.category === catName)
      .reduce((sum, current) => sum + current.amount, 0);
  };

  const openBudgetModal = (cat: CategoryItem) => {
    setSelectedCategory(cat);
    setBudgetInput(cat.budget ? cat.budget.toString() : "");
    setModalVisible(true);
  };

  const handleSaveBudget = () => {
    if (!selectedCategory) return;
    const parsedBudget = parseInt(budgetInput.replace(/[^0-9]/g, "")) || 0;

    updateCategory(selectedCategory.id, { budget: parsedBudget });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anggaran Kategori</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.container}
        data={expenseCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const spent = getSpentAmount(item.name);
          const budget = item.budget || 0;
          const percentage =
            budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
          const isOverBudget = budget > 0 && spent > budget;

          return (
            <TouchableOpacity
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => openBudgetModal(item)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={[styles.iconBg, { backgroundColor: item.bg }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </View>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textMuted}
                />
              </View>

              <View style={styles.amountRow}>
                <Text
                  style={[
                    styles.spentAmount,
                    isOverBudget && { color: colors.danger },
                  ]}
                >
                  {formatRp(spent)}
                </Text>
                <Text style={styles.budgetAmount}>
                  / {budget > 0 ? formatRp(budget) : "Belum diatur"}
                </Text>
              </View>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${budget > 0 ? percentage : 0}%`,
                      backgroundColor: isOverBudget
                        ? colors.danger
                        : item.color,
                    },
                  ]}
                />
              </View>

              {budget > 0 && (
                <Text
                  style={[
                    styles.percentText,
                    isOverBudget && { color: colors.danger },
                  ]}
                >
                  {isOverBudget
                    ? `Melebihi anggaran!`
                    : `${percentage}% terpakai`}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal Atur Anggaran */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Atur Anggaran: {selectedCategory?.name}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Batas Pengeluaran Bulanan (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 1500000"
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
              />
              <Text style={styles.helperText}>
                Isi 0 jika tidak ingin membatasi pengeluaran ini.
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBudget}>
              <Text style={styles.saveBtnText}>Simpan Anggaran</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, backgroundColor: colors.background },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.textMain },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  categoryCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryName: { fontSize: 15, fontWeight: "bold", color: colors.textMain },
  amountRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 8 },
  spentAmount: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  budgetAmount: { fontSize: 14, color: colors.textMuted, marginLeft: 4 },
  progressBg: {
    height: 8,
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  percentText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "right",
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: colors.textMain,
  },
  helperText: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
});
