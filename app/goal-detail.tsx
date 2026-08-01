import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const baseColors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  border: "#EEEEEE",
  success: "#2E7D32",
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { goals, wallets, depositToGoal, transactions } = useTransactions();

  const goal = goals.find((g) => g.id === id);

  const [isDepositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(
    wallets[0]?.id || "",
  );
  const [depositAmount, setDepositAmount] = useState("");

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Goal tidak ditemukan.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtnSimple, { backgroundColor: "#43A047" }]}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Kembali</Text>
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

  const depositHistory = transactions.filter(
    (t) =>
      t.type === "expense" &&
      t.note &&
      t.note.includes(`Nabung Target: ${goal.name}`),
  );

  const handleDeposit = () => {
    const parsed = parseInt(depositAmount.replace(/[^0-9]/g, "")) || 0;
    if (parsed <= 0) {
      alert("Masukkan nominal deposit yang valid!");
      return;
    }

    depositToGoal(goal.id, selectedWalletId, parsed);
    setDepositAmount("");
    setDepositModalVisible(false);
  };

  // Menggunakan warna asli dari goal (goal.color) agar sama persis dengan di halaman daftar
  const goalColor = goal.color || "#43A047";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={baseColors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Goal</Text>
        <TouchableOpacity style={styles.iconBtn}>
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

        {/* Sisa & Tanggal Target */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Sisa</Text>
            <Text style={styles.metaValue}>{formatRp(remaining)}</Text>
          </View>
          <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.metaLabel}>Target Tanggal</Text>
            <Text style={styles.metaValue}>
              {goal.targetDate || "31 Des 2026"}
            </Text>
          </View>
        </View>

        {/* Riwayat Deposit */}
        <Text style={styles.sectionTitle}>Riwayat Deposit</Text>
        {depositHistory.length === 0 ? (
          <Text style={styles.noHistoryText}>Belum ada riwayat deposit.</Text>
        ) : (
          depositHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.historyAmount}>+{formatRp(item.amount)}</Text>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tombol Deposit di Bawah dengan warna goal asli */}
      <View style={styles.footerButtonWrapper}>
        <TouchableOpacity
          style={[styles.depositButton, { backgroundColor: goalColor }]}
          onPress={() => setDepositModalVisible(true)}
        >
          <Ionicons
            name="add"
            size={20}
            color="#FFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.depositButtonText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Input Deposit */}
      <Modal visible={isDepositModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDepositModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Tabungan</Text>
              <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                <Ionicons name="close" size={24} color={baseColors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pilih Dompet Sumber</Text>
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
              <Text style={styles.label}>Nominal Deposit (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: goalColor }]}
              onPress={handleDeposit}
            >
              <Text style={styles.saveBtnText}>Simpan Deposit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    color: baseColors.success,
  },
  footerButtonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: baseColors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: baseColors.border,
  },
  depositButton: {
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
