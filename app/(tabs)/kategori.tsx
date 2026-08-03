import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import {
  CategoryItem,
  useTransactions,
} from "../../context/TransactionContext";

export default function KategoriScreen() {
  const router = useRouter();
  // SESUDAH:
  const params = useLocalSearchParams<{
    type?: "expense" | "income";
    openAdd?: string;
    actionId?: string; // <-- Tambahkan ini agar TypeScript tidak error
  }>();
  const {
    categories,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State Form & Mode Edit
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [budgetVal, setBudgetVal] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState<
    "weekly" | "monthly" | "custom"
  >("monthly");
  const [budgetDuration, setBudgetDuration] = useState("3");
  const [selectedColor, setSelectedColor] = useState("#0097A7");

  // EFFECT UNTUK MENANGKAP PARAMETER DARI HALAMAN ADD TRANSACTION
  useEffect(() => {
    if (params.type === "expense" || params.type === "income") {
      setActiveTab(params.type);
      setType(params.type);
    }

    if (params.openAdd === "true") {
      const timer = setTimeout(() => {
        setEditingCategory(null);
        setName("");
        setBudgetVal("");
        setBudgetPeriod("monthly");
        setBudgetDuration("3");
        setSelectedColor("#0097A7");
        setIsModalVisible(true);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [params.actionId]); // Hanya terpicu ketika actionId unik ini berubah

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

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  // Fungsi untuk mengecek apakah transaksi masuk dalam periode anggaran kategori
  const isTransactionInPeriod = (
    txDate: string,
    period?: string,
    durationMonths?: number,
  ) => {
    const tDate = new Date(txDate);
    const now = new Date();

    if (period === "weekly") {
      const diffTime = now.getTime() - tDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    } else if (period === "custom" && durationMonths) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + durationMonths);
      return tDate >= start && tDate <= end;
    } else {
      // Default Monthly
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    }
  };

  // Menghitung total terpakai untuk kategori tertentu
  const calculateSpent = (
    catName: string,
    period?: string,
    duration?: number,
  ) => {
    return transactions
      .filter(
        (t) =>
          !t.isDebtRelated &&
          t.type === "expense" &&
          t.category === catName &&
          isTransactionInPeriod(t.date, period, duration),
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setType(activeTab); // Otomatis menyesuaikan dengan tab yang sedang aktif
    setBudgetVal("");
    setBudgetPeriod("monthly");
    setBudgetDuration("3");
    setSelectedColor("#0097A7");
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setBudgetVal(cat.budget ? cat.budget.toString() : "");
    setBudgetPeriod((cat as any).budgetPeriod || "monthly");
    setBudgetDuration(
      (cat as any).budgetDuration
        ? (cat as any).budgetDuration.toString()
        : "3",
    );
    setSelectedColor(cat.color || "#0097A7");
    setIsModalVisible(true);
  };

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

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        color: selectedColor,
        bg: selectedColor + "20",
        budget: type === "expense" ? parsedBudget : undefined,
        budgetPeriod: type === "expense" ? budgetPeriod : undefined,
        budgetDuration: parsedDuration,
      } as any);
    } else {
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
    }

    setIsModalVisible(false);
  };

  const handleDelete = (id: string, catName: string) => {
    Alert.alert(
      "Hapus Kategori",
      `Yakin ingin menghapus kategori "${catName}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteCategory(id),
        },
      ],
    );
  };

  const getPeriodLabel = (period?: string, duration?: number) => {
    if (period === "weekly") return "Mingguan";
    if (period === "custom") return `${duration} Bulan`;
    return "Bulanan";
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
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Kategori & Anggaran
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={handleOpenAddModal}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            activeTab === "expense" && styles.tabActiveExpense,
          ]}
          onPress={() => setActiveTab("expense")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.textMuted },
              activeTab === "expense" && styles.tabTextActive,
            ]}
          >
            Pengeluaran
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            activeTab === "income" && styles.tabActiveIncome,
          ]}
          onPress={() => setActiveTab("income")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.textMuted },
              activeTab === "income" && styles.tabTextActive,
            ]}
          >
            Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada kategori{" "}
              {activeTab === "expense" ? "pengeluaran" : "pemasukan"}.
            </Text>
          </View>
        ) : (
          filteredCategories.map((cat: any) => {
            const spent =
              cat.type === "expense"
                ? calculateSpent(cat.name, cat.budgetPeriod, cat.budgetDuration)
                : 0;
            const budgetAmt = cat.budget || 0;
            const remaining = budgetAmt - spent;

            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  if (cat.type === "expense") {
                    router.push({
                      pathname: "/category-budget-detail",
                      params: {
                        categoryName: cat.name,
                        budget: budgetAmt.toString(),
                        period: getPeriodLabel(
                          cat.budgetPeriod,
                          cat.budgetDuration,
                        ),
                        periodType: cat.budgetPeriod || "monthly",
                        duration: cat.budgetDuration
                          ? cat.budgetDuration.toString()
                          : "",
                      },
                    });
                  }
                }}
              >
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          cat.bg || (isDarkMode ? "#2C2C2C" : "#EEEEEE"),
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={cat.color}
                    />
                  </View>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.catName, { color: colors.textMain }]}>
                      {cat.name}
                    </Text>
                    {cat.type === "expense" ? (
                      <View>
                        <Text
                          style={[
                            styles.catBudgetInfo,
                            { color: colors.textMuted },
                          ]}
                        >
                          Terpakai:{" "}
                          <Text
                            style={{ fontWeight: "bold", color: colors.danger }}
                          >
                            {formatRp(spent)}
                          </Text>{" "}
                          / {formatRp(budgetAmt)}
                        </Text>
                        <Text
                          style={[
                            styles.catRemaining,
                            { color: colors.textMuted },
                          ]}
                        >
                          Sisa:{" "}
                          <Text
                            style={{
                              fontWeight: "bold",
                              color:
                                remaining >= 0 ? colors.primary : colors.danger,
                            }}
                          >
                            {formatRp(remaining)}
                          </Text>{" "}
                          (
                          {getPeriodLabel(cat.budgetPeriod, cat.budgetDuration)}
                          )
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.catType, { color: colors.primary }]}>
                        Pemasukan
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionIconBtn,
                      { backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5" },
                    ]}
                    onPress={() => handleOpenEditModal(cat)}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionIconBtn,
                      { backgroundColor: isDarkMode ? "#2C2C2C" : "#F5F5F5" },
                    ]}
                    onPress={() => handleDelete(cat.id, cat.name)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modal Tambah / Edit Kategori */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Jenis Kategori
              </Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: colors.background,
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
                      backgroundColor: colors.background,
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
                    backgroundColor: colors.background,
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
                        backgroundColor: colors.background,
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
                          backgroundColor: colors.background,
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
                          backgroundColor: colors.background,
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
                          backgroundColor: colors.background,
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
                          backgroundColor: colors.background,
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
              <Text style={styles.saveBtnText}>
                {editingCategory ? "Simpan Perubahan" : "Simpan Kategori"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 6,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  tabActiveExpense: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  tabActiveIncome: {
    backgroundColor: "#43A047",
    borderColor: "#43A047",
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FFF" },
  container: { padding: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  catBudgetInfo: { fontSize: 12 },
  catRemaining: { fontSize: 12, marginTop: 2 },
  catType: { fontSize: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionIconBtn: { padding: 6, borderRadius: 8 },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 14, marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
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
    marginTop: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
