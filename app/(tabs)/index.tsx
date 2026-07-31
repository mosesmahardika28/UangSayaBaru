import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 1. Panggil brankas data kita
import { useTransactions } from "../../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  primary: "#43A047",
  textMain: "#212121",
  textMuted: "#757575",
  incomeBg: "#E8F5E9",
  expenseBg: "#FFEBEE",
  incomeText: "#2E7D32",
  expenseText: "#C62828",
  border: "#EEEEEE",
  progressBg: "#E0E0E0",
};

export default function DashboardScreen() {
  const router = useRouter();

  // 2. Ambil isi transaksi dari brankas
  const { transactions } = useTransactions();

  // 3. Rumus menghitung Saldo, Pemasukan, dan Pengeluaran
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, current) => sum + current.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Fungsi pembantu agar angka menjadi format Rupiah (ex: 2500000 -> Rp 2.500.000)
  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu-outline" size={28} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beranda</Text>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={24} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
          <View style={styles.balanceRow}>
            {/* 4. Tampilkan saldo dinamis */}
            <Text style={styles.balanceAmount}>{formatRp(currentBalance)}</Text>
            <TouchableOpacity>
              <Ionicons name="eye-outline" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.incomeBg }]}
          >
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            {/* 5. Tampilkan pemasukan dinamis */}
            <Text style={[styles.summaryValue, { color: colors.textMain }]}>
              {formatRp(totalIncome)}
            </Text>
          </View>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.expenseBg }]}
          >
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            {/* 6. Tampilkan pengeluaran dinamis */}
            <Text style={[styles.summaryValue, { color: colors.textMain }]}>
              {formatRp(totalExpense)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Ionicons name="wallet-outline" size={20} color={colors.textMain} />
            <Text style={styles.budgetLabel}>Sisa Bulan Ini</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetAmount}>{formatRp(currentBalance)}</Text>
            <Text style={styles.budgetPercent}>50%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "50%" }]} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pengeluaran per Kategori</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* Daftar Kategori (Sementara Tetap Statis) */}
        <View style={styles.categoryList}>
          <View style={styles.categoryItem}>
            <View style={[styles.iconBg, { backgroundColor: "#E0F7FA" }]}>
              <Ionicons name="restaurant-outline" size={20} color="#0097A7" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>Makan</Text>
              <View style={styles.catProgressBg}>
                <View
                  style={[
                    styles.catProgressFill,
                    { width: "36%", backgroundColor: "#0097A7" },
                  ]}
                />
              </View>
            </View>
            <View style={styles.categoryStats}>
              <Text style={styles.categoryAmount}>Rp 450.000</Text>
              <Text style={styles.categoryPercent}>36%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  container: { paddingHorizontal: 20, paddingTop: 10 },
  balanceSection: { marginBottom: 24 },
  balanceLabel: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceAmount: { fontSize: 32, fontWeight: "bold", color: colors.textMain },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: { width: "48%", padding: 16, borderRadius: 12 },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  budgetCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetLabel: { fontSize: 14, color: colors.textMuted, marginLeft: 8 },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetAmount: { fontSize: 20, fontWeight: "bold", color: colors.textMain },
  budgetPercent: { fontSize: 14, fontWeight: "bold", color: colors.textMain },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.progressBg,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.textMain },
  seeAllText: { fontSize: 14, color: colors.primary, fontWeight: "500" },
  categoryList: { marginBottom: 20 },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfo: { flex: 1, marginRight: 12 },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMain,
    marginBottom: 6,
  },
  catProgressBg: {
    height: 4,
    backgroundColor: colors.progressBg,
    borderRadius: 2,
  },
  catProgressFill: { height: "100%", borderRadius: 2 },
  categoryStats: { alignItems: "flex-end" },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMain,
    marginBottom: 2,
  },
  categoryPercent: { fontSize: 12, color: colors.textMuted },
});
