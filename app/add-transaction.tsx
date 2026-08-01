import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
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
import { useTransactions } from "../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
  danger: "#E53935",
  transfer: "#1E88E5",
};

export default function AddTransactionScreen() {
  const router = useRouter();
  const { categories, addTransaction, wallets } = useTransactions();

  const [activeTab, setActiveTab] = useState<"expense" | "income" | "transfer">(
    "expense",
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // State untuk Dompet
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [selectedToWalletId, setSelectedToWalletId] = useState<string>("");

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  // State Modal Dompet
  const [isWalletModalVisible, setWalletModalVisible] = useState(false);
  const [walletSelectionType, setWalletSelectionType] = useState<"from" | "to">(
    "from",
  );

  // Set default dompet saat komponen dimuat
  useEffect(() => {
    if (wallets.length > 0) {
      if (!selectedWalletId) setSelectedWalletId(wallets[0].id);
      if (!selectedToWalletId && wallets.length > 1)
        setSelectedToWalletId(wallets[1].id);
    }
  }, [wallets]);

  const handleSave = () => {
    if (!amount) {
      alert("Masukkan nominal terlebih dahulu!");
      return;
    }

    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Nominal tidak valid!");
      return;
    }

    if (!selectedWalletId) {
      alert("Pilih dompet sumber dana!");
      return;
    }

    if (activeTab === "transfer") {
      if (!selectedToWalletId) {
        alert("Pilih dompet tujuan transfer!");
        return;
      }
      if (selectedWalletId === selectedToWalletId) {
        alert("Dompet sumber dan tujuan tidak boleh sama!");
        return;
      }

      // Simpan Transfer
      addTransaction({
        type: "transfer",
        amount: parsedAmount,
        category: "Transfer",
        date: new Date().toISOString(),
        note: note || "Transfer saldo",
        walletId: selectedWalletId,
        toWalletId: selectedToWalletId,
      });
    } else {
      if (!selectedCategory) {
        alert("Pilih kategori terlebih dahulu!");
        return;
      }

      // Simpan Pemasukan / Pengeluaran
      addTransaction({
        type: activeTab,
        amount: parsedAmount,
        category: selectedCategory,
        date: new Date().toISOString(),
        note: note,
        walletId: selectedWalletId,
      });
    }

    // Reset dan kembali
    setAmount("");
    setNote("");
    setSelectedCategory(null);
    router.back();
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const selectedCatData = categories.find((c) => c.name === selectedCategory);

  const fromWallet = wallets.find((w) => w.id === selectedWalletId);
  const toWallet = wallets.find((w) => w.id === selectedToWalletId);

  const formatRp = (angka: string) => {
    const raw = angka.replace(/[^0-9]/g, "");
    if (!raw) return "";
    return "Rp " + parseInt(raw).toLocaleString("id-ID");
  };

  const getActiveColor = () => {
    if (activeTab === "expense") return colors.danger;
    if (activeTab === "income") return colors.primary;
    return colors.transfer;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catat Transaksi</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Tiga Tab Pilihan */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "expense" && { backgroundColor: colors.danger },
              ]}
              onPress={() => {
                setActiveTab("expense");
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "expense" && styles.tabTextActive,
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "income" && { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                setActiveTab("income");
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "income" && styles.tabTextActive,
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "transfer" && {
                  backgroundColor: colors.transfer,
                },
              ]}
              onPress={() => setActiveTab("transfer")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "transfer" && styles.tabTextActive,
                ]}
              >
                Transfer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Nominal */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Nominal</Text>
            <TextInput
              style={[styles.amountInput, { color: getActiveColor() }]}
              placeholder="Rp 0"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={formatRp(amount)}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.formContainer}>
            {/* Pilihan Dompet Sumber */}
            <TouchableOpacity
              style={styles.inputGroup}
              onPress={() => {
                setWalletSelectionType("from");
                setWalletModalVisible(true);
              }}
            >
              <Text style={styles.label}>
                {activeTab === "transfer" ? "Dari Dompet" : "Gunakan Dompet"}
              </Text>
              <View style={styles.selector}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {fromWallet && (
                    <Ionicons
                      name={fromWallet.icon as any}
                      size={20}
                      color={fromWallet.color}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.selectorText,
                      !fromWallet && { color: "#BDBDBD" },
                    ]}
                  >
                    {fromWallet ? fromWallet.name : "Pilih Dompet"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            </TouchableOpacity>

            {/* Pilihan Dompet Tujuan (Khusus Transfer) */}
            {activeTab === "transfer" && (
              <TouchableOpacity
                style={styles.inputGroup}
                onPress={() => {
                  setWalletSelectionType("to");
                  setWalletModalVisible(true);
                }}
              >
                <Text style={styles.label}>Ke Dompet</Text>
                <View style={styles.selector}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {toWallet && (
                      <Ionicons
                        name={toWallet.icon as any}
                        size={20}
                        color={toWallet.color}
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.selectorText,
                        !toWallet && { color: "#BDBDBD" },
                      ]}
                    >
                      {toWallet ? toWallet.name : "Pilih Dompet Tujuan"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Pilihan Kategori (Tidak muncul di Transfer) */}
            {activeTab !== "transfer" && (
              <TouchableOpacity
                style={styles.inputGroup}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={styles.label}>Kategori</Text>
                <View style={styles.selector}>
                  {selectedCatData ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={[
                          styles.smallIconBg,
                          { backgroundColor: selectedCatData.bg },
                        ]}
                      >
                        <Ionicons
                          name={selectedCatData.icon as any}
                          size={14}
                          color={selectedCatData.color}
                        />
                      </View>
                      <Text style={styles.selectorText}>
                        {selectedCatData.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.selectorText, { color: "#BDBDBD" }]}>
                      Pilih Kategori
                    </Text>
                  )}
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Tulis catatan di sini..."
                placeholderTextColor="#BDBDBD"
                value={note}
                onChangeText={setNote}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: getActiveColor() }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Pilih Dompet */}
      <Modal
        visible={isWalletModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setWalletModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {walletSelectionType === "from"
                  ? "Pilih Sumber Dana"
                  : "Pilih Tujuan Transfer"}
              </Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={wallets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    if (walletSelectionType === "from")
                      setSelectedWalletId(item.id);
                    else setSelectedToWalletId(item.id);
                    setWalletModalVisible(false);
                  }}
                >
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.iconBg,
                        { backgroundColor: item.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <View>
                      <Text style={styles.categoryNameText}>{item.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        Saldo: Rp {item.balance?.toLocaleString("id-ID") || 0}
                      </Text>
                    </View>
                  </View>
                  {((walletSelectionType === "from" &&
                    selectedWalletId === item.id) ||
                    (walletSelectionType === "to" &&
                      selectedToWalletId === item.id)) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Pilih Kategori */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(item.name);
                    setCategoryModalVisible(false);
                  }}
                >
                  <View style={styles.categoryInfo}>
                    <View style={[styles.iconBg, { backgroundColor: item.bg }]}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <Text style={styles.categoryNameText}>{item.name}</Text>
                  </View>
                  {selectedCategory === item.name && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
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
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  container: { paddingBottom: 40 },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#EEEEEE",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: "#FFFFFF" },
  amountContainer: { alignItems: "center", marginBottom: 30 },
  amountLabel: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  amountInput: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  formContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: "600",
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  selectorText: { fontSize: 15, color: colors.textMain, fontWeight: "500" },
  textInput: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: colors.textMain,
  },
  saveButton: {
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  smallIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
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
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  categoryInfo: { flexDirection: "row", alignItems: "center" },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  categoryNameText: { fontSize: 16, color: colors.textMain, fontWeight: "500" },
});
