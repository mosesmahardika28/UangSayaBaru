import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { useTransactions } from "../context/TransactionContext";

// Daftar kategori pilihan
const categoriesData = {
  expense: [
    {
      name: "Makan",
      icon: "restaurant-outline",
      color: "#0097A7",
      bg: "#E0F7FA",
    },
    {
      name: "Transportasi",
      icon: "bus-outline",
      color: "#F57C00",
      bg: "#FFF3E0",
    },
    { name: "Kuliah", icon: "school-outline", color: "#388E3C", bg: "#E8F5E9" },
    { name: "Belanja", icon: "cart-outline", color: "#E91E63", bg: "#FCE4EC" },
    {
      name: "Hiburan",
      icon: "game-controller-outline",
      color: "#673AB7",
      bg: "#EDE7F6",
    },
    {
      name: "Kesehatan",
      icon: "medical-outline",
      color: "#F44336",
      bg: "#FFEBEE",
    },
    {
      name: "Lainnya",
      icon: "ellipsis-horizontal-outline",
      color: "#757575",
      bg: "#EEEEEE",
    },
  ],
  income: [
    { name: "Gaji", icon: "wallet-outline", color: "#2E7D32", bg: "#E8F5E9" },
    { name: "Bonus", icon: "gift-outline", color: "#F9A825", bg: "#FFF9C4" },
    {
      name: "Investasi",
      icon: "trending-up-outline",
      color: "#1565C0",
      bg: "#E3F2FD",
    },
    {
      name: "Lainnya",
      icon: "ellipsis-horizontal-outline",
      color: "#757575",
      bg: "#EEEEEE",
    },
  ],
};

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // State untuk kategori & modal
  const [selectedCategory, setSelectedCategory] = useState("Makan");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Tanggal hari ini format YYYY-MM-DD atau teks ramah
  const todayString = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayString);

  // Ganti kategori default otomatis saat tipe tab (Pengeluaran/Pemasukan) berubah
  const handleTabChange = (newType: "expense" | "income") => {
    setType(newType);
    setSelectedCategory(newType === "expense" ? "Makan" : "Gaji");
  };

  const handleSave = () => {
    if (!amount) {
      alert("Masukkan nominal terlebih dahulu!");
      return;
    }

    addTransaction({
      type: type,
      amount: parseInt(amount.replace(/[^0-9]/g, "")) || 0,
      category: selectedCategory,
      date: new Date().toISOString(),
      note: note,
    });

    alert("Transaksi berhasil disimpan!");
    router.back();
  };

  // Mencari ikon untuk kategori yang sedang dipilih
  const currentCategories = categoriesData[type];
  const activeCatObj =
    currentCategories.find((c) => c.name === selectedCategory) ||
    currentCategories[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Transaksi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Tombol Pilihan Tab */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              type === "expense" && styles.activeExpense,
            ]}
            onPress={() => handleTabChange("expense")}
          >
            <Text
              style={[
                styles.tabText,
                type === "expense" && styles.activeTextWhite,
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, type === "income" && styles.activeIncome]}
            onPress={() => handleTabChange("income")}
          >
            <Text
              style={[
                styles.tabText,
                type === "income" && styles.activeTextWhite,
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nominal */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nominal</Text>
          <View style={styles.nominalBox}>
            <Text style={styles.currencySymbol}>Rp</Text>
            <TextInput
              style={styles.nominalInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#BDBDBD"
            />
          </View>
        </View>

        {/* Kategori (Interaktif / Membuka Modal) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setIsModalVisible(true)}
          >
            <View style={styles.dropdownLeft}>
              <View
                style={[
                  styles.smallIconBg,
                  { backgroundColor: activeCatObj.bg },
                ]}
              >
                <Ionicons
                  name={activeCatObj.icon as any}
                  size={18}
                  color={activeCatObj.color}
                />
              </View>
              <Text style={styles.dropdownText}>{selectedCategory}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Tanggal */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tanggal</Text>
          <View style={styles.dropdownBox}>
            <View style={styles.dropdownLeft}>
              <Ionicons name="calendar-outline" size={20} color="#757575" />
              <TextInput
                style={[styles.dropdownText, { flex: 1, padding: 0 }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </View>

        {/* Catatan */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catatan (opsional)</Text>
          <TextInput
            style={styles.textArea}
            value={note}
            onChangeText={setNote}
            placeholder="Tulis catatan di sini..."
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Pilihan Kategori */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={currentCategories}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(item.name);
                    setIsModalVisible(false);
                  }}
                >
                  <View
                    style={[styles.smallIconBg, { backgroundColor: item.bg }]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedCategory === item.name && (
                    <Ionicons name="checkmark" size={20} color="#43A047" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FAFAFA",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#212121" },
  container: { padding: 20 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEEEEE",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeExpense: { backgroundColor: "#E53935" },
  activeIncome: { backgroundColor: "#43A047" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#757575" },
  activeTextWhite: { color: "#FFFFFF" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#757575", marginBottom: 8, fontWeight: "500" },
  nominalBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginRight: 8,
  },
  nominalInput: { flex: 1, fontSize: 18, fontWeight: "bold", color: "#212121" },
  dropdownBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  dropdownLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  dropdownText: { fontSize: 15, color: "#212121", marginLeft: 12 },
  smallIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: "top",
    fontSize: 15,
    color: "#212121",
  },
  saveButton: {
    backgroundColor: "#43A047",
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
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
    maxHeight: "50%",
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
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#212121" },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  modalItemText: { flex: 1, fontSize: 16, color: "#212121", marginLeft: 12 },
});
