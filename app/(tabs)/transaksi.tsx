import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { useTheme } from "../../context/ThemeContext";
import { Transaction, useTransactions } from "../../context/TransactionContext";

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

export default function TransaksiScreen() {
  const router = useRouter();
  const { transactions, wallets, categories, deleteTransaction } =
    useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(
    currentDate.getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State untuk Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");

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
      : {
          icon: "pricetag-outline",
          color: colors.textMuted,
          bg: colors.border,
        };
  };

  // Logika Filter Multi-lapis
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const matchesYear = tDate.getFullYear() === selectedYear;
    const matchesMonth =
      selectedMonth === "all" ? true : tDate.getMonth() === selectedMonth;

    // Filter Dompet (cek dompet asal atau tujuan untuk transfer)
    const matchesWallet =
      selectedWalletId === "all"
        ? true
        : t.walletId === selectedWalletId || t.toWalletId === selectedWalletId;

    // Filter Pencarian Teks
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      t.category.toLowerCase().includes(searchLower) ||
      (t.note && t.note.toLowerCase().includes(searchLower));

    return matchesYear && matchesMonth && matchesWallet && matchesSearch;
  });

  // Fungsi Interaksi Long Press (Edit & Hapus)
  const handleLongPressTransaction = (item: Transaction) => {
    Alert.alert(
      "Kelola Transaksi",
      `Pilih tindakan untuk transaksi "${item.category}" (${formatRp(item.amount)})`,
      [
        {
          text: "Edit Transaksi",
          onPress: () => {
            router.push({
              pathname: "/add-transaction",
              params: { editId: item.id },
            });
          },
        },
        {
          text: "Hapus Transaksi",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Hapus Transaksi",
              "Yakin ingin menghapus transaksi ini? Saldo dompet akan otomatis disesuaikan kembali.",
              [
                { text: "Batal", style: "cancel" },
                {
                  text: "Hapus",
                  style: "destructive",
                  onPress: () => deleteTransaction(item.id),
                },
              ],
            );
          },
        },
        { text: "Batal", style: "cancel" },
      ],
    );
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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Riwayat Transaksi
        </Text>
        <TouchableOpacity
          style={[
            styles.monthSelector,
            { backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9" },
          ]}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={[styles.monthText, { color: colors.primary }]}>
            {displayText}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Kolom Pencarian */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="Cari transaksi atau catatan..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Dompet (Bisa digeser menyamping) */}
        <View style={{ marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.walletPill,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedWalletId === "all" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedWalletId("all")}
            >
              <Text
                style={[
                  styles.walletPillText,
                  { color: colors.textMuted },
                  selectedWalletId === "all" && styles.walletPillTextActive,
                ]}
              >
                Semua Dompet
              </Text>
            </TouchableOpacity>

            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.walletPill,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedWalletId === w.id && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedWalletId(w.id)}
              >
                <Text
                  style={[
                    styles.walletPillText,
                    { color: colors.textMuted },
                    selectedWalletId === w.id && styles.walletPillTextActive,
                  ]}
                >
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daftar Transaksi */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.border} />
              <Text
                style={[styles.emptyStateText, { color: colors.textMuted }]}
              >
                Tidak ada transaksi yang cocok
              </Text>
            </View>
          }
          renderItem={({ item: t }) => {
            const isTransfer = t.type === "transfer";
            const catInfo = getCategoryIcon(t.category);
            const fromWalletName = getWalletName(t.walletId);
            const toWalletName = t.toWalletId
              ? getWalletName(t.toWalletId)
              : "";

            return (
              <TouchableOpacity
                style={[
                  styles.transactionItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                activeOpacity={0.7}
                onLongPress={() => handleLongPressTransaction(t)}
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
                    size={22}
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
                  <Text
                    style={[
                      styles.transactionDate,
                      { color: colors.textMuted },
                    ]}
                  >
                    {new Date(t.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
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
              </TouchableOpacity>
            );
          }}
        />
      </View>

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
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                Pilih Periode
              </Text>
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
                    { borderBottomColor: colors.border },
                    selectedMonth === item.value && {
                      backgroundColor: isDarkMode ? "#1B3E2B" : "#E8F5E9",
                    },
                  ]}
                  onPress={() => {
                    setSelectedMonth(item.value as any);
                    setIsModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      { color: colors.textMain },
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
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  monthText: {
    fontWeight: "600",
    marginRight: 4,
    fontSize: 13,
  },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  walletPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  walletPillText: { fontSize: 13, fontWeight: "500" },
  walletPillTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  transactionInfo: { flex: 1, marginRight: 10 },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  transactionDate: { fontSize: 11, fontWeight: "500" },
  transactionAmount: { fontSize: 15, fontWeight: "bold" },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyStateText: { marginTop: 12, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  modalItemText: { fontSize: 16 },
  modalItemTextActive: { fontWeight: "bold" },
});
