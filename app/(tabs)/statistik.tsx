import { Ionicons } from "@expo/vector-icons";
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
  const { transactions, categories, monthlyBudget, setMonthlyBudget } =
    useTransactions();

  const currentDate = new Date();
  // selectedMonth bisa berupa angka (0-11) atau string "all" untuk semua bulan
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(
    currentDate.getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State untuk Modal Ubah Anggaran
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [inputBudget, setInputBudget] = useState(monthlyBudget.toString());

  // Pemetaan ikon kategori secara dinamis
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

  // Filter transaksi berdasarkan pilihan bulan ("all" atau indeks bulan 0-11)
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const matchesYear = tDate.getFullYear() === selectedYear;

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

  const categoryStats = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    amount: categoryMap[cat],
    percentage:
      totalExpense > 0
        ? Math.round((categoryMap[cat] / totalExpense) * 100)
        : 0,
  }));

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const handleSaveBudget = () => {
    const parsed = parseInt(inputBudget.replace(/[^0-9]/g, "")) || 0;
    setMonthlyBudget(parsed);
    setBudgetModalVisible(false);
    alert("Target anggaran berhasil diperbarui!");
  };

  // Label teks yang tampil di tombol pemilih bulan
  const displayText =
    selectedMonth === "all"
      ? `Semua Bulan ${selectedYear}`
      : `${monthsNames[selectedMonth as number]} ${selectedYear}`;

  // Daftar opsi untuk modal (menambahkan "Semua Bulan" di urutan paling atas)
  const modalOptions = [
    { label: `Semua`, value: "all" },
    ...monthsNames.map((m, index) => ({
      label: `${m} ${selectedYear}`,
      value: index,
    })),
  ];

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

      <ScrollView contentContainerStyle={styles.container}>
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

        {/* Rincian Kategori Dinamis */}
        <Text style={styles.sectionTitle}>Rincian Kategori</Text>

        {categoryStats.length === 0 ? (
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
        ) : (
          categoryStats.map((item) => {
            const catInfo = categoryIcons[item.name] || {
              icon: "pricetag",
              color: "#757575",
              bg: "#EEEEEE",
            };

            return (
              <View key={item.name} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[styles.iconBg, { backgroundColor: catInfo.bg }]}
                    >
                      <Ionicons
                        name={catInfo.icon as any}
                        size={16}
                        color={catInfo.color}
                      />
                    </View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatRp(item.amount)} ({item.percentage}%)
                  </Text>
                </View>
                <View style={styles.subProgressBg}>
                  <View
                    style={[
                      styles.subProgressFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: catInfo.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modal Pilihan Bulan (Dilengkapi area klik luar untuk menutup) */}
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

      {/* Modal Atur Target Anggaran (Dilengkapi area klik luar untuk menutup) */}
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
    backgroundColor: colors.background,
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
  container: { padding: 20 },
  budgetCard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textMain,
    marginBottom: 15,
  },
  categoryItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryInfo: { flexDirection: "row", alignItems: "center" },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryName: { fontSize: 15, fontWeight: "600", color: colors.textMain },
  categoryAmount: { fontSize: 14, fontWeight: "bold", color: colors.textMain },
  subProgressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  subProgressFill: { height: "100%", borderRadius: 4 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 20 },
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
