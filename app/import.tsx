import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
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
  accent: "#F57C00",
};

export default function ImportScreen() {
  const router = useRouter();
  const { addTransaction, wallets } = useTransactions();
  const [fileName, setFileName] = useState<string | null>(null);
  const [importCount, setImportCount] = useState<number | null>(null);

  // Fungsi pembaca baris CSV yang aman dari koma di dalam teks
  const parseCSVLine = (text: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Mengizinkan semua jenis file agar terbaca
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setFileName(file.name);

      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      const lines = fileContent.split("\n");

      if (lines.length <= 1) {
        Alert.alert("Perhatian", "File CSV kosong atau format tidak valid.");
        return;
      }

      let count = 0;
      const defaultWalletId = wallets.length > 0 ? wallets[0].id : "w1";

      // Mulai dari baris ke-1 (lewati header baris ke-0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        // Format standar CSV kita: ID,Tanggal,Tipe,Kategori,Dompet,Nominal,Catatan
        if (cols.length >= 6) {
          const typeCol = cols[2]?.toLowerCase();
          const type =
            typeCol === "income" ||
            typeCol === "expense" ||
            typeCol === "transfer"
              ? typeCol
              : "expense";
          const category = cols[3] || "Lainnya";
          const amount = parseInt(cols[5].replace(/[^0-9]/g, ""), 10) || 0;
          const note = cols[6] ? cols[6].replace(/^"|"$/g, "") : "";

          if (amount > 0) {
            await addTransaction({
              type: type as any,
              amount,
              walletId: defaultWalletId,
              category,
              note,
              date: new Date().toISOString(),
            });
            count++;
          }
        }
      }

      setImportCount(count);
      Alert.alert("Sukses", `Berhasil mengimpor ${count} transaksi dari CSV!`);
    } catch (error: any) {
      Alert.alert(
        "Gagal Impor",
        error.message || "Terjadi kesalahan saat membaca file CSV.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impor CSV Keuangan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <View
            style={[styles.iconBg, { backgroundColor: colors.accent + "20" }]}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color={colors.accent}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.infoTitle}>Unggah File CSV</Text>
            <Text style={styles.infoSub}>
              Pilih file riwayat transaksi berformat .csv yang sebelumnya Anda
              ekspor dari aplikasi ini.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.importButton}
          onPress={handlePickDocument}
        >
          <Ionicons
            name="folder-open-outline"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.importButtonText}>Pilih File CSV</Text>
        </TouchableOpacity>

        {fileName && (
          <View style={styles.resultBox}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.resultTitle}>File: {fileName}</Text>
              {importCount !== null && (
                <Text style={styles.resultSub}>
                  Berhasil mengimpor {importCount} transaksi.
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
  container: { padding: 20 },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginBottom: 20,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textMain,
    marginBottom: 2,
  },
  infoSub: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  importButton: {
    backgroundColor: colors.accent,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  importButtonText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  resultBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTitle: { fontSize: 14, fontWeight: "600", color: colors.textMain },
  resultSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
