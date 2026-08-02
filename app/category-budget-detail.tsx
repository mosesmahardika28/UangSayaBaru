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
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

export default function CategoryBudgetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { transactions, wallets } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const categoryName = (params.categoryName as string) || "Kategori";
  const budget = parseFloat(params.budget as string) || 0;
  const period = (params.period as string) || "Bulanan";
  const periodType = (params.periodType as string) || "monthly";
  const durationMonths = params.duration
    ? parseInt(params.duration as string)
    : undefined;

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");

  const getWalletName = (id: string) => {
    const w = wallets.find((item) => item.id === id);
    return w ? w.name : "Dompet";
  };

  // Fungsi pengecekan periode yang sama persis dengan di menu kategori
  const isTransactionInPeriod = (txDate: string) => {
    const tDate = new Date(txDate);
    const now = new Date();

    if (periodType === "weekly") {
      const diffTime = now.getTime() - tDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    } else if (periodType === "custom" && durationMonths) {
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

  // Filter transaksi khusus kategori ini yang masuk dalam periode anggaran
  const categoryTransactions = transactions.filter(
    (t) =>
      !t.isDebtRelated &&
      t.type === "expense" &&
      t.category === categoryName &&
      isTransactionInPeriod(t.date),
  );

  const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget - spent;
  const percentage =
    budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          {categoryName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Kartu Ringkasan Anggaran & Progress */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.textMuted }]}>
            Periode: {period}
          </Text>

          <View
            style={[styles.rowDetail, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Batas Anggaran
            </Text>
            <Text style={[styles.value, { color: colors.textMain }]}>
              {formatRp(budget)}
            </Text>
          </View>
          <View
            style={[styles.rowDetail, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Sudah Terpakai
            </Text>
            <Text style={[styles.value, { color: colors.danger }]}>
              {formatRp(spent)}
            </Text>
          </View>
          <View
            style={[
              styles.rowDetail,
              { borderBottomWidth: 0, paddingBottom: 0 },
            ]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Sisa Anggaran
            </Text>
            <Text
              style={[
                styles.value,
                { color: remaining >= 0 ? colors.primary : colors.danger },
              ]}
            >
              {formatRp(remaining)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBg,
                { backgroundColor: isDarkMode ? "#2C2C2C" : colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor:
                      remaining >= 0 ? colors.primary : colors.danger,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {percentage}% terpakai
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
          Riwayat Transaksi Periode Ini
        </Text>

        {categoryTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.border}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada transaksi untuk kategori ini pada periode ini.
            </Text>
          </View>
        ) : (
          categoryTransactions.map((t) => (
            <View
              key={t.id}
              style={[
                styles.txItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.txNote, { color: colors.textMain }]}>
                  {t.note || categoryName}
                </Text>
                <Text style={[styles.txDate, { color: colors.textMuted }]}>
                  {new Date(t.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  • {getWalletName(t.walletId)}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: colors.danger }]}>
                - {formatRp(t.amount)}
              </Text>
            </View>
          ))
        )}
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  label: { fontSize: 14 },
  value: { fontSize: 15, fontWeight: "bold" },
  progressBarContainer: { marginTop: 20 },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: "right" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyState: { alignItems: "center", marginTop: 30 },
  emptyText: { fontSize: 13, textAlign: "center" },
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  txNote: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  txDate: { fontSize: 12 },
  txAmount: { fontSize: 14, fontWeight: "bold" },
});
