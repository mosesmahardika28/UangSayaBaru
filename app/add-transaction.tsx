import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction, categories } = useTransactions();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // State untuk kategori & modal
  const [selectedCategory, setSelectedCategory] = useState("Makan");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State untuk Tanggal & Kalender Interaktif
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleTabChange = (newType: "expense" | "income") => {
    setType(newType);
    const availableCats = categories.filter((c) => c.type === newType);
    if (availableCats.length > 0) {
      setSelectedCategory(availableCats[0].name);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
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
      date: date.toISOString(),
      note: note,
    });

    alert("Transaksi berhasil disimpan!");
    router.back();
  };

  const currentCategories = categories.filter((c) => c.type === type);
  const activeCatObj = currentCategories.find(
    (c) => c.name === selectedCategory,
  ) ||
    currentCategories[0] || {
      name: "",
      icon: "pricetag-outline",
      color: "#757575",
      bg: "#EEEEEE",
    };

  const formattedDateString = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

        {/* Kategori */}
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

        {/* Tanggal Interaktif */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dropdownLeft}>
              <Ionicons name="calendar-outline" size={20} color="#757575" />
              <Text style={[styles.dropdownText, { marginLeft: 12 }]}>
                {formattedDateString}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Tampil Komponen Tanggal */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

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
        {/* 1. Ubah View overlay menjadi TouchableOpacity */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          {/* 2. Tambahkan onStartShouldSetResponder di dalam modalContent */}
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={currentCategories}
              keyExtractor={(item) => item.id}
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
        </TouchableOpacity>
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
  dropdownText: { fontSize: 15, color: "#212121" },
  smallIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
