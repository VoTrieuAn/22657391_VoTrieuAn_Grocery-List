import React, { useState, useCallback } from "react";
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
import GroceryItem from "@/compoents/GroceryItem";
import { TextInput, Button, Searchbar, Icon } from "react-native-paper";
import { useGroceryItems } from "@/hooks/useGroceryItems";

export default function Page() {
  const db = useSQLiteContext();

  // Use custom hook for grocery logic
  const {
    filteredGroceries,
    loading,
    refreshing,
    importing,
    searchQuery,
    setSearchQuery,
    onRefresh,
    toggleBought,
    addGrocery,
    updateGroceryItem,
    deleteGroceryItem,
    importFromAPI,
  } = useGroceryItems(db);

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

  // Reset add form
  const resetForm = useCallback(() => {
    setNewItemName("");
    setNewItemQuantity("1");
    setNewItemCategory("");
    setNameError("");
  }, []);

  // Open add modal
  const handleOpenModal = useCallback(() => {
    resetForm();
    setModalVisible(true);
  }, [resetForm]);

  // Close add modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  // Save new item
  const handleSaveItem = useCallback(async () => {
    if (!newItemName.trim()) {
      setNameError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua!");
      return;
    }

    const success = await addGrocery({
      name: newItemName.trim(),
      quantity: parseInt(newItemQuantity) || 1,
      category: newItemCategory.trim(),
      bought: false,
      created_at: new Date(),
    });

    if (success) {
      handleCloseModal();
      Alert.alert("Thành công", "Đã thêm món vào danh sách!");
    }
  }, [
    newItemName,
    newItemQuantity,
    newItemCategory,
    addGrocery,
    handleCloseModal,
  ]);

  // Open edit modal
  const handleOpenEditModal = useCallback((item: Grocery) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemQuantity(item.quantity.toString());
    setEditItemCategory(item.category || "");
    setEditNameError("");
    setEditModalVisible(true);
  }, []);

  // Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingItem(null);
    setEditItemName("");
    setEditItemQuantity("1");
    setEditItemCategory("");
    setEditNameError("");
  }, []);

  // Update item
  const handleUpdateItem = useCallback(async () => {
    if (!editItemName.trim()) {
      setEditNameError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua!");
      return;
    }

    if (!editingItem) return;

    const success = await updateGroceryItem({
      ...editingItem,
      name: editItemName.trim(),
      quantity: parseInt(editItemQuantity) || 1,
      category: editItemCategory.trim(),
    });

    if (success) {
      handleCloseEditModal();
      Alert.alert("Thành công", "Đã cập nhật món!");
    }
  }, [
    editItemName,
    editItemQuantity,
    editItemCategory,
    editingItem,
    updateGroceryItem,
    handleCloseEditModal,
  ]);

  // Enhanced empty state
  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center p-8">
        <Icon source="cart-outline" size={80} color="#cbd5e1" />
        <Text className="text-xl font-bold text-gray-600 mt-4 text-center">
          {searchQuery.trim()
            ? `Không tìm thấy "${searchQuery}"`
            : "Danh sách trống"}
        </Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">
          {searchQuery.trim()
            ? "Thử tìm kiếm với từ khóa khác"
            : "Thêm món cần mua bằng nút + bên dưới"}
        </Text>
        {!searchQuery.trim() && (
          <Button
            mode="contained"
            onPress={handleOpenModal}
            className="mt-6"
            icon="plus"
          >
            Thêm món đầu tiên
          </Button>
        )}
      </View>
    ),
    [searchQuery, handleOpenModal]
  );

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="text-gray-600 mt-4">Đang tải danh sách...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-blue-400 p-4 shadow-lg">
        <Text className="text-2xl font-bold text-white text-center">
          DANH SÁCH MUA SẮM
        </Text>
        <Text className="text-sm text-white text-center mt-1 opacity-90">
          {filteredGroceries.length} món •{" "}
          {filteredGroceries.filter((g) => g.bought).length} đã mua
        </Text>

        {/* Import Button */}
        <View className="mt-3">
          <Button
            mode="contained"
            onPress={importFromAPI}
            loading={importing}
            disabled={importing || loading}
            icon="download"
            buttonColor="#10b981"
            textColor="#ffffff"
          >
            {importing ? "Đang import..." : "Import từ API"}
          </Button>
        </View>
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

      {/* List */}
      <FlatList
        data={filteredGroceries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GroceryItem
            data={item}
            onToggleBought={toggleBought}
            onEdit={handleOpenEditModal}
            onDelete={(id) => deleteGroceryItem(id, item.name)}
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
        disabled={loading || importing}
        className={`absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${
          loading || importing ? "bg-gray-400" : "bg-blue-500"
        }`}
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

                  <TextInput
                    label="Số lượng"
                    value={newItemQuantity}
                    onChangeText={setNewItemQuantity}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="Mặc định: 1"
                  />

                  <TextInput
                    label="Danh mục (tùy chọn)"
                    value={newItemCategory}
                    onChangeText={setNewItemCategory}
                    mode="outlined"
                    placeholder="Ví dụ: Dairy, Protein, Bakery..."
                  />
                </View>

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
                    disabled={loading}
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

                  <TextInput
                    label="Số lượng"
                    value={editItemQuantity}
                    onChangeText={setEditItemQuantity}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="Mặc định: 1"
                  />

                  <TextInput
                    label="Danh mục (tùy chọn)"
                    value={editItemCategory}
                    onChangeText={setEditItemCategory}
                    mode="outlined"
                    placeholder="Ví dụ: Dairy, Protein, Bakery..."
                  />
                </View>

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
                    disabled={loading}
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
