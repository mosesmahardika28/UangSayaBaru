import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
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
import { Goal, useTransactions } from "../context/TransactionContext";

const colors = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#212121",
  textMuted: "#757575",
  primary: "#43A047",
  border: "#EEEEEE",
  danger: "#E53935",
};

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

  // Modal State Tambah Target
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  // Modal State Nabung / Tarik
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"deposit" | "withdraw">(
    "deposit",
  );
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [actionAmount, setActionAmount] = useState("");

  const formatRp = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const handleCreateGoal = () => {
    if (!goalName.trim() || !goalTarget) {
      alert("Nama dan target nominal tidak boleh kosong!");
      return;
    }

    const parsedTarget = parseInt(goalTarget.replace(/[^0-9]/g, "")) || 0;
    if (parsedTarget <= 0) {
      alert("Target nominal harus lebih dari 0!");
      return;
    }

    addGoal({
      name: goalName,
      targetAmount: parsedTarget,
      icon: "trophy-outline",
      color: colors.primary,
    });

    setGoalName("");
    setGoalTarget("");
    setAddModalVisible(false);
  };

  const openActionModal = (goal: Goal, type: "deposit" | "withdraw") => {
    setSelectedGoal(goal);
    setActionType(type);
    setActionAmount("");
    if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
    setActionModalVisible(true);
  };

  const handleExecuteAction = () => {
    if (!selectedGoal || !actionAmount) return;

    const parsedAmount = parseInt(actionAmount.replace(/[^0-9]/g, "")) || 0;
    if (parsedAmount <= 0) {
      alert("Nominal harus lebih dari 0!");
      return;
    }

    if (actionType === "deposit") {
      depositToGoal(selectedGoal.id, selectedWalletId, parsedAmount);
      alert(
        `Berhasil menabung ${formatRp(parsedAmount)} ke ${selectedGoal.name}!`,
      );
    } else {
      withdrawFromGoal(selectedGoal.id, selectedWalletId, parsedAmount);
      alert(`Berhasil mencairkan ${formatRp(parsedAmount)} ke dompet!`);
    }

    setActionModalVisible(false);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Target Impian (Goals)</Text>
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
            <Text style={styles.emptyText}>Belum ada target impian.</Text>
            <Text style={styles.emptySubtext}>
              Buat target baru untuk mulai menabung secara disiplin!
            </Text>
            <TouchableOpacity
              style={styles.createBtnBtn}
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

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.goalCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/goal-detail",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.goalHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={[
                        styles.iconBg,
                        { backgroundColor: item.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={item.color}
                      />
                    </View>
                    <View>
                      <Text style={styles.goalName}>{item.name}</Text>
                      <Text style={styles.goalSub}>
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

                {/* Progress Bar */}
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.currentAmount}>
                    {formatRp(item.currentAmount)}
                  </Text>
                  <Text style={styles.targetAmount}>
                    Target: {formatRp(item.targetAmount)}
                  </Text>
                </View>

                {/* Tombol Aksi Nabung & Cairkan */}
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
                    style={[styles.btnAction, { backgroundColor: "#ECEFF1" }]}
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

      {/* Modal Buat Target Baru */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buat Target Impian</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Target</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Beli Laptop Baru"
                value={goalName}
                onChangeText={setGoalName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Nominal (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 10000000"
                keyboardType="numeric"
                value={goalTarget}
                onChangeText={setGoalTarget}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateGoal}>
              <Text style={styles.saveBtnText}>Simpan Target</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Nabung / Cairkan */}
      <Modal visible={isActionModalVisible} transparent animationType="slide">
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
                  ? `Nabung ke ${selectedGoal?.name}`
                  : `Cairkan ${selectedGoal?.name}`}
              </Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pilih Dompet</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={wallets}
                keyExtractor={(w) => w.id}
                renderItem={({ item: w }) => (
                  <TouchableOpacity
                    style={[
                      styles.walletChip,
                      selectedWalletId === w.id && styles.walletChipActive,
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
                )}
              />
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
  goalCard: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
  goalName: { fontSize: 16, fontWeight: "bold", color: colors.textMain },
  goalSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  progressBg: {
    height: 10,
    backgroundColor: "#E0E0E0",
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
  currentAmount: { fontSize: 15, fontWeight: "bold", color: colors.primary },
  targetAmount: { fontSize: 13, color: colors.textMuted },
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
    color: colors.textMain,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  createBtnBtn: {
    backgroundColor: colors.primary,
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
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    color: colors.textMuted,
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
    color: colors.textMain,
  },
  walletChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: "#FAFAFA",
  },
  walletChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  walletChipText: { fontSize: 13, color: colors.textMain, fontWeight: "600" },
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
