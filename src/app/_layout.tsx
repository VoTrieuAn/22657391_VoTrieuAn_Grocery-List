import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Stack } from "expo-router";
import { Text } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { initTable, seedSampleGroceries } from "@/dbs/db";

export default function Layout() {
  // Initialize database and seed sample data
  const initializeDatabase = async (db: any) => {
    try {
      await initTable(db);
      await seedSampleGroceries(db);
      console.log("✅ Database initialized and seeded");
    } catch (error) {
      console.error("❌ Error initializing database:", error);
    }
  };

  return (
    <SQLiteProvider databaseName="grocery.db" onInit={initializeDatabase}>
      <SafeAreaProvider>
        <SafeAreaView className="flex flex-1">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
