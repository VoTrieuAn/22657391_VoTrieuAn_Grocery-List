import React, { useState, useEffect } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Grocery } from "@/types/grocery.type";
import { getAllGrocery, updateGrocery } from "@/dbs/db";
import GroceryItem from "@/compoents/GroceryItem";

export default function Page() {
  const db = useSQLiteContext();
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from SQLite
  const loadGroceries = async () => {
    try {
      const data = await getAllGrocery(db);
      // Convert bought from number to boolean and created_at to Date
      const formattedData: Grocery[] = data.map((item: any) => ({
        ...item,
        bought: item.bought === 1,
        created_at: new Date(item.created_at),
      }));
      setGroceries(formattedData);
    } catch (error) {
      console.error("Error loading groceries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadGroceries();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadGroceries();
  };

  // Toggle bought status
  const handleToggleBought = async (id: number, bought: boolean) => {
    try {
      const item = groceries.find((g) => g.id === id);
      if (item) {
        await updateGrocery(db, { ...item, bought });
        // Update local state
        setGroceries((prev) =>
          prev.map((g) => (g.id === id ? { ...g, bought } : g))
        );
      }
    } catch (error) {
      console.error("Error updating grocery:", error);
    }
  };

  // Empty state component
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-lg text-gray-500 text-center">
        Danh sách trống, thêm món cần mua nhé!
      </Text>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="bg-blue-400 p-4">
        <Text className="text-2xl font-bold text-white text-center">
          DANH SÁCH MUA SẮM
        </Text>
        <Text className="text-sm text-white text-center mt-1">
          {groceries.length} món • {groceries.filter((g) => g.bought).length} đã
          mua
        </Text>
      </View>

      <FlatList
        data={groceries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GroceryItem data={item} onToggleBought={handleToggleBought} />
        )}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          groceries.length === 0 ? { flex: 1 } : { paddingBottom: 16 }
        }
      />
    </View>
  );
}
