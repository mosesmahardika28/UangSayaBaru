import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function ImportScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [fileName, setFileName] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "*/*"], // Targetkan file JSON
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setFileName(file.name);
      setIsSuccess(false);

      // Baca isi file
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      try {
        // Parse data kembali menjadi Array JavaScript
        const parsedData = JSON.parse(fileContent);

        // Validasi: pastikan format file berupa array pasangan key-value
        if (Array.isArray(parsedData)) {
          Alert.alert(
            "Konfirmasi Restore",
            "Tindakan ini akan menimpa seluruh data saat ini dengan data dari file backup. Anda yakin ingin melanjutkan?",
            [
              { text: "Batal", style: "cancel" },
              {
                text: "Ya, Pulihkan",
                style: "destructive",
                onPress: async () => {
                  try {
                    // Masukkan kembali semua data ke AsyncStorage
                    await AsyncStorage.multiSet(parsedData);
                    setIsSuccess(true);

                    Alert.alert(
                      "Restore Berhasil!",
                      "Semua data berhasil dikembalikan. Silakan TUTUP dan BUKA KEMBALI (Restart) aplikasi agar data terbaru dimuat seutuhnya.",
                    );
                  } catch (e) {
                    Alert.alert(
                      "Gagal",
                      "Terjadi kesalahan saat menyimpan data ke perangkat.",
                    );
                  }
                },
              },
            ],
          );
        } else {
          Alert.alert(
            "File Tidak Valid",
            "Struktur file backup ini tidak sesuai dengan standar aplikasi UangSaya.",
          );
        }
      } catch (parseError) {
        Alert.alert(
          "Format Salah",
          "File yang Anda pilih bukan file konfigurasi JSON yang valid.",
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Gagal Impor",
        error.message || "Terjadi kesalahan saat membaca file backup.",
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
          Restore Data Backup
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
            <Ionicons name="cloud-download-outline" size={24} color="#F57C00" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.infoTitle, { color: colors.textMain }]}>
              Unggah File Backup (.json)
            </Text>
            <Text style={[styles.infoSub, { color: colors.textMuted }]}>
              Pilih file konfigurasi berformat .json yang sebelumnya Anda ekspor
              dari aplikasi ini. Seluruh saldo, transaksi, dan pengaturan akan
              dikembalikan.
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
          <Text style={styles.importButtonText}>Pilih File Backup</Text>
        </TouchableOpacity>

        {fileName && (
          <View
            style={[
              styles.resultBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name={isSuccess ? "checkmark-circle" : "document-text-outline"}
              size={24}
              color={isSuccess ? colors.primary : colors.textMuted}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.resultTitle, { color: colors.textMain }]}>
                File: {fileName}
              </Text>
              {isSuccess && (
                <Text style={[styles.resultSub, { color: colors.textMuted }]}>
                  Database berhasil dipulihkan.
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
