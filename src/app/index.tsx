import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Grocery } from "@/types/grocery.type";
import {
  getAllGrocery,
  updateGrocery,
  createGrocery,
  deleteGrocery,
} from "@/dbs/db";
import GroceryItem from "@/compoents/GroceryItem";
import { TextInput, Button, Searchbar } from "react-native-paper";

export default function Page() {
  const db = useSQLiteContext();
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [nameError, setNameError] = useState("");

  // Edit modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Grocery | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("1");
  const [editItemCategory, setEditItemCategory] = useState("");
  const [editNameError, setEditNameError] = useState("");

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

  // Filter groceries based on search query (optimized with useMemo)
  const filteredGroceries = useMemo(() => {
    if (!searchQuery.trim()) {
      return groceries;
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    return groceries.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  }, [groceries, searchQuery]);

  // Handle refresh (optimized with useCallback)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGroceries();
  }, []);

  // Toggle bought status (optimized with useCallback)
  const handleToggleBought = useCallback(
    async (id: number, bought: boolean) => {
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
    },
    [groceries, db]
  );

  // Delete grocery with confirmation (optimized with useCallback)
  const handleDeleteGrocery = useCallback(
    (id: number, name: string) => {
      Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc chắn muốn xóa món "${name}" không?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              try {
                // Delete from database
                await deleteGrocery(db, id);

                // Update local state
                setGroceries((prev) => prev.filter((item) => item.id !== id));

                // Show success message
                Alert.alert("Thành công", "Đã xóa món khỏi danh sách!");
              } catch (error) {
                console.error("Error deleting grocery:", error);
                Alert.alert("Lỗi", "Không thể xóa món. Vui lòng thử lại!");
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [db]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setNewItemName("");
    setNewItemQuantity("1");
    setNewItemCategory("");
    setNameError("");
  }, []);

  // Open modal
  const handleOpenModal = useCallback(() => {
    resetForm();
    setModalVisible(true);
  }, [resetForm]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  // Validate and save new item
  const handleSaveItem = async () => {
    // Validate name
    if (!newItemName.trim()) {
      setNameError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua!");
      return;
    }

    try {
      const newGrocery: Grocery = {
        id: 0, // Will be auto-generated
        name: newItemName.trim(),
        quantity: parseInt(newItemQuantity) || 1,
        category: newItemCategory.trim(),
        bought: false,
        created_at: new Date(),
      };

      // Insert into database
      await createGrocery(db, newGrocery);

      // Reload the list to get the new item with proper ID
      await loadGroceries();

      // Close modal and reset form
      handleCloseModal();

      // Show success message
      Alert.alert("Thành công", "Đã thêm món vào danh sách!");
    } catch (error) {
      console.error("Error creating grocery:", error);
      Alert.alert("Lỗi", "Không thể thêm món. Vui lòng thử lại!");
    }
  };

  // Open edit modal (optimized with useCallback)
  const handleOpenEditModal = useCallback((item: Grocery) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemQuantity(item.quantity.toString());
    setEditItemCategory(item.category || "");
    setEditNameError("");
    setEditModalVisible(true);
  }, []);

  // Close edit modal (optimized with useCallback)
  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingItem(null);
    setEditItemName("");
    setEditItemQuantity("1");
    setEditItemCategory("");
    setEditNameError("");
  }, []);

  // Validate and update item
  const handleUpdateItem = async () => {
    // Validate name
    if (!editItemName.trim()) {
      setEditNameError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua!");
      return;
    }

    if (!editingItem) return;

    try {
      const updatedGrocery: Grocery = {
        ...editingItem,
        name: editItemName.trim(),
        quantity: parseInt(editItemQuantity) || 1,
        category: editItemCategory.trim(),
      };

      // Update in database
      await updateGrocery(db, updatedGrocery);

      // Update local state
      setGroceries((prev) =>
        prev.map((item) =>
          item.id === updatedGrocery.id ? updatedGrocery : item
        )
      );

      // Close modal
      handleCloseEditModal();

      // Show success message
      Alert.alert("Thành công", "Đã cập nhật món!");
    } catch (error) {
      console.error("Error updating grocery:", error);
      Alert.alert("Lỗi", "Không thể cập nhật món. Vui lòng thử lại!");
    }
  };

  // Empty state component (optimized with useCallback)
  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-lg text-gray-500 text-center">
          {searchQuery.trim()
            ? `Không tìm thấy món nào với "${searchQuery}"`
            : "Danh sách trống, thêm món cần mua nhé!"}
        </Text>
      </View>
    ),
    [searchQuery]
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

      {/* Search Bar */}
      <View className="px-4 pt-3 pb-2 bg-gray-50">
        <Searchbar
          placeholder="Tìm kiếm món cần mua..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon="magnify"
          clearIcon="close"
          style={{ elevation: 2 }}
        />
        {searchQuery.trim() && (
          <Text className="text-xs text-gray-600 mt-2">
            Tìm thấy {filteredGroceries.length} kết quả
          </Text>
        )}
      </View>

      <FlatList
        data={filteredGroceries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GroceryItem
            data={item}
            onToggleBought={handleToggleBought}
            onEdit={handleOpenEditModal}
            onDelete={(id) => handleDeleteGrocery(id, item.name)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          filteredGroceries.length === 0 ? { flex: 1 } : { paddingBottom: 80 }
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleOpenModal}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 pb-8">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">
                  Thêm món mới
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Text className="text-gray-500 text-2xl">×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  {/* Name Input */}
                  <View>
                    <TextInput
                      label="Tên món *"
                      value={newItemName}
                      onChangeText={(text) => {
                        setNewItemName(text);
                        setNameError("");
                      }}
                      mode="outlined"
                      error={!!nameError}
                      placeholder="Ví dụ: Sữa tươi, Rau cải..."
                    />
                    {nameError ? (
                      <Text className="text-red-500 text-xs mt-1">
                        {nameError}
                      </Text>
                    ) : null}
                  </View>

                  {/* Quantity Input */}
                  <TextInput
                    label="Số lượng"
                    value={newItemQuantity}
                    onChangeText={setNewItemQuantity}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="Mặc định: 1"
                  />

                  {/* Category Input */}
                  <TextInput
                    label="Danh mục (tùy chọn)"
                    value={newItemCategory}
                    onChangeText={setNewItemCategory}
                    mode="outlined"
                    placeholder="Ví dụ: Dairy, Protein, Bakery..."
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-6">
                  <Button
                    mode="outlined"
                    onPress={handleCloseModal}
                    style={{ flex: 1 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveItem}
                    style={{ flex: 1 }}
                  >
                    Lưu
                  </Button>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 pb-8">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">
                  Chỉnh sửa món
                </Text>
                <TouchableOpacity onPress={handleCloseEditModal}>
                  <Text className="text-gray-500 text-2xl">×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  {/* Name Input */}
                  <View>
                    <TextInput
                      label="Tên món *"
                      value={editItemName}
                      onChangeText={(text) => {
                        setEditItemName(text);
                        setEditNameError("");
                      }}
                      mode="outlined"
                      error={!!editNameError}
                      placeholder="Ví dụ: Sữa tươi, Rau cải..."
                    />
                    {editNameError ? (
                      <Text className="text-red-500 text-xs mt-1">
                        {editNameError}
                      </Text>
                    ) : null}
                  </View>

                  {/* Quantity Input */}
                  <TextInput
                    label="Số lượng"
                    value={editItemQuantity}
                    onChangeText={setEditItemQuantity}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="Mặc định: 1"
                  />

                  {/* Category Input */}
                  <TextInput
                    label="Danh mục (tùy chọn)"
                    value={editItemCategory}
                    onChangeText={setEditItemCategory}
                    mode="outlined"
                    placeholder="Ví dụ: Dairy, Protein, Bakery..."
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-6">
                  <Button
                    mode="outlined"
                    onPress={handleCloseEditModal}
                    style={{ flex: 1 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleUpdateItem}
                    style={{ flex: 1 }}
                  >
                    Cập nhật
                  </Button>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
