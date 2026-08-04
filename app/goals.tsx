import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { GENERIC_ICONS } from "../constants/icons"; // Pastikan path ini benar
import { useTheme } from "../context/ThemeContext";
import { Goal, useTransactions } from "../context/TransactionContext";

export default function GoalsScreen() {
  const router = useRouter();
  const {
    goals,
    wallets,
    addGoal,
    deleteGoal,
    depositToGoal,
    withdrawFromGoal,
  } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  // State untuk form Buat Target Impian
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("trophy-outline");
  const [selectedColor, setSelectedColor] = useState("#F57C00");
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);

  // State untuk form Nabung / Cairkan
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"deposit" | "withdraw">(
    "deposit",
  );
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [actionAmount, setActionAmount] = useState("");

  const colorOptions = [
    "#0097A7",
    "#00838F",
    "#F57C00",
    "#EF6C00",
    "#E91E63",
    "#C2185B",
    "#2E7D32",
    "#1B5E20",
    "#1E88E5",
    "#1565C0",
    "#7B1FA2",
    "#4A148C",
    "#D32F2F",
    "#455A64",
  ];

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const handleCreateGoal = () => {
    if (!goalName.trim() || !goalTarget) {
      Alert.alert("Perhatian", "Nama dan target nominal tidak boleh kosong!");
      return;
    }

    const parsedTarget = parseInt(goalTarget.replace(/[^0-9]/g, "")) || 0;
    if (parsedTarget <= 0) {
      Alert.alert("Perhatian", "Target nominal harus lebih dari 0!");
      return;
    }

    addGoal({
      name: goalName.trim(),
      targetAmount: parsedTarget,
      icon: selectedIcon, // Menggunakan ikon terpilih
      color: selectedColor, // Menggunakan warna terpilih
    });

    // Reset Form
    setGoalName("");
    setGoalTarget("");
    setSelectedIcon("trophy-outline");
    setSelectedColor("#F57C00");
    setAddModalVisible(false);
  };

  const openActionModal = (goal: Goal, type: "deposit" | "withdraw") => {
    setSelectedGoal(goal);
    setActionType(type);
    setActionAmount("");
    if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
    setActionModalVisible(true);
  };

  const handleExecuteAction = async () => {
    if (!selectedGoal || !actionAmount) return;

    const parsedAmount = parseInt(actionAmount.replace(/[^0-9]/g, "")) || 0;
    if (parsedAmount <= 0) {
      Alert.alert("Perhatian", "Nominal harus lebih dari 0!");
      return;
    }

    if (!selectedWalletId) {
      Alert.alert("Perhatian", "Pilih dompet terlebih dahulu!");
      return;
    }

    try {
      if (actionType === "deposit") {
        await depositToGoal(selectedGoal.id, selectedWalletId, parsedAmount);
        Alert.alert(
          "Sukses",
          `Berhasil menabung ${formatRp(parsedAmount)} ke ${selectedGoal.name}!`,
        );
      } else {
        await withdrawFromGoal(selectedGoal.id, selectedWalletId, parsedAmount);
        Alert.alert(
          "Sukses",
          `Berhasil mencairkan ${formatRp(parsedAmount)} ke dompet!`,
        );
      }
      setActionModalVisible(false);
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error.message || "Terjadi kesalahan saat memproses transaksi.",
      );
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      "Hapus Target Impian",
      `Yakin ingin menghapus "${goal.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteGoal(goal.id),
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
          Target Impian (Goals)
        </Text>
        <TouchableOpacity onPress={() => setAddModalVisible(true)}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textMain }]}>
              Belum ada target impian.
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Buat target baru untuk mulai menabung secara disiplin!
            </Text>
            <TouchableOpacity
              style={[styles.createBtnBtn, { backgroundColor: colors.primary }]}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.createBtnText}>+ Buat Target Pertama</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((item) => {
            const percentage = Math.min(
              Math.round((item.currentAmount / item.targetAmount) * 100),
              100,
            );
            const goalColor = item.color || colors.primary;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/goal-detail" as any,
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.goalHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={[
                        styles.iconBg,
                        { backgroundColor: goalColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={goalColor}
                      />
                    </View>
                    <View>
                      <Text
                        style={[styles.goalName, { color: colors.textMain }]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.goalSub, { color: colors.textMuted }]}
                      >
                        {percentage}% Terkumpul
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(item);
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.progressBg,
                    { backgroundColor: isDarkMode ? "#2C2C2C" : "#E0E0E0" },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%`, backgroundColor: goalColor },
                    ]}
                  />
                </View>

                <View style={styles.amountRow}>
                  <Text style={[styles.currentAmount, { color: goalColor }]}>
                    {formatRp(item.currentAmount)}
                  </Text>
                  <Text
                    style={[styles.targetAmount, { color: colors.textMuted }]}
                  >
                    Target: {formatRp(item.targetAmount)}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.btnAction,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      openActionModal(item, "deposit");
                    }}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                    <Text style={styles.btnActionText}>Nabung</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.btnAction,
                      {
                        backgroundColor: isDarkMode ? "#2C2C2C" : "#ECEFF1",
                      },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      openActionModal(item, "withdraw");
                    }}
                  >
                    <Ionicons
                      name="arrow-undo-outline"
                      size={16}
                      color={colors.textMain}
                    />
                    <Text
                      style={[styles.btnActionText, { color: colors.textMain }]}
                    >
                      Cairkan
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal Buat Target */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.card, maxHeight: "85%" }, // Dibatasi maxHeight
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
                  Buat Target Impian
                </Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
              </View>

              {/* Dibungkus ScrollView agar form bisa di-scroll */}
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    Nama Target
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
                    placeholder="Contoh: Beli Laptop Baru"
                    placeholderTextColor={colors.textMuted}
                    value={goalName}
                    onChangeText={setGoalName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    Target Nominal (Rp)
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
                    placeholder="Contoh: 10000000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={goalTarget}
                    onChangeText={setGoalTarget}
                  />
                </View>

                {/* Pilih Ikon Goal */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    Ikon Target Impian
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.iconPickerSelector,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setIsIconModalVisible(true)}
                  >
                    <View
                      style={[
                        styles.previewIconBox,
                        { backgroundColor: selectedColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={selectedIcon as any}
                        size={22}
                        color={selectedColor}
                      />
                    </View>
                    <Text
                      style={[
                        styles.iconSelectorText,
                        { color: colors.textMain },
                      ]}
                    >
                      Ketuk untuk mengubah ikon
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                {/* Pilih Warna Tema Goal */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    Pilih Warna Tema
                  </Text>
                  <View style={styles.colorGrid}>
                    {colorOptions.map((col) => {
                      const isSelected = selectedColor === col;
                      return (
                        <TouchableOpacity
                          key={col}
                          style={[
                            styles.colorCircle,
                            { backgroundColor: col },
                            isSelected && [
                              styles.colorCircleActive,
                              { borderColor: colors.textMain },
                            ],
                          ]}
                          onPress={() => setSelectedColor(col)}
                          activeOpacity={0.8}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.primary, marginBottom: 20 },
                  ]}
                  onPress={handleCreateGoal}
                >
                  <Text style={styles.saveBtnText}>Simpan Target</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Pilih Ikon (Lapisan di atas) */}
      <Modal visible={isIconModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsIconModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, maxHeight: "75%" },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                Pilih Ikon Target
              </Text>
              <TouchableOpacity onPress={() => setIsIconModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {GENERIC_ICONS.map((group, index) => (
                <View key={index} style={styles.groupContainer}>
                  <Text
                    style={[styles.groupTitle, { color: colors.textMuted }]}
                  >
                    {group.category}
                  </Text>
                  <View style={styles.iconGrid}>
                    {group.icons.map((iconName) => {
                      const isSelected = selectedIcon === iconName;
                      return (
                        <TouchableOpacity
                          key={iconName}
                          style={[
                            styles.iconBox,
                            {
                              backgroundColor: colors.background,
                              borderColor: colors.border,
                            },
                            isSelected && {
                              borderColor: colors.primary,
                              backgroundColor: colors.primary + "20",
                            },
                          ]}
                          onPress={() => {
                            setSelectedIcon(iconName);
                            setIsIconModalVisible(false);
                          }}
                        >
                          <Ionicons
                            name={iconName as any}
                            size={22}
                            color={
                              isSelected ? colors.primary : colors.textMain
                            }
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Nabung / Cairkan */}
      <Modal visible={isActionModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionModalVisible(false)}
          >
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
              onStartShouldSetResponder={() => true}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                  {actionType === "deposit"
                    ? `Nabung ke ${selectedGoal?.name}`
                    : `Cairkan ${selectedGoal?.name}`}
                </Text>
                <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Pilih Dompet
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={wallets}
                  keyExtractor={(w) => w.id}
                  renderItem={({ item: w }) => (
                    <TouchableOpacity
                      style={[
                        styles.walletChip,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                        selectedWalletId === w.id && styles.walletChipActive,
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
                      <Text
                        style={[
                          styles.walletChipText,
                          { color: colors.textMain },
                          selectedWalletId === w.id && { color: "#FFF" },
                        ]}
                      >
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Nominal (Rp)
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
                  value={actionAmount}
                  onChangeText={setActionAmount}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor:
                      actionType === "deposit" ? colors.primary : "#455A64",
                  },
                ]}
                onPress={handleExecuteAction}
              >
                <Text style={styles.saveBtnText}>
                  {actionType === "deposit"
                    ? "Proses Menabung"
                    : "Proses Pencairan"}
                </Text>
              </TouchableOpacity>
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
  goalCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalName: { fontSize: 16, fontWeight: "bold" },
  goalSub: { fontSize: 12, marginTop: 2 },
  progressBg: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: { height: "100%", borderRadius: 5 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  currentAmount: { fontSize: 15, fontWeight: "bold" },
  targetAmount: { fontSize: 13 },
  actionRow: { flexDirection: "row", gap: 10 },
  btnAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnActionText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 4,
  },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  createBtnBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
  },

  // Icon Picker Styles
  iconPickerSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  previewIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconSelectorText: { flex: 1, fontSize: 14, fontWeight: "500" },
  groupContainer: { marginBottom: 16 },
  groupTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Color Picker Styles
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  colorCircleActive: {
    borderWidth: 3,
    transform: [{ scale: 1.12 }],
  },

  walletChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  walletChipActive: {
    backgroundColor: "#43A047",
    borderColor: "#43A047",
  },
  walletChipText: { fontSize: 13, fontWeight: "600" },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
