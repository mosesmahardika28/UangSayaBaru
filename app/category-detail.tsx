import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
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

export default function CategoryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { transactions, categories } = useTransactions();

  const month = params.month !== undefined ? Number(params.month) : "all";
  const year = params.year ? Number(params.year) : new Date().getFullYear();

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
    const matchesYear = tDate.getFullYear() === year;
    if (month === "all") {
      return t.type === "expense" && matchesYear;
    }
    return t.type === "expense" && tDate.getMonth() === month && matchesYear;
  });

  const totalExpense = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rincian Kategori</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.totalLabel}>Total Pengeluaran Periode Ini</Text>
        <Text style={styles.totalAmount}>{formatRp(totalExpense)}</Text>

        {categoryStats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="stats-chart-outline"
              size={48}
              color={colors.border}
            />
            <Text style={styles.emptyStateText}>
              Tidak ada data pengeluaran
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
                        size={18}
                        color={catInfo.color}
                      />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{item.name}</Text>
                      <Text style={styles.categoryPercentage}>
                        {item.percentage}% dari total
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatRp(item.amount)}
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
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  container: { padding: 20 },
  totalLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textMain,
    marginBottom: 24,
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
  categoryInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryName: { fontSize: 15, fontWeight: "600", color: colors.textMain },
  categoryPercentage: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  categoryAmount: { fontSize: 15, fontWeight: "bold", color: colors.textMain },
  subProgressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  subProgressFill: { height: "100%", borderRadius: 3 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 50 },
  emptyStateText: { marginTop: 10, fontSize: 15, color: colors.textMuted },
});
