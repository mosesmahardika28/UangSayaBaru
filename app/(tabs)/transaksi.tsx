import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Memanggil brankas data
import { useTransactions } from "../../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
  expense: "#E53935",
  income: "#43A047",
};

export default function TransaksiScreen() {
  // Mengambil data dari Context
  const { transactions } = useTransactions();

  // State untuk menyimpan filter yang sedang aktif
  const [filter, setFilter] = useState("Semua");

  // Logika filter: menyaring data berdasarkan tab yang ditekan
  const filteredTransactions = transactions.filter((t) => {
    if (filter === "Pemasukan") return t.type === "income";
    if (filter === "Pengeluaran") return t.type === "expense";
    return true; // Menampilkan semua jika filter adalah "Semua"
  });

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIconInfo = (type: string) => {
    if (type === "income") {
      return { icon: "wallet-outline", color: "#388E3C", bg: "#E8F5E9" };
    }
    return { icon: "cash-outline", color: "#E53935", bg: "#FFEBEE" };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {["Semua", "Pemasukan", "Pengeluaran"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              filter === item && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.border}
            />
            <Text style={styles.emptyStateText}>Belum ada transaksi</Text>
          </View>
        ) : (
          filteredTransactions.map((item) => {
            const iconInfo = getIconInfo(item.type);
            return (
              <View key={item.id} style={styles.transactionItem}>
                <View style={[styles.iconBg, { backgroundColor: iconInfo.bg }]}>
                  <Ionicons
                    name={iconInfo.icon as any}
                    size={24}
                    color={iconInfo.color}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {item.note ? item.note : item.category}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {item.category} • {formatDate(item.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        item.type === "income" ? colors.income : colors.expense,
                    },
                  ]}
                >
                  {item.type === "income" ? "+" : "-"} {formatRp(item.amount)}
                </Text>
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 10,
  },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 16, fontWeight: "600", color: colors.textMain },
  transactionCategory: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 50 },
  emptyStateText: { marginTop: 10, fontSize: 16, color: colors.textMuted },
});
