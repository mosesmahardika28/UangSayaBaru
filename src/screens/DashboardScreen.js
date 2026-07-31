import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../theme/colors";

export default function DashboardScreen() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Profil & Judul */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.appTitle}>UangSaya</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Kartu Saldo Utama (Main Balance Card) */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Total Saldo</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Text style={styles.eyeIcon}>{showBalance ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceText}>
            {showBalance ? "Rp 24.530.600" : "Rp ••••••••"}
          </Text>
          <Text style={styles.cardSubtext}>Semua Dompet ›</Text>
        </View>

        {/* 3. Section Dompet Saya (My Accounts Carousel) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dompet Saya</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountScroll}
        >
          {/* Card Dompet 1 */}
          <View style={styles.accountCard}>
            <View style={[styles.accountIcon, { backgroundColor: "#2E3A59" }]}>
              <Text>💳</Text>
            </View>
            <Text style={styles.accountName}>Rekening Utama</Text>
            <Text style={styles.accountBalance}>Rp 12.430.500</Text>
            <Text style={styles.accountNumber}>•••• 4242</Text>
          </View>

          {/* Card Dompet 2 */}
          <View style={styles.accountCard}>
            <View style={[styles.accountIcon, { backgroundColor: "#1E4D3B" }]}>
              <Text>🐷</Text>
            </View>
            <Text style={styles.accountName}>Tabungan</Text>
            <Text style={styles.accountBalance}>Rp 8.250.000</Text>
            <Text style={styles.accountNumber}>•••• 4242</Text>
          </View>

          {/* Card Dompet 3 */}
          <View style={styles.accountCard}>
            <View style={[styles.accountIcon, { backgroundColor: "#4A2A59" }]}>
              <Text>🪙</Text>
            </View>
            <Text style={styles.accountName}>Crypto / e-Wallet</Text>
            <Text style={styles.accountBalance}>Rp 3.850.100</Text>
            <Text style={styles.accountNumber}>•••• 4242</Text>
          </View>
        </ScrollView>

        {/* 4. Section Ringkasan (Overview) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <Text style={styles.seeAllText}>Bulanan ▾</Text>
        </View>

        <View style={styles.overviewGrid}>
          {/* Pemasukan */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={[styles.arrowIcon, { color: colors.income }]}>
                ↗
              </Text>
              <Text style={styles.overviewLabel}>Pemasukan</Text>
            </View>
            <Text style={styles.overviewAmount}>Rp 6.420.000</Text>
            <Text style={[styles.badgeText, { color: colors.income }]}>
              +12.5% vs bln lalu
            </Text>
          </View>

          {/* Pengeluaran */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={[styles.arrowIcon, { color: colors.expense }]}>
                ↘
              </Text>
              <Text style={styles.overviewLabel}>Pengeluaran</Text>
            </View>
            <Text style={styles.overviewAmount}>Rp 2.950.500</Text>
            <Text style={[styles.badgeText, { color: colors.expense }]}>
              -8.3% vs bln lalu
            </Text>
          </View>
        </View>

        {/* 5. Transaksi Terbaru (Recent Activity) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {/* Transaksi 1 */}
          <View style={styles.transactionItem}>
            <View style={styles.transIconBg}>
              <Text>🎨</Text>
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Dribbble Pro</Text>
              <Text style={styles.transCategory}>Langganan</Text>
            </View>
            <View style={styles.transAmountBox}>
              <Text style={[styles.transAmount, { color: colors.expense }]}>
                -Rp 150.000
              </Text>
              <Text style={styles.transDate}>Hari Ini</Text>
            </View>
          </View>

          {/* Transaksi 2 */}
          <View style={styles.transactionItem}>
            <View style={styles.transIconBg}>
              <Text>💼</Text>
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Gaji Bulanan</Text>
              <Text style={styles.transCategory}>Pemasukan</Text>
            </View>
            <View style={styles.transAmountBox}>
              <Text style={[styles.transAmount, { color: colors.income }]}>
                +Rp 4.800.000
              </Text>
              <Text style={styles.transDate}>Hari Ini</Text>
            </View>
          </View>

          {/* Transaksi 3 */}
          <View style={styles.transactionItem}>
            <View style={styles.transIconBg}>
              <Text>🛍️</Text>
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Belanja Harian</Text>
              <Text style={styles.transCategory}>Belanja</Text>
            </View>
            <View style={styles.transAmountBox}>
              <Text style={[styles.transAmount, { color: colors.expense }]}>
                -Rp 899.000
              </Text>
              <Text style={styles.transDate}>Kemarin</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity style={styles.fabButton}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  appTitle: {
    color: colors.textMain,
    fontSize: 20,
    fontWeight: "bold",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
  },
  mainCard: {
    backgroundColor: "#1E1E2E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D2D44",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  balanceText: {
    color: colors.textMain,
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 12,
  },
  cardSubtext: {
    color: colors.textMuted,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: "600",
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
  },
  accountScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    width: 140,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  accountName: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  accountBalance: {
    color: colors.textMain,
    fontSize: 14,
    fontWeight: "bold",
  },
  accountNumber: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 6,
  },
  overviewGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  overviewCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 6,
  },
  overviewLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  overviewAmount: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
  },
  transactionList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  transIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2A2A35",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transInfo: {
    flex: 1,
  },
  transTitle: {
    color: colors.textMain,
    fontSize: 14,
    fontWeight: "600",
  },
  transCategory: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  transAmountBox: {
    alignItems: "flex-end",
  },
  transAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 32,
    marginTop: -2,
  },
});
