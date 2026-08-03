import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useTransactions } from "../../context/TransactionContext";

export default function DashboardScreen() {
  const router = useRouter();
  const { transactions, wallets, categories, debts, budget } =
    useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  // State Toggle Sembunyikan/Tampilkan Saldo
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // --- HITUNG JUMLAH PERINGATAN AKTIF UNTUK INDIKATOR BADGE ---
  const overdueDebts = debts.filter((d) => {
    if (d.isPaid) return false;
    if (!d.dueDate) return false;
    return d.dueDate <= todayStr;
  });

  const thisMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return (
      tDate.getMonth() === currentMonth &&
      tDate.getFullYear() === currentYear &&
      !t.isDebtRelated
    );
  });

  const totalExpenseThisMonth = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeThisMonth = thisMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const isBudgetExceeded =
    budget.amount > 0 && totalExpenseThisMonth >= budget.amount;

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
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    }
  };

  const exceededCategoriesCount = categories.filter((cat) => {
    if (cat.type !== "expense" || !cat.budget || cat.budget <= 0) return false;
    const spent = transactions
      .filter(
        (t) =>
          !t.isDebtRelated &&
          t.type === "expense" &&
          t.category === cat.name &&
          isTransactionInPeriod(
            t.date,
            (cat as any).budgetPeriod,
            (cat as any).budgetDuration,
          ),
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return spent >= cat.budget;
  }).length;

  const isDeficit =
    totalIncomeThisMonth > 0 && totalExpenseThisMonth > totalIncomeThisMonth;

  const activeAlertsCount =
    overdueDebts.length +
    (isBudgetExceeded ? 1 : 0) +
    exceededCategoriesCount +
    (isDeficit ? 1 : 0);

  // -------------------------------------------------------------

  const totalIncome = transactions
    .filter((t) => t.type === "income" && !t.isDebtRelated)
    .reduce((sum, current) => sum + current.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && !t.isDebtRelated)
    .reduce((sum, current) => sum + current.amount, 0);

  const totalAllWallets = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  const formatRp = (angka: number) => {
    if (isBalanceHidden) return "Rp ••••••••";
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
      : {
          icon: "pricetag-outline",
          color: colors.textMuted,
          bg: colors.border,
        };
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Beranda
        </Text>

        <View style={styles.headerRightActions}>
          {/* Tombol Pengaturan (Settings) dengan Indikator Peringatan */}
          <TouchableOpacity
            style={styles.settingsBtnContainer}
            onPress={() => router.push("/settings" as any)}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.textMain}
            />
            {activeAlertsCount > 0 && (
              <View
                style={[styles.alertBadge, { backgroundColor: colors.danger }]}
              >
                <Ionicons name="alert" size={10} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Saldo Gabungan */}
        <TouchableOpacity
          style={[
            styles.balanceSection,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push("/wallets")}
        >
          <View style={styles.balanceHeaderRow}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>
              Total Saldo Seluruh Dompet
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceAmount, { color: colors.textMain }]}>
              {formatRp(totalAllWallets)}
            </Text>
            {/* Tombol Toggle Sembunyikan Saldo */}
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => setIsBalanceHidden(!isBalanceHidden)}
            >
              <Ionicons
                name={isBalanceHidden ? "eye-off-outline" : "eye-outline"}
                size={24}
                color={colors.textMain}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Ringkasan Pemasukan & Pengeluaran */}
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: isDarkMode ? colors.incomeBg : "#E8F5E9" },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              Pemasukan
            </Text>
            <Text style={[styles.summaryValue, { color: colors.incomeText }]}>
              {formatRp(totalIncome)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: isDarkMode ? colors.expenseBg : "#FFEBEE" },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              Pengeluaran
            </Text>
            <Text style={[styles.summaryValue, { color: colors.expenseText }]}>
              {formatRp(totalExpense)}
            </Text>
          </View>
        </View>

        {/* SECTION: Daftar Dompet Saya */}
        <View style={styles.walletsSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
            Dompet Saya
          </Text>
          <TouchableOpacity onPress={() => router.push("/wallets")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletHorizontalList}
        >
          {wallets.map((w) => {
            const wColor = w.color || colors.primary;
            return (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.walletCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/wallet-detail" as any,
                    params: { walletId: w.id, walletName: w.name },
                  })
                }
              >
                <View style={styles.walletCardTop}>
                  <View
                    style={[
                      styles.walletIconBox,
                      { backgroundColor: wColor + "20" },
                    ]}
                  >
                    <Ionicons name={w.icon as any} size={20} color={wColor} />
                  </View>
                  <Text
                    style={[styles.walletName, { color: colors.textMain }]}
                    numberOfLines={1}
                  >
                    {w.name}
                  </Text>
                </View>

                <View style={styles.walletCardBottom}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.walletBalanceLabel,
                        { color: colors.textMuted },
                      ]}
                    >
                      Saldo
                    </Text>
                    <Text
                      style={[
                        styles.walletBalanceVal,
                        { color: colors.textMain },
                      ]}
                      numberOfLines={1}
                    >
                      {formatRp(w.balance || 0)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.quickAddBtn, { backgroundColor: wColor }]}
                    onPress={() =>
                      router.push({
                        pathname: "/add-transaction" as any,
                        params: { walletId: w.id },
                      })
                    }
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Kartu Menu Target Impian */}
        <TouchableOpacity
          style={[
            styles.goalBannerCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push("/goals" as any)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={[
                styles.goalIconBg,
                { backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9" },
              ]}
            >
              <Ionicons name="trophy" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.goalBannerTitle, { color: colors.textMain }]}
              >
                Target Impian (Goals)
              </Text>
              <Text style={[styles.goalBannerSub, { color: colors.textMuted }]}>
                Kelola tabungan & capai targetmu
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Kartu Menu Utang & Piutang */}
        <TouchableOpacity
          style={[
            styles.goalBannerCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push("/debts" as any)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={[
                styles.goalIconBg,
                { backgroundColor: isDarkMode ? "#1C3144" : "#E3F2FD" },
              ]}
            >
              <Ionicons
                name="swap-horizontal"
                size={22}
                color={colors.transfer}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.goalBannerTitle, { color: colors.textMain }]}
              >
                Utang & Piutang
              </Text>
              <Text style={[styles.goalBannerSub, { color: colors.textMuted }]}>
                Catat uang dipinjam & meminjam
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
            Riwayat Transaksi
          </Text>
          <TouchableOpacity onPress={() => router.push("/transaksi" as any)}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daftar Riwayat Transaksi Dinamis */}
        <View style={styles.transactionList}>
          {transactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada transaksi tercatat
            </Text>
          ) : (
            transactions.slice(0, 5).map((t) => {
              const isTransfer = t.type === "transfer";
              const catInfo = getCategoryIcon(t.category);
              const fromWalletName = getWalletName(t.walletId);
              const toWalletName = t.toWalletId
                ? getWalletName(t.toWalletId)
                : "";

              return (
                <View
                  key={t.id}
                  style={[
                    styles.transactionItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBg,
                      {
                        backgroundColor: isTransfer
                          ? isDarkMode
                            ? "#1C3144"
                            : "#E3F2FD"
                          : catInfo.bg,
                      },
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
                    <Text
                      style={[
                        styles.transactionTitle,
                        { color: colors.textMain },
                      ]}
                    >
                      {isTransfer
                        ? `Transfer (${fromWalletName} ➔ ${toWalletName})`
                        : t.category}
                    </Text>
                    <Text
                      style={[
                        styles.transactionSubtitle,
                        { color: colors.textMuted },
                      ]}
                    >
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
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  headerRightActions: { flexDirection: "row", alignItems: "center" },
  settingsBtnContainer: { position: "relative" },
  alertBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  container: { paddingHorizontal: 20, paddingTop: 10 },
  balanceSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  balanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  balanceLabel: { fontSize: 13, fontWeight: "500" },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceAmount: { fontSize: 28, fontWeight: "bold" },

  // WALLETS HORIZONTAL SECTION
  walletsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  walletHorizontalList: {
    paddingBottom: 4,
    marginBottom: 20,
    gap: 12,
  },
  walletCard: {
    width: 160,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  walletCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  walletIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  walletName: { fontSize: 14, fontWeight: "bold", flex: 1 },
  walletCardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  walletBalanceLabel: { fontSize: 11, marginBottom: 2 },
  walletBalanceVal: { fontSize: 14, fontWeight: "bold" },
  quickAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: { width: "48%", padding: 16, borderRadius: 12 },
  summaryLabel: { fontSize: 12, marginBottom: 8 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  goalBannerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  goalIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalBannerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  goalBannerSub: { fontSize: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  seeAllText: { fontSize: 14, fontWeight: "500" },
  transactionList: { marginBottom: 20 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  transactionSubtitle: { fontSize: 12 },
  transactionAmount: { fontSize: 14, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 10 },
});
