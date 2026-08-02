import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Debt, useTransactions } from "../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
  danger: "#E53935",
  info: "#1E88E5",
};

export default function DebtsScreen() {
  const router = useRouter();
  const { debts, addDebt, toggleDebtPaid, deleteDebt, wallets } =
    useTransactions();

  const [activeTab, setActiveTab] = useState<"lend" | "borrow">("lend");
  const [isModalVisible, setModalVisible] = useState(false);

  // Modal State untuk Pelunasan Aman
  const [isPayModalVisible, setPayModalVisible] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState<Debt | null>(
    null,
  );
  const [payWalletId, setPayWalletId] = useState<string>("");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("31 Des 2026");
  const [note, setNote] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    wallets[0]?.id || "",
  );

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");
  const filteredDebts = debts.filter((d) => d.type === activeTab);

  const handleSave = () => {
    if (!name.trim() || !amount) {
      Alert.alert("Perhatian", "Nama dan nominal tidak boleh kosong!");
      return;
    }

    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, "")) || 0;
    if (parsedAmount <= 0) {
      Alert.alert("Perhatian", "Nominal harus lebih dari 0!");
      return;
    }

    const targetWalletId = selectedWalletId || wallets[0]?.id || "";

    if (!targetWalletId) {
      Alert.alert("Perhatian", "Pilih dompet terlebih dahulu!");
      return;
    }

    addDebt(
      {
        name,
        amount: parsedAmount,
        type: activeTab,
        dueDate,
        note,
        walletId: targetWalletId,
      },
      targetWalletId,
    );

    setName("");
    setAmount("");
    setNote("");
    setModalVisible(false);
  };

  const handlePayClick = (item: Debt) => {
    if (item.isPaid) {
      Alert.alert(
        "Batalkan Status Lunas",
        `Yakin ingin mengubah "${item.name}" kembali menjadi Belum Lunas? Saldo dompet akan disesuaikan kembali.`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Ya, Batalkan",
            style: "destructive",
            onPress: () => toggleDebtPaid(item.id),
          },
        ],
      );
    } else {
      setSelectedDebtForPay(item);
      setPayWalletId(wallets[0]?.id || "");
      setPayModalVisible(true);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedDebtForPay) return;
    const targetWallet = payWalletId || wallets[0]?.id;
    toggleDebtPaid(selectedDebtForPay.id, targetWallet);
    setPayModalVisible(false);
    setSelectedDebtForPay(null);
  };

  const handleDelete = (item: Debt) => {
    Alert.alert(
      "Hapus Catatan",
      `Yakin ingin menghapus catatan dari ${item.name}? Saldo dompet akan disesuaikan kembali.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteDebt(item.id),
        },
      ],
    );
  };

  const getWalletName = (walletId: string) => {
    const w = wallets.find((item) => item.id === walletId);
    return w ? w.name : "Dompet";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utang & Piutang</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "lend" && styles.tabActiveLend]}
          onPress={() => setActiveTab("lend")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "lend" && styles.tabTextActive,
            ]}
          >
            Piutang (Dipinjamkan)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "borrow" && styles.tabActiveBorrow,
          ]}
          onPress={() => setActiveTab("borrow")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "borrow" && styles.tabTextActive,
            ]}
          >
            Utang (Kita Pinjam)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {filteredDebts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>
              Belum ada catatan {activeTab === "lend" ? "piutang" : "utang"}.
            </Text>
          </View>
        ) : (
          filteredDebts.map((item) => (
            <View
              key={item.id}
              style={[styles.card, item.isPaid && { opacity: 0.65 }]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[
                      styles.cardName,
                      item.isPaid && { textDecorationLine: "line-through" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.cardDate}>
                    Dompet: {getWalletName(item.walletId)} • Tenggat:{" "}
                    {item.dueDate}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <Text
                  style={[
                    styles.cardAmount,
                    {
                      color: activeTab === "lend" ? colors.info : colors.danger,
                    },
                  ]}
                >
                  {formatRp(item.amount)}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.statusBtn,
                    item.isPaid ? styles.btnPaid : styles.btnUnpaid,
                  ]}
                  onPress={() => handlePayClick(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.isPaid ? "checkmark-circle" : "time-outline"}
                    size={15}
                    color={item.isPaid ? "#FFF" : "#F57C00"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      item.isPaid && styles.statusBtnTextPaid,
                    ]}
                  >
                    {item.isPaid ? "Lunas" : "Belum Lunas"}
                  </Text>
                </TouchableOpacity>
              </View>
              {item.note && (
                <Text style={styles.cardNote}>Catatan: {item.note}</Text>
              )}
            </View>
          ))
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal Tambah Catatan */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Tambah {activeTab === "lend" ? "Piutang" : "Utang"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Orang</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Budi"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nominal (Rp)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {activeTab === "lend"
                    ? "Sumber Dompet (Uang Keluar)"
                    : "Dompet Tujuan (Uang Masuk)"}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexDirection: "row" }}
                >
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletChip,
                        selectedWalletId === w.id && styles.walletChipActive,
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
                      <Ionicons
                        name={w.icon as any}
                        size={16}
                        color={
                          selectedWalletId === w.id ? "#FFF" : colors.primary
                        }
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.walletChipText,
                          selectedWalletId === w.id && { color: "#FFF" },
                        ]}
                      >
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Catatan (Opsional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Cicilan bulanan"
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Simpan Catatan</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Konfirmasi & Pilih Dompet Pelunasan Aman */}
      <Modal visible={isPayModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setPayModalVisible(false)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Konfirmasi Pelunasan</Text>
                <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
              </View>

              <Text style={styles.payModalSubtext}>
                {selectedDebtForPay?.type === "lend"
                  ? `Pilih dompet tempat dana pelunasan dari ${selectedDebtForPay?.name} diterima:`
                  : `Pilih dompet sumber dana untuk melunasi utang ke ${selectedDebtForPay?.name}:`}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pilih Dompet</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexDirection: "row" }}
                >
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletChip,
                        payWalletId === w.id && styles.walletChipActive,
                      ]}
                      onPress={() => setPayWalletId(w.id)}
                    >
                      <Ionicons
                        name={w.icon as any}
                        size={16}
                        color={payWalletId === w.id ? "#FFF" : colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.walletChipText,
                          payWalletId === w.id && { color: "#FFF" },
                        ]}
                      >
                        {w.name} ({formatRp(w.balance || 0)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.payModalButtonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setPayModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmPayBtn}
                  onPress={handleConfirmPayment}
                >
                  <Text style={styles.confirmPayBtnText}>Tandai Lunas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActiveLend: { backgroundColor: colors.info, borderColor: colors.info },
  tabActiveBorrow: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: "#FFF" },
  container: { paddingHorizontal: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardName: { fontSize: 15, fontWeight: "bold", color: colors.textMain },
  cardDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAmount: { fontSize: 16, fontWeight: "bold" },
  cardNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: "italic",
  },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  btnUnpaid: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFE082",
  },
  btnPaid: {
    backgroundColor: "#43A047",
    borderColor: "#388E3C",
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F57C00",
  },
  statusBtnTextPaid: {
    color: "#FFFFFF",
  },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
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
    borderBottomColor: "#EEE",
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  payModalSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  payModalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  cancelBtnText: { color: colors.textMuted, fontSize: 15, fontWeight: "bold" },
  confirmPayBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmPayBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
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
  walletChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
  },
  walletChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  walletChipText: { fontSize: 13, fontWeight: "600", color: colors.textMain },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
