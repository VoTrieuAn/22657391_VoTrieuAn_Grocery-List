import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Slot, Stack } from "expo-router";
import { Text } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { initTable } from "@/dbs";

export default function Layout() {
  return (
    <SQLiteProvider databaseName="moneylogapp" onInit={initTable}>
      <SafeAreaProvider>
        <SafeAreaView className="flex flex-1">
          <Text className="text-3xl font-bold text-center text-blue-400 border-b-2 border-blue-400 shadow-inherit">
            MONEY LOG
          </Text>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
