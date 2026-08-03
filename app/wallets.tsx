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
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

export default function WalletsScreen() {
  const router = useRouter();
  const { wallets, addWallet, updateWallet, deleteWallet } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  // State untuk Modal Form Dompet
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState("");
  const [walletBalance, setWalletBalance] = useState("");

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const totalAllWallets = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  // Fungsi Membuka Modal Tambah
  const openAddModal = () => {
    setModalMode("add");
    setActiveWalletId(null);
    setWalletName("");
    setWalletBalance("");
    setModalVisible(true);
  };

  // Fungsi Membuka Modal Edit
  const openEditModal = (wallet: any) => {
    setModalMode("edit");
    setActiveWalletId(wallet.id);
    setWalletName(wallet.name);
    setWalletBalance(wallet.initialBalance.toString());
    setModalVisible(true);
  };

  // Fungsi Menyimpan Data (Tambah / Edit)
  const handleSave = () => {
    if (!walletName.trim()) {
      Alert.alert("Perhatian", "Nama dompet tidak boleh kosong!");
      return;
    }

    const parsedBalance = parseInt(walletBalance.replace(/[^0-9]/g, "")) || 0;

    if (modalMode === "add") {
      addWallet({
        name: walletName,
        initialBalance: parsedBalance,
        icon: "wallet", // Default icon
        color: "#F57C00", // Default warna
      });
    } else if (modalMode === "edit" && activeWalletId) {
      const existingWallet = wallets.find((w) => w.id === activeWalletId);
      if (existingWallet) {
        updateWallet(activeWalletId, {
          ...existingWallet,
          name: walletName,
          initialBalance: parsedBalance,
        });
      }
    }

    setModalVisible(false);
  };

  // Fungsi Hapus Dompet dengan Konfirmasi
  const handleDelete = () => {
    Alert.alert(
      "Hapus Dompet",
      "Yakin ingin menghapus dompet ini? Transaksi yang menggunakan dompet ini mungkin akan kehilangan referensinya.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            if (activeWalletId) {
              deleteWallet(activeWalletId);
              setModalVisible(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Kelola Dompet
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Kartu Total Saldo */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.totalLabel}>Total Saldo Gabungan</Text>
          <Text style={styles.totalAmount}>{formatRp(totalAllWallets)}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
            Daftar Dompet Anda
          </Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.addBtnSmall, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnSmallText}>Baru</Text>
          </TouchableOpacity>
        </View>

        {wallets.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.walletCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={[
                  styles.iconBg,
                  {
                    backgroundColor:
                      item.color !== undefined
                        ? item.color + "20"
                        : colors.primary + "20",
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color || colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.walletName, { color: colors.textMain }]}>
                  {item.name}
                </Text>
                <Text style={[styles.walletBalance, { color: colors.primary }]}>
                  {formatRp(item.balance || 0)}
                </Text>
              </View>
            </View>
            <Ionicons name="pencil" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          Ketuk dompet pada daftar di atas untuk mengubah nama, saldo awal, atau
          menghapusnya.
        </Text>
      </ScrollView>

      {/* Modal Form Tambah / Edit Dompet */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
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
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.card,
                  borderTopColor: colors.border,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                  {modalMode === "add" ? "Tambah Dompet" : "Edit Dompet"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Nama Dompet
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.textMain,
                    },
                  ]}
                  placeholder="Contoh: OVO, Rekening Mandiri..."
                  placeholderTextColor={colors.textMuted}
                  value={walletName}
                  onChangeText={setWalletName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Saldo Awal (Rp)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.textMain,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={walletBalance}
                  onChangeText={setWalletBalance}
                />
                <Text style={[styles.helperText, { color: colors.textMuted }]}>
                  Isi saldo awal jika dompet ini sudah memiliki uang sebelum
                  Anda mencatat transaksi.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Simpan Dompet</Text>
              </TouchableOpacity>

              {modalMode === "edit" && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.deleteButtonText, { color: colors.danger }]}
                  >
                    Hapus Dompet
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  totalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  totalLabel: { color: "#FFFFFF", fontSize: 14, opacity: 0.9, marginBottom: 4 },
  totalAmount: { color: "#FFFFFF", fontSize: 26, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  addBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnSmallText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  walletCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  walletBalance: { fontSize: 15, fontWeight: "bold" },
  hintText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
  },
  helperText: { fontSize: 12, marginTop: 4 },
  saveButton: {
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
  },
  deleteButtonText: { fontSize: 15, fontWeight: "600" },
});
