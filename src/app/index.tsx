import React, { useState, useEffect } from "react";
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
import { getAllGrocery, updateGrocery, createGrocery } from "@/dbs/db";
import GroceryItem from "@/compoents/GroceryItem";
import { TextInput, Button } from "react-native-paper";

export default function Page() {
  const db = useSQLiteContext();
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [nameError, setNameError] = useState("");

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

  // Reset form
  const resetForm = () => {
    setNewItemName("");
    setNewItemQuantity("1");
    setNewItemCategory("");
    setNameError("");
  };

  // Open modal
  const handleOpenModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };

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
          groceries.length === 0 ? { flex: 1 } : { paddingBottom: 80 }
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
    </View>
  );
}
