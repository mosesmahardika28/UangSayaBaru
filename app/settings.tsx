import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { resetAppData } = useTransactions();
  const { theme, colors, setTheme, toggleTheme } = useTheme();

  const handleResetApp = () => {
    Alert.alert(
      "Zona Berbahaya: Reset Aplikasi",
      "Semua data transaksi, dompet, kategori, dan anggaran akan dihapus permanen. Apakah Anda yakin?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Reset Semua",
          style: "destructive",
          onPress: async () => {
            await resetAppData();
            Alert.alert("Sukses", "Aplikasi telah diatur ulang.");
            router.replace("/");
          },
        },
      ],
    );
  };

  const isDarkMode = theme === "dark";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          Pengaturan
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Seksi Tampilan (Mode Gelap / Terang) */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Tampilan & Tema
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.menuItem}>
            <View
              style={[
                styles.iconBg,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name={isDarkMode ? "moon-outline" : "sunny-outline"}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.textMain }]}>
                Mode Gelap
              </Text>
              <Text style={[styles.subText, { color: colors.textMuted }]}>
                {isDarkMode ? "Aktif (Dark Mode)" : "Nonaktif (Light Mode)"}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D1D1", true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Seksi Data & Keamanan */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textMuted, marginTop: 20 },
          ]}
        >
          Data & Keamanan
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Ekspor Data */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/export")}
          >
            <View
              style={[
                styles.iconBg,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.menuText, { color: colors.textMain }]}>
              Ekspor Data (CSV)
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Impor Data */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/import")}
          >
            <View
              style={[styles.iconBg, { backgroundColor: colors.accent + "20" }]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.menuText, { color: colors.textMain }]}>
              Impor Data (CSV)
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Pengaturan Keamanan */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/keamanan" as any)}
          >
            <View
              style={[
                styles.iconBg,
                { backgroundColor: colors.transfer + "20" },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.transfer}
              />
            </View>
            <Text style={[styles.menuText, { color: colors.textMain }]}>
              Pengaturan Keamanan
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Zona Berbahaya */}
        <Text
          style={[styles.sectionTitle, { color: colors.danger, marginTop: 24 }]}
        >
          Zona Berbahaya
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: isDarkMode ? "#5A2525" : "#FFCDD2",
            },
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={handleResetApp}>
            <View
              style={[styles.iconBg, { backgroundColor: colors.danger + "20" }]}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </View>
            <Text style={[styles.menuText, { color: colors.danger }]}>
              Reset Aplikasi (Hapus Semua Data)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
});
