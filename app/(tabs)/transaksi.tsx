import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction, useTransactions } from "../../context/TransactionContext";

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
  const { transactions, updateTransaction, deleteTransaction } =
    useTransactions();
  const [filter, setFilter] = useState("Semua");

  // Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Modal Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    const matchesTab =
      filter === "Semua" ||
      (filter === "Pemasukan" && t.type === "income") ||
      (filter === "Pengeluaran" && t.type === "expense");

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.note.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.amount.toString().includes(query);

    return matchesTab && matchesSearch;
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

  const openEditModal = (item: Transaction) => {
    setCurrentEditId(item.id);
    setEditAmount(item.amount.toString());
    setEditNote(item.note);
    setEditType(item.type);
    setEditCategory(item.category);
    setEditDate(item.date);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editAmount) {
      alert("Nominal tidak boleh kosong!");
      return;
    }

    updateTransaction(currentEditId, {
      type: editType,
      amount: parseInt(editAmount.replace(/[^0-9]/g, "")) || 0,
      category: editCategory,
      date: editDate,
      note: editNote,
    });

    setEditModalVisible(false);
    alert("Transaksi berhasil diperbarui!");
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      "Hapus Transaksi",
      `Apakah Anda yakin ingin menghapus "${title}"?`,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <TouchableOpacity
          onPress={() => {
            setIsSearching(!isSearching);
            if (isSearching) setSearchQuery("");
          }}
        >
          <Ionicons
            name={isSearching ? "close-outline" : "search-outline"}
            size={24}
            color={colors.textMain}
          />
        </TouchableOpacity>
      </View>

      {isSearching && (
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari catatan, kategori, atau nominal..."
            placeholderTextColor="#BDBDBD"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

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
            <Ionicons name="search-outline" size={48} color={colors.border} />
            <Text style={styles.emptyStateText}>Transaksi tidak ditemukan</Text>
          </View>
        ) : (
          filteredTransactions.map((item) => {
            const iconInfo = getIconInfo(item.type);
            const title = item.note ? item.note : item.category;
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
                  <Text style={styles.transactionTitle}>{title}</Text>
                  <Text style={styles.transactionCategory}>
                    {item.category} • {formatDate(item.date)}
                  </Text>
                </View>
                <View style={styles.rightSection}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          item.type === "income"
                            ? colors.income
                            : colors.expense,
                      },
                    ]}
                  >
                    {item.type === "income" ? "+" : "-"} {formatRp(item.amount)}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#1565C0"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => confirmDelete(item.id, title)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#E53935"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modal Edit Transaksi */}
      {/* Modal Edit Transaksi */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        {/* Backdrop luar: Jika diklik, modal tertutup */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          {/* Konten dalam: onStartShouldSetResponder mencegah klik di dalam ikut menutup modal */}
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Transaksi</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nominal (Rp)</Text>
              <TextInput
                style={styles.input}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
                placeholder="Masukkan nominal"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catatan</Text>
              <TextInput
                style={styles.input}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Tulis catatan..."
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </TouchableOpacity>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textMain },
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
  rightSection: { alignItems: "flex-end" },
  transactionAmount: { fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  actionButtons: { flexDirection: "row", alignItems: "center" },
  actionIcon: { padding: 4, marginLeft: 8 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 50 },
  emptyStateText: { marginTop: 10, fontSize: 16, color: colors.textMuted },
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: colors.textMain,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
