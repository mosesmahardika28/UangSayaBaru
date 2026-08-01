import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useTransactions } from "../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
  danger: "#E53935",
};

export default function WalletsScreen() {
  const router = useRouter();
  const { wallets, addWallet, updateWallet, deleteWallet } = useTransactions();

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
      alert("Nama dompet tidak boleh kosong!");
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Dompet</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Kartu Total Saldo */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Saldo Gabungan</Text>
          <Text style={styles.totalAmount}>{formatRp(totalAllWallets)}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Dompet Anda</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addBtnSmall}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnSmallText}>Baru</Text>
          </TouchableOpacity>
        </View>

        {wallets.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.walletCard}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={[styles.iconBg, { backgroundColor: item.color + "20" }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletName}>{item.name}</Text>
                <Text style={styles.walletBalance}>
                  {formatRp(item.balance || 0)}
                </Text>
              </View>
            </View>
            <Ionicons name="pencil" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <Text style={styles.hintText}>
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
                {modalMode === "add" ? "Tambah Dompet" : "Edit Dompet"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Dompet</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: OVO, Rekening Mandiri..."
                value={walletName}
                onChangeText={setWalletName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Saldo Awal (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={walletBalance}
                onChangeText={setWalletBalance}
              />
              <Text style={styles.helperText}>
                Isi saldo awal jika dompet ini sudah memiliki uang sebelum Anda
                mencatat transaksi.
              </Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
                <Text style={styles.deleteButtonText}>Hapus Dompet</Text>
              </TouchableOpacity>
            )}
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  container: { padding: 20 },
  totalCard: {
    backgroundColor: colors.primary,
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
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.textMain },
  addBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
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
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMain,
    marginBottom: 2,
  },
  walletBalance: { fontSize: 15, fontWeight: "bold", color: colors.primary },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
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
    backgroundColor: "#FFFFFF",
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
    borderBottomColor: "#EEEEEE",
    paddingBottom: 15,
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
  helperText: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  saveButton: {
    backgroundColor: colors.primary,
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
  deleteButtonText: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
