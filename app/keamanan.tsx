import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function KeamananScreen() {
  const router = useRouter();
  const { hasPin, setupPin, removePin } = useAuth();
  const [newPin, setNewPin] = useState("");

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      alert("PIN harus 4 digit angka!");
      return;
    }
    setupPin(newPin);
    setNewPin("");
    alert("PIN berhasil diaktifkan!");
  };

  const handleRemovePin = () => {
    Alert.alert("Matikan Keamanan", "Yakin ingin menghapus PIN?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => removePin() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>Pengaturan Keamanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {hasPin ? (
          <View style={styles.activeCard}>
            <Ionicons name="shield-checkmark" size={48} color="#43A047" />
            <Text style={styles.statusText}>Keamanan Aktif</Text>
            <Text style={styles.statusSub}>
              Aplikasi dilindungi oleh PIN dan Sidik Jari
            </Text>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={handleRemovePin}
            >
              <Text style={styles.removeBtnText}>Matikan Keamanan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.setupCard}>
            <Ionicons name="shield-half" size={48} color="#757575" />
            <Text style={styles.statusText}>Keamanan Nonaktif</Text>
            <Text style={styles.statusSub}>
              Buat 4 digit PIN untuk mengamankan data Anda.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Masukkan 4 Digit Angka"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={newPin}
              onChangeText={setNewPin}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSetPin}>
              <Text style={styles.saveBtnText}>Aktifkan PIN & Sidik Jari</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#212121" },
  content: { padding: 20 },
  activeCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  setupCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  statusText: { fontSize: 18, fontWeight: "bold", marginTop: 16 },
  statusSub: {
    fontSize: 13,
    color: "#757575",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#43A047",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  removeBtn: {
    backgroundColor: "#FFEBEE",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  removeBtnText: { color: "#C62828", fontWeight: "bold", fontSize: 15 },
});
