import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
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

export default function ProfileScreen() {
  const router = useRouter();
  const { monthlyBudget } = useTransactions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil & Pengaturan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Info Singkat */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.profileName}>Pengguna UangSaya</Text>
            <Text style={styles.profileEmail}>
              Kelola keuangan dengan bijak
            </Text>
          </View>
        </View>

        {/* Menu Navigasi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Utama</Text>

          {/* Tombol Ekspor Laporan Keuangan */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/export" as any)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="download-outline" size={20} color="#F57C00" />
              </View>
              <Text style={styles.menuText}>Ekspor Laporan Keuangan</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Menu Utang Piutang */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/debts" as any)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="swap-horizontal" size={20} color="#1E88E5" />
              </View>
              <Text style={styles.menuText}>Catatan Utang & Piutang</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.textMain },
  container: { padding: 20 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileName: { fontSize: 18, fontWeight: "bold", color: colors.textMain },
  profileEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: { fontSize: 15, fontWeight: "600", color: colors.textMain },
});
