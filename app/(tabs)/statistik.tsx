import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "../../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
  danger: "#E53935",
};

const monthsNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function StatistikScreen() {
  const router = useRouter();
  const { transactions, categories, monthlyBudget, setMonthlyBudget } =
    useTransactions();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(
    currentDate.getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [inputBudget, setInputBudget] = useState(monthlyBudget.toString());

  const categoryIcons: {
    [key: string]: { icon: string; color: string; bg: string };
  } = {};
  categories.forEach((c) => {
    categoryIcons[c.name] = {
      icon: c.icon.replace("-outline", ""),
      color: c.color,
      bg: c.bg,
    };
  });

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const matchesYear = tDate.getFullYear() === selectedYear;

    if (t.isDebtRelated) return false;

    if (selectedMonth === "all") {
      return t.type === "expense" && matchesYear;
    }
    return (
      t.type === "expense" && tDate.getMonth() === selectedMonth && matchesYear
    );
  });

  const totalExpense = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const budgetPercentage =
    monthlyBudget > 0
      ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100)
      : 0;

  const categoryMap: { [key: string]: number } = {};
  filteredTransactions.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = 0;
    }
    categoryMap[t.category] += t.amount;
  });

  const categoryStats = Object.keys(categoryMap)
    .map((cat) => ({
      name: cat,
      amount: categoryMap[cat],
      percentage:
        totalExpense > 0
          ? Math.round((categoryMap[cat] / totalExpense) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const pieData = categoryStats.map((item) => {
    return {
      value: item.amount,
      color: categoryIcons[item.name]?.color || "#BDBDBD",
      text: `${item.percentage}%`,
    };
  });

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const handleSaveBudget = () => {
    const parsed = parseInt(inputBudget.replace(/[^0-9]/g, "")) || 0;
    setMonthlyBudget(parsed);
    setBudgetModalVisible(false);
    alert("Target anggaran berhasil diperbarui!");
  };

  const displayText =
    selectedMonth === "all"
      ? `Semua Bulan ${selectedYear}`
      : `${monthsNames[selectedMonth as number]} ${selectedYear}`;
  const modalOptions = [
    { label: `Semua Bulan ${selectedYear}`, value: "all" },
    ...monthsNames.map((m, index) => ({
      label: `${m} ${selectedYear}`,
      value: index,
    })),
  ];

  const changeMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (selectedMonth === "all" || selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth((selectedMonth as number) - 1);
      }
    } else {
      if (selectedMonth === "all" || selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth((selectedMonth as number) + 1);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistik & Anggaran</Text>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.monthText}>{displayText}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Pemilih Bulan Panah */}
        <View style={styles.arrowMonthContainer}>
          <TouchableOpacity
            onPress={() => changeMonth("prev")}
            style={styles.arrowBtn}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.arrowMonthText}>{displayText}</Text>
          <TouchableOpacity
            onPress={() => changeMonth("next")}
            style={styles.arrowBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMain}
            />
          </TouchableOpacity>
        </View>

        {/* Kartu Target Anggaran */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetLabel}>
                Target Anggaran (
                {selectedMonth === "all" ? "Tahunan" : "Bulan Ini"})
              </Text>
              <Text style={styles.budgetAmount}>{formatRp(monthlyBudget)}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBudgetBtn}
              onPress={() => {
                setInputBudget(monthlyBudget.toString());
                setBudgetModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.budgetProgressInfo}>
            <Text style={styles.budgetSpentText}>
              Terpakai:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {formatRp(totalExpense)}
              </Text>
            </Text>
            <Text
              style={[
                styles.budgetSpentText,
                { color: totalExpense > monthlyBudget ? "#FFCDD2" : "#FFFFFF" },
              ]}
            >
              {budgetPercentage}%
            </Text>
          </View>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${budgetPercentage}%`,
                  backgroundColor:
                    totalExpense > monthlyBudget ? "#FF5252" : "#FFFFFF",
                },
              ]}
            />
          </View>
        </View>

        {/* Grafik Donat Premium & Daftar Kategori */}
        {categoryStats.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Proporsi Pengeluaran</Text>

            <View style={styles.chartAndLegendWrapper}>
              <View style={styles.chartWrapper}>
                <PieChart
                  donut
                  innerRadius={70}
                  radius={100}
                  data={pieData}
                  strokeWidth={2}
                  centerLabelComponent={() => {
                    return (
                      <View style={styles.centerLabelContainer}>
                        <Text style={styles.centerLabelTitle}>
                          Total Keluar
                        </Text>
                        <Text style={styles.centerLabelValue} numberOfLines={1}>
                          {formatRp(totalExpense)}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>

              <View style={styles.legendWrapper}>
                {categoryStats.map((item) => {
                  const catColor = categoryIcons[item.name]?.color || "#BDBDBD";
                  const catIcon = categoryIcons[item.name]?.icon || "pricetag";
                  const catBg = categoryIcons[item.name]?.bg || "#EEEEEE";

                  return (
                    <View key={item.name} style={styles.legendItem}>
                      <View style={styles.legendLeft}>
                        <View
                          style={[
                            styles.legendIconBox,
                            { backgroundColor: catBg },
                          ]}
                        >
                          <Ionicons
                            name={catIcon as any}
                            size={16}
                            color={catColor}
                          />
                        </View>
                        <Text
                          style={styles.legendCategoryName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </View>
                      <View style={styles.legendRight}>
                        <View style={styles.badgePercentage}>
                          <Text style={styles.legendPercentage}>
                            {item.percentage}%
                          </Text>
                        </View>
                        <Text style={styles.legendCategoryAmount}>
                          {formatRp(item.amount)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {categoryStats.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="stats-chart-outline"
              size={48}
              color={colors.border}
            />
            <Text style={styles.emptyStateText}>
              Tidak ada pengeluaran pada periode ini
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Pilihan Periode */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Periode</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalOptions}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedMonth === item.value && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setSelectedMonth(item.value as any);
                    setIsModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedMonth === item.value &&
                        styles.modalItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedMonth === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Atur Target Anggaran */}
      <Modal
        visible={budgetModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBudgetModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atur Target Anggaran</Text>
              <TouchableOpacity onPress={() => setBudgetModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Batas Maksimal Pengeluaran (Rp)</Text>
              <TextInput
                style={styles.input}
                value={inputBudget}
                onChangeText={setInputBudget}
                keyboardType="numeric"
                placeholder="Contoh: 1500000"
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBudget}
            >
              <Text style={styles.saveButtonText}>Simpan Anggaran</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.textMain },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  monthText: {
    color: colors.primary,
    fontWeight: "600",
    marginRight: 4,
    fontSize: 13,
  },
  arrowMonthContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  arrowBtn: { padding: 4 },
  arrowMonthText: { fontSize: 15, fontWeight: "bold", color: colors.textMain },
  container: { padding: 20 },
  budgetCard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  budgetLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  budgetAmount: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  editBudgetBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  budgetProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetSpentText: { color: "#FFFFFF", fontSize: 13 },
  progressBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  chartContainer: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textMain,
    marginBottom: 12,
  },
  chartAndLegendWrapper: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  centerLabelContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  centerLabelTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  centerLabelValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textMain,
    textAlign: "center",
  },
  legendWrapper: {
    width: "100%",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  legendIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  legendRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  badgePercentage: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  legendPercentage: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  legendCategoryName: {
    fontSize: 14,
    color: colors.textMain,
    fontWeight: "600",
    flex: 1,
  },
  legendCategoryAmount: {
    fontSize: 13,
    color: colors.textMain,
    fontWeight: "bold",
    textAlign: "right",
    minWidth: 85,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  emptyStateText: { marginTop: 10, fontSize: 15, color: colors.textMuted },
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
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    borderRadius: 8,
  },
  modalItemActive: { backgroundColor: "#E8F5E9" },
  modalItemText: { fontSize: 16, color: colors.textMain },
  modalItemTextActive: { color: colors.primary, fontWeight: "bold" },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
