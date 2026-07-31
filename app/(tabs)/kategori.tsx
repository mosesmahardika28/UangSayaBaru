import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

export default function KategoriScreen() {
  const [type, setType] = useState<"expense" | "income">("expense");

  // Data dummy untuk daftar kategori
  const categories = {
    expense: [
      {
        id: 1,
        name: "Makan",
        icon: "restaurant",
        color: "#0097A7",
        bg: "#E0F7FA",
      },
      {
        id: 2,
        name: "Transportasi",
        icon: "bus",
        color: "#F57C00",
        bg: "#FFF3E0",
      },
      {
        id: 3,
        name: "Kuliah",
        icon: "school",
        color: "#388E3C",
        bg: "#E8F5E9",
      },
      { id: 4, name: "Belanja", icon: "cart", color: "#E91E63", bg: "#FCE4EC" },
      {
        id: 5,
        name: "Hiburan",
        icon: "game-controller",
        color: "#673AB7",
        bg: "#EDE7F6",
      },
      {
        id: 6,
        name: "Kesehatan",
        icon: "medical",
        color: "#F44336",
        bg: "#FFEBEE",
      },
    ],
    income: [
      { id: 7, name: "Gaji", icon: "wallet", color: "#2E7D32", bg: "#E8F5E9" },
      { id: 8, name: "Bonus", icon: "gift", color: "#F9A825", bg: "#FFF9C4" },
      {
        id: 9,
        name: "Investasi",
        icon: "trending-up",
        color: "#1565C0",
        bg: "#E3F2FD",
      },
    ],
  };

  const activeCategories =
    type === "expense" ? categories.expense : categories.income;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kategori</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Toggle Tab (Pengeluaran / Pemasukan) */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, type === "expense" && styles.activeTab]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.tabText,
                type === "expense" && styles.activeTabText,
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, type === "income" && styles.activeTab]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.tabText,
                type === "income" && styles.activeTabText,
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.gridContainer}>
          {activeCategories.map((item) => (
            <TouchableOpacity key={item.id} style={styles.categoryCard}>
              <View
                style={[styles.iconContainer, { backgroundColor: item.bg }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color={item.color}
                />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 80 }} />
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
  headerTitle: { fontSize: 24, fontWeight: "bold", color: colors.textMain },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tabWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEEEEE",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  activeTabText: { color: colors.primary },
  container: { paddingHorizontal: 15 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "30%", // Membuat tampilan 3 kolom
    backgroundColor: colors.card,
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMain,
    textAlign: "center",
  },
});
