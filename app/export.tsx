import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React from "react";
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

export default function ExportScreen() {
  const router = useRouter();
  const { transactions, wallets } = useTransactions();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleExportCSV = async () => {
    try {
      if (transactions.length === 0) {
        Alert.alert("Perhatian", "Tidak ada transaksi untuk diekspor.");
        return;
      }

      // Buat Header CSV yang sesuai dengan struktur pembacaan impor
      let csvContent = "ID,Tanggal,Tipe,Kategori,Dompet,Nominal,Catatan\n";

      transactions.forEach((t) => {
        const wallet = wallets.find((w) => w.id === t.walletId);
        const walletName = wallet ? wallet.name : "Dompet";

        // Bungkus teks dengan tanda kutip ganda dan escape kutip di dalamnya agar aman dari koma
        const safeCat = `"${(t.category || "").replace(/"/g, '""')}"`;
        const safeNote = `"${(t.note || "").replace(/"/g, '""')}"`;
        const safeWallet = `"${walletName.replace(/"/g, '""')}"`;

        csvContent += `${t.id},${t.date},${t.type},${safeCat},${safeWallet},${t.amount},${safeNote}\n`;
      });

      const fileName = `keuangan_export_${Date.now()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Simpan File CSV Keuangan",
        });
      } else {
        Alert.alert("Sukses", `File berhasil disimpan di: ${fileUri}`);
      }
    } catch (error: any) {
      Alert.alert(
        "Gagal Ekspor",
        error.message || "Terjadi kesalahan saat membuat file CSV.",
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
          Ekspor Data CSV
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
                backgroundColor: isDarkMode ? "#1B3E2B" : colors.primary + "20",
              },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.infoTitle, { color: colors.textMain }]}>
              Ekspor Riwayat ke CSV
            </Text>
            <Text style={[styles.infoSub, { color: colors.textMuted }]}>
              Simpan seluruh riwayat transaksi Anda ke dalam format file .csv
              yang kompatibel dan dapat diimpor kembali dengan mudah.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={handleExportCSV}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.exportButtonText}>Unduh File CSV</Text>
        </TouchableOpacity>
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
  exportButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  exportButtonText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});
