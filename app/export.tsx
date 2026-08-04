import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function ExportScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleExportAllData = async () => {
    try {
      // 1. Ambil semua kunci data yang tersimpan di aplikasi
      const allKeys = await AsyncStorage.getAllKeys();

      if (allKeys.length === 0) {
        Alert.alert("Perhatian", "Tidak ada data apa pun untuk diekspor.");
        return;
      }

      // 2. Ambil semua pasangan key dan value
      const allData = await AsyncStorage.multiGet(allKeys);

      // 3. Ubah menjadi string JSON agar bisa disimpan sebagai file
      const jsonData = JSON.stringify(allData);

      // 4. Siapkan nama file dan lokasi penyimpanan sementara
      const fileName = `UangSaya_FullBackup_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // 5. Tulis file JSON
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 6. Bagikan / Simpan file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Simpan Backup UangSaya",
        });
      } else {
        Alert.alert("Sukses", `File backup berhasil disimpan di: ${fileUri}`);
      }
    } catch (error: any) {
      Alert.alert(
        "Gagal Ekspor",
        error.message || "Terjadi kesalahan saat membuat file backup JSON.",
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
          Backup Semua Data
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
            <Ionicons name="server-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.infoTitle, { color: colors.textMain }]}>
              Ekspor Database (JSON)
            </Text>
            <Text style={[styles.infoSub, { color: colors.textMuted }]}>
              Simpan seluruh data aplikasi (saldo, riwayat transaksi, utang, dan
              goals) ke dalam satu file .json yang aman.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={handleExportAllData}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.exportButtonText}>Unduh File Backup</Text>
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
