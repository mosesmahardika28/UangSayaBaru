import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { resetAppData, debts, transactions, budget, categories } =
    useTransactions();
  const { theme, colors, toggleTheme } = useTheme();

  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  const isDarkMode = theme === "dark";
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // --- LOGIKA PERINGATAN SISTEM ---

  // 1. Peringatan Utang & Piutang Jatuh Tempo (Belum lunas & tenggat <= hari ini)
  const overdueDebts = debts.filter((d) => {
    if (d.isPaid) return false;
    if (!d.dueDate) return false;
    return d.dueDate <= todayStr;
  });

  // 2. Transaksi Bulan Ini (Pemasukan vs Pengeluaran)
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

  // 3. Peringatan Anggaran Utama Penuh/Melebihi Batas
  const isBudgetExceeded =
    budget.amount > 0 && totalExpenseThisMonth >= budget.amount;

  // 4. Peringatan Anggaran per Kategori (Mencapai atau melewati batas budget kategori)
  // Fungsi helper cek periode transaksi kategori
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

  const exceededCategories = categories.filter((cat) => {
    if (cat.type !== "expense" || !cat.budget || cat.budget <= 0) return false;

    // Hitung total pengeluaran untuk kategori ini sesuai periodenya
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

    return spent >= cat.budget; // Menyamai atau melewati batas anggaran kategori
  });

  // 5. Peringatan Defisit (Pengeluaran > Pemasukan)
  const isDeficit =
    totalIncomeThisMonth > 0 && totalExpenseThisMonth > totalIncomeThisMonth;

  // Total Kumpulan Notifikasi Aktif
  const activeAlertsCount =
    overdueDebts.length +
    (isBudgetExceeded ? 1 : 0) +
    exceededCategories.length +
    (isDeficit ? 1 : 0);

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");

  const handleResetApp = () => {
    Alert.alert(
      "Zona Berbahaya: Reset Aplikasi",
      "Semua data transaksi, dompet, kategori, dan anggaran akan dihapus permanen. Apakah Anda yakin?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Reset Semua",
          style: "destructive",
          onPress: async () => {
            await resetAppData();
            Alert.alert("Sukses", "Aplikasi telah diatur ulang.");
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Pengaturan
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* SEKSI NOTIFIKASI & PERINGATAN */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Notifikasi & Peringatan
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsAlertModalVisible(true)}
          >
            <View
              style={[
                styles.iconBg,
                {
                  backgroundColor:
                    activeAlertsCount > 0
                      ? colors.danger + "20"
                      : colors.primary + "20",
                },
              ]}
            >
              <Ionicons
                name={
                  activeAlertsCount > 0
                    ? "notifications"
                    : "notifications-outline"
                }
                size={20}
                color={activeAlertsCount > 0 ? colors.danger : colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.textMain }]}>
                Pusat Peringatan
              </Text>
              <Text style={[styles.subText, { color: colors.textMuted }]}>
                {activeAlertsCount > 0
                  ? `${activeAlertsCount} peringatan membutuhkan perhatian`
                  : "Semua indikator keuangan aman"}
              </Text>
            </View>

            {/* Badge Angka Peringatan */}
            {activeAlertsCount > 0 && (
              <View
                style={[styles.badgeCount, { backgroundColor: colors.danger }]}
              >
                <Text style={styles.badgeCountText}>{activeAlertsCount}</Text>
              </View>
            )}

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>

        {/* Seksi Tampilan (Mode Gelap / Terang) */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textMuted, marginTop: 20 },
          ]}
        >
          Tampilan & Tema
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.menuItem}>
            <View
              style={[
                styles.iconBg,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name={isDarkMode ? "moon-outline" : "sunny-outline"}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.textMain }]}>
                Mode Gelap
              </Text>
              <Text style={[styles.subText, { color: colors.textMuted }]}>
                {isDarkMode ? "Aktif (Dark Mode)" : "Nonaktif (Light Mode)"}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D1D1", true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Seksi Data & Keamanan */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textMuted, marginTop: 20 },
          ]}
        >
          Data & Keamanan
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Ekspor Data */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/export")}
          >
            <View
              style={[
                styles.iconBg,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.menuText, { color: colors.textMain }]}>
              Ekspor Data (CSV)
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Impor Data */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/import")}
          >
            <View
              style={[styles.iconBg, { backgroundColor: colors.accent + "20" }]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.menuText, { color: colors.textMain }]}>
              Impor Data (CSV)
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Pengaturan Keamanan */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/keamanan" as any)}
          >
            <View
              style={[
                styles.iconBg,
                { backgroundColor: colors.transfer + "20" },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.transfer}
              />
            </View>
            <Text style={[styles.menuText, { color: colors.textMain }]}>
              Pengaturan Keamanan
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Zona Berbahaya */}
        <Text
          style={[styles.sectionTitle, { color: colors.danger, marginTop: 24 }]}
        >
          Zona Berbahaya
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: isDarkMode ? "#5A2525" : "#FFCDD2",
            },
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={handleResetApp}>
            <View
              style={[styles.iconBg, { backgroundColor: colors.danger + "20" }]}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </View>
            <Text style={[styles.menuText, { color: colors.danger }]}>
              Reset Aplikasi (Hapus Semua Data)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL PUSAT PERINGATAN */}
      <Modal visible={isAlertModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsAlertModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="warning-outline"
                  size={22}
                  color={colors.danger}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                  Pusat Peringatan
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAlertModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeAlertsCount === 0 ? (
                <View style={styles.emptyAlertBox}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.emptyAlertText, { color: colors.textMain }]}
                  >
                    Tidak Ada Peringatan
                  </Text>
                  <Text
                    style={[
                      styles.emptyAlertSubtext,
                      { color: colors.textMuted },
                    ]}
                  >
                    Seluruh anggaran, transaksi, kategori, dan utang piutang
                    Anda saat ini dalam kondisi aman.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Item Peringatan Utang/Piutang Jatuh Tempo */}
                  {overdueDebts.map((debt) => (
                    <TouchableOpacity
                      key={debt.id}
                      style={[
                        styles.alertCard,
                        {
                          backgroundColor: isDarkMode ? "#3E1E1E" : "#FFEBEE",
                          borderColor: colors.danger,
                        },
                      ]}
                      onPress={() => {
                        setIsAlertModalVisible(false);
                        router.push("/debts" as any);
                      }}
                    >
                      <Ionicons
                        name="time-outline"
                        size={22}
                        color={colors.danger}
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.alertTitle, { color: colors.danger }]}
                        >
                          {debt.type === "borrow"
                            ? "Utang Jatuh Tempo"
                            : "Piutang Jatuh Tempo"}
                        </Text>
                        <Text
                          style={[styles.alertSub, { color: colors.textMain }]}
                        >
                          {debt.type === "borrow"
                            ? `Utang ke ${debt.name} sebesar ${formatRp(debt.amount)}`
                            : `Piutang dari ${debt.name} sebesar ${formatRp(debt.amount)}`}
                        </Text>
                        <Text
                          style={[
                            styles.alertDate,
                            { color: colors.textMuted },
                          ]}
                        >
                          Tenggat: {debt.dueDate}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  ))}

                  {/* Item Peringatan Anggaran Utama Penuh / Overbudget */}
                  {isBudgetExceeded && (
                    <TouchableOpacity
                      style={[
                        styles.alertCard,
                        {
                          backgroundColor: isDarkMode ? "#3E2E1E" : "#FFF3E0",
                          borderColor: "#F57C00",
                        },
                      ]}
                      onPress={() => {
                        setIsAlertModalVisible(false);
                        router.push("/statistik" as any);
                      }}
                    >
                      <Ionicons
                        name="pie-chart-outline"
                        size={22}
                        color="#F57C00"
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.alertTitle, { color: "#F57C00" }]}>
                          Anggaran Melebihi Batas
                        </Text>
                        <Text
                          style={[styles.alertSub, { color: colors.textMain }]}
                        >
                          Total pengeluaran bulan ini (
                          {formatRp(totalExpenseThisMonth)}) telah
                          mencapai/melebihi target anggaran (
                          {formatRp(budget.amount)}).
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#F57C00"
                      />
                    </TouchableOpacity>
                  )}

                  {/* Item Peringatan Anggaran Per Kategori */}
                  {exceededCategories.map((cat) => {
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

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.alertCard,
                          {
                            backgroundColor: isDarkMode ? "#3E2E1E" : "#FFF3E0",
                            borderColor: "#F57C00",
                          },
                        ]}
                        onPress={() => {
                          setIsAlertModalVisible(false);
                          router.push("/kategori" as any);
                        }}
                      >
                        <Ionicons
                          name="pricetag-outline"
                          size={22}
                          color="#F57C00"
                          style={{ marginRight: 12 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[styles.alertTitle, { color: "#F57C00" }]}
                          >
                            Anggaran Kategori "{cat.name}" Penuh
                          </Text>
                          <Text
                            style={[
                              styles.alertSub,
                              { color: colors.textMain },
                            ]}
                          >
                            Pengeluaran kategori ini ({formatRp(spent)}) telah
                            mencapai atau melewati batas anggaran (
                            {formatRp(cat.budget || 0)}).
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#F57C00"
                        />
                      </TouchableOpacity>
                    );
                  })}

                  {/* Item Peringatan Defisit */}
                  {isDeficit && (
                    <TouchableOpacity
                      style={[
                        styles.alertCard,
                        {
                          backgroundColor: isDarkMode ? "#3E1E1E" : "#FFEBEE",
                          borderColor: colors.danger,
                        },
                      ]}
                      onPress={() => {
                        setIsAlertModalVisible(false);
                        router.push("/statistik" as any);
                      }}
                    >
                      <Ionicons
                        name="trending-down-outline"
                        size={22}
                        color={colors.danger}
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.alertTitle, { color: colors.danger }]}
                        >
                          Defisit Keuangan Bulan Ini
                        </Text>
                        <Text
                          style={[styles.alertSub, { color: colors.textMain }]}
                        >
                          Pengeluaran Anda ({formatRp(totalExpenseThisMonth)})
                          lebih besar dari pemasukan (
                          {formatRp(totalIncomeThisMonth)}).
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
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
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  emptyAlertBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyAlertText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyAlertSubtext: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  alertSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  alertDate: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
});
