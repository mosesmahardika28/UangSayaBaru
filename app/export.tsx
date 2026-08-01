import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
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
};

export default function ExportScreen() {
  const router = useRouter();
  const { transactions, wallets } = useTransactions();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      const exportData = transactions.filter((t) => !t.isDebtRelated);

      if (exportData.length === 0) {
        Alert.alert("Perhatian", "Tidak ada data transaksi untuk diekspor.");
        setIsExporting(false);
        return;
      }

      let csvContent = "ID,Tanggal,Tipe,Kategori,Jumlah,Dompet,Catatan\n";

      exportData.forEach((t) => {
        const wallet =
          wallets.find((w) => w.id === t.walletId)?.name || "Dompet";
        const dateStr = new Date(t.date).toISOString().split("T")[0];
        const noteClean = t.note ? t.note.replace(/,/g, " ") : "";
        csvContent += `${t.id},${dateStr},${t.type},${t.category},${t.amount},${wallet},"${noteClean}"\n`;
      });

      const fileName = `Laporan_Keuangan_${Date.now()}.csv`;

      // Menggunakan API modern expo-file-system (Paths & File)
      const targetDir = Paths.document || Paths.cache;
      const file = new File(targetDir, fileName);

      if (!file.exists) {
        file.create();
      }

      file.write(csvContent);
      const fileUri = file.uri;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Berhasil", `File CSV berhasil disimpan di: ${fileUri}`);
      }
    } catch (error) {
      console.error("Gagal ekspor:", error);
      Alert.alert("Error", "Gagal mengekspor laporan keuangan.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ekspor Laporan Keuangan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <Ionicons
            name="document-text-outline"
            size={56}
            color={colors.primary}
          />
          <Text style={styles.cardTitle}>Unduh Laporan Format CSV</Text>
          <Text style={styles.cardDesc}>
            Fitur ini akan mengekspor seluruh riwayat transaksi operasional Anda
            (mengabaikan data utang/piutang) ke dalam format file `.csv`. File
            dapat dibuka dengan mudah menggunakan Microsoft Excel, Google
            Sheets, atau WPS Office.
          </Text>

          <TouchableOpacity
            style={[styles.exportButton, isExporting && { opacity: 0.6 }]}
            onPress={handleExportCSV}
            disabled={isExporting}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.exportButtonText}>
              {isExporting ? "Menyiapkan File..." : "Unduh & Bagikan CSV"}
            </Text>
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  container: { padding: 20 },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textMain,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  exportButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
  },
  exportButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
