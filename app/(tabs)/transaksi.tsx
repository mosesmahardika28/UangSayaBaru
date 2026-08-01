import { Ionicons } from "@expo/vector-icons";
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
import { useTransactions } from "../../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  primary: "#43A047",
  textMain: "#212121",
  textMuted: "#757575",
  incomeText: "#2E7D32",
  expenseText: "#C62828",
  border: "#EEEEEE",
  transfer: "#1E88E5",
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

export default function TransaksiScreen() {
  const { transactions, wallets, categories, deleteTransaction } =
    useTransactions();

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
      : { icon: "pricetag-outline", color: "#757575", bg: "#EEEEEE" };
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

  const handleDelete = (id: string) => {
    Alert.alert(
      "Hapus Transaksi",
      "Yakin ingin menghapus transaksi ini? Saldo dompet akan otomatis disesuaikan kembali.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.monthText}>{displayText}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Kolom Pencarian */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari transaksi atau catatan..."
            placeholderTextColor="#BDBDBD"
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
                selectedWalletId === "all" && styles.walletPillActive,
              ]}
              onPress={() => setSelectedWalletId("all")}
            >
              <Text
                style={[
                  styles.walletPillText,
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
                  selectedWalletId === w.id && styles.walletPillActive,
                ]}
                onPress={() => setSelectedWalletId(w.id)}
              >
                <Text
                  style={[
                    styles.walletPillText,
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
              <Text style={styles.emptyStateText}>
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
                style={styles.transactionItem}
                activeOpacity={0.7}
                onLongPress={() => handleDelete(t.id)}
              >
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
                    size={22}
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
                  <Text style={styles.transactionDate}>
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.textMain },
  walletPill: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  walletPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  walletPillText: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  walletPillTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMain,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  transactionDate: { fontSize: 11, color: "#9E9E9E", fontWeight: "500" },
  transactionAmount: { fontSize: 15, fontWeight: "bold" },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyStateText: { marginTop: 12, fontSize: 15, color: colors.textMuted },
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
});
