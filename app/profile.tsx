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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil & Pengaturan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Info Pengguna */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.userName}>Pengguna UangSaya</Text>
            <Text style={styles.userEmail}>keuangan@aman.com</Text>
          </View>
        </View>

        {/* Menu Pintasan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keuangan & Catatan</Text>

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

          {/* Menu Keamanan (PIN & Sidik Jari) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/keamanan" as any)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.menuText}>Keamanan & PIN</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, backgroundColor: colors.background },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.textMain },
  container: { paddingHorizontal: 20 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textMain,
    marginBottom: 2,
  },
  userEmail: { fontSize: 13, color: colors.textMuted },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textMain,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: { fontSize: 14, fontWeight: "600", color: colors.textMain },
});
