import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "../context/TransactionContext";

const baseColors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  border: "#EEEEEE",
  success: "#2E7D32",
  danger: "#E53935",
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const {
    goals,
    wallets,
    transactions,
    depositToGoal,
    withdrawFromGoal,
    updateGoal,
    deleteGoal,
  } = useTransactions();

  const goal = goals.find((g) => g.id === id);

  // Modal State Nabung / Cairkan
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"deposit" | "withdraw">(
    "deposit",
  );
  const [selectedWalletId, setSelectedWalletId] = useState(
    wallets[0]?.id || "",
  );
  const [actionAmount, setActionAmount] = useState("");

  // Modal State Edit Goal
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={baseColors.textMuted}
          />
          <Text style={styles.emptyText}>Goal tidak ditemukan.</Text>
          <TouchableOpacity
            onPress={() => router.replace("/goals" as any)}
            style={[styles.backBtnSimple, { backgroundColor: "#43A047" }]}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>
              Kembali ke Daftar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatRp = (angka: number) => "Rp " + angka.toLocaleString("id-ID");

  const percentage = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
    100,
  );
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // Filter transaksi yang terkait dengan target ini (menggunakan goalId)
  const goalTransactions = transactions.filter((t) => t.goalId === goal.id);

  // Hitung kontribusi bersih dari tiap dompet untuk target ini
  const walletBreakdown: { [walletId: string]: number } = {};
  goalTransactions.forEach((t) => {
    if (t.toWalletId === "system_goal") {
      walletBreakdown[t.walletId] =
        (walletBreakdown[t.walletId] || 0) + t.amount;
    } else if (t.walletId === "system_goal" && t.toWalletId) {
      walletBreakdown[t.toWalletId] =
        (walletBreakdown[t.toWalletId] || 0) - t.amount;
    }
  });

  const openActionModal = (type: "deposit" | "withdraw") => {
    setActionType(type);
    setActionAmount("");
    if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
    setActionModalVisible(true);
  };

  const handleExecuteAction = async () => {
    const parsed = parseInt(actionAmount.replace(/[^0-9]/g, "")) || 0;
    if (parsed <= 0) {
      Alert.alert("Perhatian", "Masukkan nominal yang valid!");
      return;
    }

    if (!selectedWalletId) {
      Alert.alert("Perhatian", "Pilih dompet terlebih dahulu!");
      return;
    }

    try {
      if (actionType === "deposit") {
        await depositToGoal(goal.id, selectedWalletId, parsed);
        Alert.alert("Sukses", `Berhasil menabung ${formatRp(parsed)}!`);
      } else {
        await withdrawFromGoal(goal.id, selectedWalletId, parsed);
        Alert.alert("Sukses", `Berhasil mencairkan ${formatRp(parsed)}!`);
      }
      setActionAmount("");
      setActionModalVisible(false);
    } catch (error: any) {
      Alert.alert("Gagal", error.message || "Terjadi kesalahan sistem.");
    }
  };

  // Handler Menu Titik Tiga (Edit & Hapus)
  const handleMenuPress = () => {
    Alert.alert("Opsi Target", `Pilih tindakan untuk "${goal.name}"`, [
      { text: "Edit Target", onPress: () => openEditModal() },
      {
        text: "Hapus Target",
        style: "destructive",
        onPress: () => handleDeleteGoal(),
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const openEditModal = () => {
    setEditName(goal.name);
    setEditTarget(goal.targetAmount.toString());
    setEditModalVisible(true);
  };

  const handleUpdateGoal = () => {
    if (!editName.trim() || !editTarget) {
      Alert.alert("Perhatian", "Nama dan target nominal tidak boleh kosong!");
      return;
    }

    const parsedTarget = parseInt(editTarget.replace(/[^0-9]/g, "")) || 0;
    if (parsedTarget <= 0) {
      Alert.alert("Perhatian", "Target nominal harus lebih dari 0!");
      return;
    }

    updateGoal(goal.id, {
      name: editName,
      targetAmount: parsedTarget,
    });

    setEditModalVisible(false);
    Alert.alert("Sukses", "Target berhasil diperbarui!");
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Hapus Target Impian",
      `Yakin ingin menghapus "${goal.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteGoal(goal.id);
            router.replace("/goals" as any);
          },
        },
      ],
    );
  };

  const goalColor = goal.color || "#43A047";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={baseColors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Goal</Text>
        <TouchableOpacity onPress={handleMenuPress} style={styles.iconBtn}>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={baseColors.textMain}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Ikon Lingkaran Besar dengan warna goal asli */}
        <View style={styles.avatarWrapper}>
          <View
            style={[styles.avatarCircle, { backgroundColor: goalColor + "20" }]}
          >
            <Ionicons name={goal.icon as any} size={48} color={goalColor} />
          </View>
          <Text style={styles.goalName}>{goal.name}</Text>
        </View>

        {/* Informasi Target vs Terkumpul */}
        <View style={styles.amountInfoRow}>
          <View>
            <Text style={styles.infoLabel}>Target</Text>
            <Text style={styles.targetVal}>{formatRp(goal.targetAmount)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.infoLabel}>Terkumpul</Text>
            <Text style={[styles.collectedVal, { color: goalColor }]}>
              {formatRp(goal.currentAmount)}
            </Text>
          </View>
        </View>

        {/* Persentase & Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={[styles.percentageText, { color: goalColor }]}>
            {percentage}%
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentage}%`, backgroundColor: goalColor },
              ]}
            />
          </View>
        </View>

        {/* Sisa & Breakdown Dompet */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Kekurangan Uang</Text>
            <Text style={styles.metaValue}>{formatRp(remaining)}</Text>
          </View>

          <View style={{ paddingVertical: 14 }}>
            <Text style={[styles.metaLabel, { marginBottom: 8 }]}>
              Sumber Tabungan:
            </Text>
            {Object.keys(walletBreakdown).length === 0 ? (
              <Text style={{ fontSize: 13, color: baseColors.textMuted }}>
                Belum ada dana masuk.
              </Text>
            ) : (
              Object.keys(walletBreakdown).map((wId) => {
                const wObj = wallets.find((w) => w.id === wId);
                const amount = walletBreakdown[wId];
                if (amount <= 0) return null;

                return (
                  <View
                    key={wId}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: baseColors.textMain }}>
                      • {wObj ? wObj.name : "Dompet"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "bold",
                        color: baseColors.textMain,
                      }}
                    >
                      {formatRp(amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Riwayat Deposit & Withdraw */}
        <Text style={styles.sectionTitle}>Riwayat Transaksi Target</Text>
        {goalTransactions.length === 0 ? (
          <Text style={styles.noHistoryText}>Belum ada riwayat aktivitas.</Text>
        ) : (
          goalTransactions.map((item) => {
            const isDeposit = item.toWalletId === "system_goal";
            const wObj = wallets.find(
              (w) => w.id === (isDeposit ? item.walletId : item.toWalletId),
            );

            return (
              <View key={item.id} style={styles.historyItem}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={isDeposit ? "arrow-down-circle" : "arrow-up-circle"}
                    size={24}
                    color={isDeposit ? baseColors.success : baseColors.danger}
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text style={styles.historyDate}>
                      {isDeposit ? "Masuk dari " : "Cair ke "}
                      <Text style={{ fontWeight: "bold" }}>
                        {wObj ? wObj.name : "Dompet"}
                      </Text>
                    </Text>
                    <Text style={{ fontSize: 12, color: baseColors.textMuted }}>
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.historyAmount,
                    {
                      color: isDeposit ? baseColors.success : baseColors.danger,
                    },
                  ]}
                >
                  {isDeposit ? "+" : "-"}
                  {formatRp(item.amount)}
                </Text>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tombol Deposit & Withdraw di Bawah */}
      <View style={styles.footerButtonWrapper}>
        <TouchableOpacity
          style={[styles.depositButton, { backgroundColor: goalColor }]}
          onPress={() => openActionModal("deposit")}
        >
          <Ionicons
            name="add"
            size={20}
            color="#FFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.depositButtonText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.depositButton,
            { backgroundColor: "#ECEFF1", marginLeft: 10 },
          ]}
          onPress={() => openActionModal("withdraw")}
        >
          <Ionicons
            name="arrow-undo-outline"
            size={20}
            color={baseColors.textMain}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.depositButtonText, { color: baseColors.textMain }]}
          >
            Cairkan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Input Action (Nabung/Cairkan) */}
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
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {actionType === "deposit"
                    ? "Tambah Tabungan"
                    : "Cairkan Target"}
                </Text>
                <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={baseColors.textMain}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {actionType === "deposit"
                    ? "Pilih Dompet Sumber"
                    : "Pilih Dompet Tujuan"}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletChip,
                        selectedWalletId === w.id && {
                          backgroundColor: goalColor,
                          borderColor: goalColor,
                        },
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
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
                <Text style={styles.label}>Nominal (Rp)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
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
                      actionType === "deposit" ? goalColor : "#455A64",
                  },
                ]}
                onPress={handleExecuteAction}
              >
                <Text style={styles.saveBtnText}>
                  {actionType === "deposit"
                    ? "Simpan Deposit"
                    : "Proses Pencairan"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Edit Target */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Target Impian</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={baseColors.textMain}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Target</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Beli Laptop"
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Target Nominal (Rp)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={editTarget}
                  onChangeText={setEditTarget}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: goalColor }]}
                onPress={handleUpdateGoal}
              >
                <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: baseColors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: baseColors.textMain },
  container: { paddingHorizontal: 20 },
  avatarWrapper: { alignItems: "center", marginVertical: 20 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  goalName: { fontSize: 20, fontWeight: "bold", color: baseColors.textMain },
  amountInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: { fontSize: 13, color: baseColors.textMuted, marginBottom: 4 },
  targetVal: { fontSize: 16, fontWeight: "bold", color: baseColors.textMain },
  collectedVal: { fontSize: 16, fontWeight: "bold" },
  progressSection: { marginBottom: 24 },
  percentageText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 5 },
  metaBox: {
    backgroundColor: baseColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: baseColors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: baseColors.border,
  },
  metaLabel: { fontSize: 14, color: baseColors.textMuted },
  metaValue: { fontSize: 14, fontWeight: "bold", color: baseColors.textMain },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: baseColors.textMain,
    marginBottom: 12,
  },
  noHistoryText: {
    fontSize: 13,
    color: baseColors.textMuted,
    fontStyle: "italic",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: baseColors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: baseColors.border,
    marginBottom: 8,
  },
  historyDate: { fontSize: 14, color: baseColors.textMain },
  historyAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footerButtonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: baseColors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: baseColors.border,
  },
  depositButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  depositButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: baseColors.textMuted, marginBottom: 16 },
  backBtnSimple: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", color: baseColors.textMain },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    color: baseColors.textMuted,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: baseColors.textMain,
  },
  walletChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: baseColors.border,
    marginRight: 8,
    backgroundColor: "#FAFAFA",
  },
  walletChipText: {
    fontSize: 13,
    color: baseColors.textMain,
    fontWeight: "600",
  },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
