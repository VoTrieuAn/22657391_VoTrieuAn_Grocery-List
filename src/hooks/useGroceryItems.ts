import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { SQLiteDatabase } from "expo-sqlite";
import { Grocery } from "@/types/grocery.type";
import {
  getAllGrocery,
  createGrocery,
  updateGrocery,
  deleteGrocery,
} from "@/dbs/db";

export const useGroceryItems = (db: SQLiteDatabase) => {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load groceries from database
  const loadGroceries = useCallback(async () => {
    try {
      const data = await getAllGrocery(db);
      const formattedData: Grocery[] = data.map((item: any) => ({
        ...item,
        bought: item.bought === 1,
        created_at: new Date(item.created_at),
      }));
      setGroceries(formattedData);
    } catch (error) {
      console.error("Error loading groceries:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [db]);

  // Initial load
  useEffect(() => {
    loadGroceries();
  }, [loadGroceries]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGroceries();
  }, [loadGroceries]);

  // Filter groceries based on search query
  const filteredGroceries = useMemo(() => {
    if (!searchQuery.trim()) {
      return groceries;
    }
    const lowerQuery = searchQuery.toLowerCase().trim();
    return groceries.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  }, [groceries, searchQuery]);

  // Toggle bought status
  const toggleBought = useCallback(
    async (id: number, bought: boolean) => {
      try {
        const item = groceries.find((g) => g.id === id);
        if (item) {
          await updateGrocery(db, { ...item, bought });
          setGroceries((prev) =>
            prev.map((g) => (g.id === id ? { ...g, bought } : g))
          );
        }
      } catch (error) {
        console.error("Error toggling bought status:", error);
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái!");
      }
    },
    [groceries, db]
  );

  // Add new grocery
  const addGrocery = useCallback(
    async (grocery: Omit<Grocery, "id">) => {
      try {
        await createGrocery(db, { ...grocery, id: 0 } as Grocery);
        await loadGroceries();
        return true;
      } catch (error) {
        console.error("Error adding grocery:", error);
        Alert.alert("Lỗi", "Không thể thêm món. Vui lòng thử lại!");
        return false;
      }
    },
    [db, loadGroceries]
  );

  // Update existing grocery
  const updateGroceryItem = useCallback(
    async (grocery: Grocery) => {
      try {
        await updateGrocery(db, grocery);
        setGroceries((prev) =>
          prev.map((item) => (item.id === grocery.id ? grocery : item))
        );
        return true;
      } catch (error) {
        console.error("Error updating grocery:", error);
        Alert.alert("Lỗi", "Không thể cập nhật món. Vui lòng thử lại!");
        return false;
      }
    },
    [db]
  );

  // Delete grocery with confirmation
  const deleteGroceryItem = useCallback(
    (id: number, name: string) => {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          "Xác nhận xóa",
          `Bạn có chắc chắn muốn xóa món "${name}" không?`,
          [
            {
              text: "Hủy",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Xóa",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteGrocery(db, id);
                  setGroceries((prev) => prev.filter((item) => item.id !== id));
                  Alert.alert("Thành công", "Đã xóa món khỏi danh sách!");
                  resolve(true);
                } catch (error) {
                  console.error("Error deleting grocery:", error);
                  Alert.alert("Lỗi", "Không thể xóa món. Vui lòng thử lại!");
                  resolve(false);
                }
              },
            },
          ],
          { cancelable: true }
        );
      });
    },
    [db]
  );

  // Import groceries from API
  const importFromAPI = useCallback(async () => {
    setImporting(true);

    try {
      const response = await fetch(
        "https://67e1773958cc6bf78525efdf.mockapi.io/api/v1/22657391_VoTrieuAn"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      // Map API response to Grocery format
      const apiGroceries: Grocery[] = apiData.map((item: any) => ({
        id: 0,
        name: item.name || "Unknown Item",
        quantity: parseInt(item.quantity) || 1,
        category: "Imported",
        bought: item.completed === true,
        created_at: new Date(),
      }));

      // Check for duplicates
      const existingNames = new Set(
        groceries.map((g) => g.name.toLowerCase().trim())
      );

      const newGroceries = apiGroceries.filter(
        (item) => !existingNames.has(item.name.toLowerCase().trim())
      );

      if (newGroceries.length === 0) {
        Alert.alert(
          "Thông báo",
          "Không có món mới để import. Tất cả các món đã tồn tại trong danh sách."
        );
        return false;
      }

      // Insert new groceries
      for (const item of newGroceries) {
        await createGrocery(db, item);
      }

      await loadGroceries();

      Alert.alert(
        "Thành công",
        `Đã import ${newGroceries.length} món mới từ API!`
      );
      return true;
    } catch (error) {
      console.error("Error importing from API:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không xác định";
      Alert.alert(
        "Lỗi",
        `Không thể import từ API: ${errorMessage}\n\nVui lòng kiểm tra kết nối mạng và thử lại.`
      );
      return false;
    } finally {
      setImporting(false);
    }
  }, [groceries, db, loadGroceries]);

  return {
    // State
    groceries,
    filteredGroceries,
    loading,
    refreshing,
    importing,
    searchQuery,

    // Actions
    setSearchQuery,
    onRefresh,
    toggleBought,
    addGrocery,
    updateGroceryItem,
    deleteGroceryItem,
    importFromAPI,
    loadGroceries,
  };
};
