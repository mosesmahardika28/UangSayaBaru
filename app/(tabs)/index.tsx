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
  transfer: "#1E88E5",
};

export default function DashboardScreen() {
  const router = useRouter();
  const { transactions, wallets, categories } = useTransactions();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalAllWallets = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const getWalletName = (id: string) => {
    const w = wallets.find((item) => item.id === id);
    return w ? w.name : "Dompet";
  };

  const getCategoryIcon = (catName: string) => {
    const c = categories.find((item) => item.name === catName);
    return c
      ? { icon: c.icon, color: c.color, bg: c.bg }
      : { icon: "pricetag-outline", color: "#757575", bg: "#EEEEEE" };
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
        {/* Kartu Saldo Gabungan */}
        <TouchableOpacity
          style={styles.balanceSection}
          activeOpacity={0.8}
          onPress={() => router.push("/wallets")}
        >
          <View style={styles.balanceHeaderRow}>
            <Text style={styles.balanceLabel}>Total Saldo Dompet</Text>
            <View style={styles.walletLinkRow}>
              <Text style={styles.walletLinkText}>Kelola</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </View>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {formatRp(totalAllWallets)}
            </Text>
            <Ionicons name="wallet-outline" size={26} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.summaryRow}>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.incomeBg }]}
          >
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            <Text style={[styles.summaryValue, { color: colors.incomeText }]}>
              {formatRp(totalIncome)}
            </Text>
          </View>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.expenseBg }]}
          >
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            <Text style={[styles.summaryValue, { color: colors.expenseText }]}>
              {formatRp(totalExpense)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
          <TouchableOpacity onPress={() => router.push("/transaksi" as any)}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* Daftar Riwayat Transaksi Dinamis */}
        <View style={styles.transactionList}>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada transaksi tercatat</Text>
          ) : (
            transactions.slice(0, 5).map((t) => {
              const isTransfer = t.type === "transfer";
              const catInfo = getCategoryIcon(t.category);
              const fromWalletName = getWalletName(t.walletId);
              const toWalletName = t.toWalletId
                ? getWalletName(t.toWalletId)
                : "";

              return (
                <View key={t.id} style={styles.transactionItem}>
                  <View
                    style={[
                      styles.iconBg,
                      { backgroundColor: isTransfer ? "#E3F2FD" : catInfo.bg },
                    ]}
                  >
                    <Ionicons
                      name={
                        isTransfer ? "swap-horizontal" : (catInfo.icon as any)
                      }
                      size={20}
                      color={isTransfer ? colors.transfer : catInfo.color}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {isTransfer
                        ? `Transfer (${fromWalletName} ➔ ${toWalletName})`
                        : t.category}
                    </Text>
                    <Text style={styles.transactionSubtitle}>
                      {fromWalletName} {t.note ? `• ${t.note}` : ""}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          t.type === "income"
                            ? colors.incomeText
                            : t.type === "expense"
                              ? colors.expenseText
                              : colors.transfer,
                      },
                    ]}
                  >
                    {t.type === "income"
                      ? "+ "
                      : t.type === "expense"
                        ? "- "
                        : ""}
                    {formatRp(t.amount)}
                  </Text>
                </View>
              );
            })
          )}
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
  balanceSection: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  balanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  balanceLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  walletLinkRow: { flexDirection: "row", alignItems: "center" },
  walletLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginRight: 2,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceAmount: { fontSize: 28, fontWeight: "bold", color: colors.textMain },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: { width: "48%", padding: 16, borderRadius: 12 },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.textMain },
  seeAllText: { fontSize: 14, color: colors.primary, fontWeight: "500" },
  transactionList: { marginBottom: 20 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: { flex: 1, marginRight: 10 },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMain,
    marginBottom: 2,
  },
  transactionSubtitle: { fontSize: 12, color: colors.textMuted },
  transactionAmount: { fontSize: 14, fontWeight: "bold" },
  emptyText: { textAlign: "center", color: colors.textMuted, marginTop: 10 },
});
