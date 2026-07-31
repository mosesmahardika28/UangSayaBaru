import { StatusBar } from "react-native";
import DashboardScreen from "./src/screens/DashboardScreen";

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
      <DashboardScreen />
    </>
  );
}