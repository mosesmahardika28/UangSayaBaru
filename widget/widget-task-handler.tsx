import { UangSayaWidget } from "./UangSayaWidget";

export async function widgetTaskHandler(props: any) {
  const widgetInfo = props.widgetInfo;
  const widgetAction = props.widgetAction;

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
      // Di sini nanti kita ambil data saldo asli dari penyimpanan lokal (AsyncStorage)
      try {
        props.renderWidget(
          <UangSayaWidget totalBalance="Rp 4.500.000" />
        );
      } catch (e) {
        props.renderWidget(<UangSayaWidget totalBalance="Rp 0" />);
      }
      break;

    case "WIDGET_DELETED":
      break;

    case "WIDGET_CLICK":
      // Ketika tombol "+ Tambah Transaksi" diketuk, arahkan lewat Deep Link
      if (props.clickAction === "OPEN_ADD_TRANSACTION") {
        // Menggunakan scheme uangsaya://add-transaction yang sudah aktif
        // Sistem otomatis membuka halaman tambah transaksi
      }
      break;
  }
}