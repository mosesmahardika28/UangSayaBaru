import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
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
};

// Pemetaan ikon untuk kategori
const categoryIcons: {
  [key: string]: { icon: string; color: string; bg: string };
} = {
  Makan: { icon: "restaurant", color: "#0097A7", bg: "#E0F7FA" },
  Transportasi: { icon: "bus", color: "#F57C00", bg: "#FFF3E0" },
  Kuliah: { icon: "school", color: "#388E3C", bg: "#E8F5E9" },
  Belanja: { icon: "cart", color: "#E91E63", bg: "#FCE4EC" },
  Hiburan: { icon: "game-controller", color: "#673AB7", bg: "#EDE7F6" },
  Kesehatan: { icon: "medical", color: "#F44336", bg: "#FFEBEE" },
  Lainnya: { icon: "ellipsis-horizontal", color: "#757575", bg: "#EEEEEE" },
};

export default function StatistikScreen() {
  const { transactions } = useTransactions();

  // Ambil hanya transaksi pengeluaran (expense)
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Total pengeluaran
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

  // Mengelompokkan pengeluaran berdasarkan kategori secara dinamis
  const categoryMap: { [key: string]: number } = {};
  expenseTransactions.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = 0;
    }
    categoryMap[t.category] += t.amount;
  });

  // Ubah object ke array untuk di-mapping
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistik</Text>
        <TouchableOpacity style={styles.monthSelector}>
          <Text style={styles.monthText}>Bulan Ini</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Total Pengeluaran */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
          <Text style={styles.summaryAmount}>{formatRp(totalExpense)}</Text>
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
              Belum ada data pengeluaran
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
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
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
    fontSize: 14,
  },
  container: { padding: 20 },
  summaryCard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
  },
  summaryAmount: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
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
  progressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 30 },
  emptyStateText: { marginTop: 10, fontSize: 15, color: colors.textMuted },
});
