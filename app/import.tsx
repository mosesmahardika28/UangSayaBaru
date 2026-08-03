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
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

export default function ImportScreen() {
  const router = useRouter();
  const { addTransaction, wallets } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Impor CSV Keuangan
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.iconBg,
              {
                backgroundColor: isDarkMode ? "#3E2723" : "#F57C0020",
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={24} color="#F57C00" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.infoTitle, { color: colors.textMain }]}>
              Unggah File CSV
            </Text>
            <Text style={[styles.infoSub, { color: colors.textMuted }]}>
              Pilih file riwayat transaksi berformat .csv yang sebelumnya Anda
              ekspor dari aplikasi ini.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.importButton, { backgroundColor: "#F57C00" }]}
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
          <View
            style={[
              styles.resultBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.resultTitle, { color: colors.textMain }]}>
                File: {fileName}
              </Text>
              {importCount !== null && (
                <Text style={[styles.resultSub, { color: colors.textMuted }]}>
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
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  infoCard: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  infoSub: { fontSize: 12, lineHeight: 18 },
  importButton: {
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
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  resultTitle: { fontSize: 14, fontWeight: "600" },
  resultSub: { fontSize: 12, marginTop: 2 },
});
