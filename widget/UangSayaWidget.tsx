"use no memo";
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

interface UangSayaWidgetProps {
  totalBalance?: string;
}

export function UangSayaWidget({ totalBalance = "Rp 0" }: UangSayaWidgetProps) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        backgroundColor: "#0097A7",
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      {/* Header Widget */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextWidget
          text="UangSaya"
          style={{
            color: "#E0F7FA", // Menggunakan warna terang semi-transparan versi hex
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
      </FlexWidget>

      {/* Informasi Total Saldo */}
      <FlexWidget style={{ marginVertical: 8 }}>
        <TextWidget
          text="Total Saldo"
          style={{
            color: "#E0F7FA",
            fontSize: 11,
          }}
        />
        <TextWidget
          text={totalBalance}
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "bold",
          }}
        />
      </FlexWidget>

      {/* Tombol Shortcut Tambah Transaksi */}
      <FlexWidget
        style={{
          backgroundColor: "#FFFFFF",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
        clickAction="OPEN_ADD_TRANSACTION"
      >
        <TextWidget
          text="+ Tambah Transaksi"
          style={{
            color: "#0097A7",
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
